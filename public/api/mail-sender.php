<?php
/**
 * Send inquiry mail via authenticated SMTP (Hostinger) or PHP mail() fallback.
 */

function inquiry_load_config(): array
{
    $defaults = [
        'resend_api_key' => getenv('RESEND_API_KEY') ?: '',
        'smtp_host' => 'smtp.hostinger.com',
        'smtp_port' => 465,
        'smtp_secure' => 'ssl',
        'smtp_user' => 'custom@aircoolercover.com',
        'smtp_pass' => '',
        'from_email' => getenv('INQUIRY_FROM') ?: 'custom@aircoolercover.com',
        'from_name' => 'CoolerFit Website',
        'to_email' => getenv('INQUIRY_TO') ?: 'custom@aircoolercover.com',
    ];

    $local = __DIR__ . '/inquiry-config.local.php';
    if (is_readable($local)) {
        $loaded = require $local;
        if (is_array($loaded)) {
            return array_merge($defaults, $loaded);
        }
    }

    return $defaults;
}

function inquiry_resend_send(
    array $config,
    string $subject,
    string $bodyText,
    string $replyToName,
    string $replyToEmail,
    ?array $attachment = null,
): bool {
    $apiKey = trim((string)($config['resend_api_key'] ?? ''));
    if ($apiKey === '' || !function_exists('curl_init')) {
        return false;
    }

    $fromEmail = (string)$config['from_email'];
    $fromName = (string)$config['from_name'];
    $toEmail = (string)$config['to_email'];
    $payload = [
        'from' => "$fromName <$fromEmail>",
        'to' => [$toEmail],
        'subject' => $subject,
        'text' => $bodyText,
        'reply_to' => "$replyToName <$replyToEmail>",
    ];

    if ($attachment) {
        $payload['attachments'] = [[
            'filename' => $attachment['name'],
            'content' => base64_encode($attachment['data']),
            'content_type' => $attachment['mime'],
        ]];
    }

    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }

    $curl = curl_init('https://api.resend.com/emails');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
            'User-Agent: CoolerFit-Inquiry/1.0',
        ],
        CURLOPT_POSTFIELDS => $json,
    ]);
    $response = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    return $response !== false && $status >= 200 && $status < 300;
}

function inquiry_encode_header(string $value): string
{
    $value = trim((string)preg_replace('/[\r\n]+/', ' ', $value));
    return preg_match('/[^\x20-\x7E]/', $value)
        ? '=?' . 'UTF-8' . '?B?' . base64_encode($value) . '?='
        : $value;
}

function inquiry_build_message(
    string $bodyText,
    string $fromEmail,
    string $fromName,
    string $toEmail,
    string $replyToName,
    string $replyToEmail,
    string $subject,
    ?array $attachment = null,
): string {
    $fromHeader = inquiry_encode_header($fromName) . " <{$fromEmail}>";
    $replyHeader = inquiry_encode_header($replyToName) . " <{$replyToEmail}>";
    $domain = substr(strrchr($fromEmail, '@') ?: '@aircoolercover.com', 1) ?: 'aircoolercover.com';
    $messageId = '<inquiry.' . bin2hex(random_bytes(8)) . '@' . $domain . '>';

    $encodedSubject = inquiry_encode_header($subject);

    $headers = [
        'Date: ' . date(DATE_RFC2822),
        "Subject: {$encodedSubject}",
        "From: {$fromHeader}",
        "To: {$toEmail}",
        "Reply-To: {$replyHeader}",
        'MIME-Version: 1.0',
        "Message-ID: {$messageId}",
        'X-Mailer: CoolerFit-Inquiry',
    ];

    if ($attachment) {
        $boundary = 'b_' . bin2hex(random_bytes(8));
        $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";

        $message = "--{$boundary}\r\n";
        $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
        $message .= $bodyText . "\r\n\r\n";
        $message .= "--{$boundary}\r\n";
        $message .= "Content-Type: {$attachment['mime']}; name=\"{$attachment['name']}\"\r\n";
        $message .= "Content-Transfer-Encoding: base64\r\n";
        $message .= "Content-Disposition: attachment; filename=\"{$attachment['name']}\"\r\n\r\n";
        $message .= chunk_split(base64_encode($attachment['data'])) . "\r\n";
        $message .= "--{$boundary}--";
    } else {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $message = $bodyText;
    }

    return implode("\r\n", $headers) . "\r\n\r\n" . $message;
}

function inquiry_smtp_send(array $config, string $rawMessage, string $toEmail, string $fromEmail): bool
{
    $host = $config['smtp_host'];
    $port = (int)$config['smtp_port'];
    $secure = $config['smtp_secure'] ?? 'ssl';
    $remote = ($secure === 'ssl' ? 'ssl://' : '') . $host . ':' . $port;

    $socket = @stream_socket_client(
        $remote,
        $errno,
        $errstr,
        20,
        STREAM_CLIENT_CONNECT,
        stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]),
    );

    if (!$socket) {
        return false;
    }

    stream_set_timeout($socket, 20);

    $read = function () use ($socket): string {
        $data = '';
        while ($line = fgets($socket, 515)) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $data;
    };

    $cmd = function (string $command, array $acceptedClasses = ['2']) use ($socket, $read): bool {
        fwrite($socket, $command . "\r\n");
        $resp = $read();
        return isset($resp[0]) && in_array($resp[0], $acceptedClasses, true);
    };

    $read(); // banner
    if (!$cmd('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'aircoolercover.com'))) {
        fclose($socket);
        return false;
    }

    if ($secure === 'tls') {
        if (!$cmd('STARTTLS')) {
            fclose($socket);
            return false;
        }
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        if (!$cmd('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'aircoolercover.com'))) {
            fclose($socket);
            return false;
        }
    }

    $user = $config['smtp_user'];
    $pass = $config['smtp_pass'];
    if ($user !== '' && $pass !== '') {
        fwrite($socket, "AUTH LOGIN\r\n");
        $read();
        fwrite($socket, base64_encode($user) . "\r\n");
        $read();
        fwrite($socket, base64_encode($pass) . "\r\n");
        $authResp = $read();
        if (!isset($authResp[0]) || $authResp[0] !== '2') {
            fclose($socket);
            return false;
        }
    }

    if (!$cmd("MAIL FROM:<{$fromEmail}>")) {
        fclose($socket);
        return false;
    }
    if (!$cmd("RCPT TO:<{$toEmail}>")) {
        fclose($socket);
        return false;
    }
    // DATA is accepted with SMTP 354 (a 3xx intermediate response), not 2xx.
    if (!$cmd('DATA', ['3'])) {
        fclose($socket);
        return false;
    }

    // SMTP dot-stuffing prevents a body line beginning with a dot from ending DATA early.
    $smtpPayload = preg_replace('/(?m)^\./', '..', $rawMessage) ?? $rawMessage;
    fwrite($socket, $smtpPayload . "\r\n.\r\n");
    $dataResp = $read();
    $cmd('QUIT');
    fclose($socket);

    return isset($dataResp[0]) && $dataResp[0] === '2';
}

function inquiry_send_mail(
    string $subject,
    string $bodyText,
    string $replyToName,
    string $replyToEmail,
    ?array $attachment = null,
): bool {
    $config = inquiry_load_config();
    $fromEmail = $config['from_email'];
    $fromName = $config['from_name'];
    $toEmail = $config['to_email'];

    // When Resend is configured it is the authoritative transport. Do not
    // silently fall back to PHP mail(), which obscures delivery failures.
    if (!empty($config['resend_api_key'])) {
        return inquiry_resend_send(
            $config,
            $subject,
            $bodyText,
            $replyToName,
            $replyToEmail,
            $attachment,
        );
    }

    $raw = inquiry_build_message(
        $bodyText,
        $fromEmail,
        $fromName,
        $toEmail,
        $replyToName,
        $replyToEmail,
        $subject,
        $attachment,
    );

    if (!empty($config['smtp_pass'])) {
        if (inquiry_smtp_send($config, $raw, $toEmail, $fromEmail)) {
            return true;
        }
    }

    $parts = explode("\r\n\r\n", $raw, 2);
    $headerLines = explode("\r\n", $parts[0]);
    $headerLines = array_values(array_filter($headerLines, static function (string $line): bool {
        return stripos($line, 'Subject:') !== 0 && stripos($line, 'To:') !== 0;
    }));
    $headerBlock = implode("\r\n", $headerLines);
    $body = $parts[1] ?? $bodyText;

    return mail($toEmail, inquiry_encode_header($subject), $body, $headerBlock);
}

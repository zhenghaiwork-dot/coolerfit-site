<?php
/**
 * Lightweight anti-spam for inquiry.php (honeypot, timing, IP rate limit).
 */

function inquiry_client_ip(): string
{
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return trim((string)$_SERVER['HTTP_CF_CONNECTING_IP']);
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return trim((string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'));
}

/** @return true if request looks like spam (caller should fake success) */
function inquiry_is_honeypot_tripped(): bool
{
    $trap = trim((string)($_POST['website'] ?? ''));
    return $trap !== '';
}

/** @return true if submitted too fast for a human */
function inquiry_is_too_fast(): bool
{
    $started = (int)($_POST['formStartedAt'] ?? 0);
    if ($started <= 0) {
        return false;
    }
    $elapsedMs = (int)(microtime(true) * 1000) - $started;
    return $elapsedMs < 3000;
}

/** @return true if rate limit exceeded (return 429 to caller) */
function inquiry_rate_limit_exceeded(): bool
{
    $ip = inquiry_client_ip();
    $hash = hash('sha256', $ip);
    $dir = __DIR__ . '/.rate-limit';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $file = $dir . '/' . $hash . '.json';
    $now = time();
    $windowHour = 3600;
    $windowDay = 86400;
    $maxHour = 5;
    $maxDay = 20;

    $data = ['t' => []];
    if (is_readable($file)) {
        $decoded = json_decode((string)file_get_contents($file), true);
        if (is_array($decoded) && isset($decoded['t']) && is_array($decoded['t'])) {
            $data = $decoded;
        }
    }

    $data['t'] = array_values(array_filter($data['t'], static fn($ts) => ($now - (int)$ts) < $windowDay));
    $recentHour = count(array_filter($data['t'], static fn($ts) => ($now - (int)$ts) < $windowHour));

    if ($recentHour >= $maxHour || count($data['t']) >= $maxDay) {
        return true;
    }

    $data['t'][] = $now;
    file_put_contents($file, json_encode($data), LOCK_EX);

    return false;
}

function inquiry_has_excessive_links(string $text): bool
{
    if ($text === '') {
        return false;
    }
    return preg_match_all('/https?:\\/\\/|www\\./i', $text) >= 4;
}

function inquiry_fake_success(): void
{
    echo json_encode(['ok' => true]);
    exit;
}

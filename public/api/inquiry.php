<?php
/**
 * Hostinger inquiry handler — emails quote requests to custom@aircoolercover.com
 * Uses authenticated SMTP when inquiry-config.local.php is present (reduces spam).
 */
header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://aircoolercover.com',
    'https://www.aircoolercover.com',
];
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Origin not allowed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/mail-sender.php';
require_once __DIR__ . '/inquiry-guard.php';

function field(string $key): string {
    return trim((string)($_POST[$key] ?? ''));
}

if (inquiry_rate_limit_exceeded()) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Too many requests. Please wait a while and try again.']);
    exit;
}

if (inquiry_is_honeypot_tripped() || inquiry_is_too_fast()) {
    inquiry_fake_success();
}

$name = field('name');
$email = field('email');

if ($name === '' || $email === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Name and email are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid email']);
    exit;
}

if (strlen($name) > 100 || strlen($email) > 255) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid input']);
    exit;
}

$combinedText = implode("\n", array_filter([
    field('message'),
    field('notes'),
    field('company'),
    field('coverType'),
]));

if (inquiry_has_excessive_links($combinedText)) {
    inquiry_fake_success();
}

$formType = field('formType') ?: 'simple';
$productName = field('productName');
$subjectProduct = $productName !== '' ? " — $productName" : '';
$subject = "CoolerFit Quote Request ($formType)$subjectProduct";

$lines = [
    "Form: $formType",
    "Name: $name",
    "Email: $email",
];

$optional = [
    'phone' => 'Phone',
    'company' => 'Company',
    'productName' => 'Product',
    'productSlug' => 'Product slug',
    'coverType' => 'Cover type',
    'quantity' => 'Quantity',
    'dimensions' => 'Dimensions',
    'material' => 'Material',
    'color' => 'Color',
    'openingDesign' => 'Opening / cutout',
    'logoPosition' => 'Logo position',
    'message' => 'Message',
    'notes' => 'Notes',
    'pageUrl' => 'Submitted from',
];

foreach ($optional as $key => $label) {
    $val = field($key);
    if ($val !== '') {
        $lines[] = "$label: $val";
    }
}

$width = field('width');
$height = field('height');
$depth = field('depth');
if ($width !== '' || $height !== '' || $depth !== '') {
    $unit = field('sizeUnit') ?: 'cm';
    $lines[] = "Custom size: " . ($width ?: '—') . " W × " . ($height ?: '—') . " H × " . ($depth ?: '—') . " D ($unit)";
}

$bodyText = implode("\n", $lines);

$attachment = null;
$logoTmp = $_FILES['logo']['tmp_name'] ?? '';
$logoName = $_FILES['logo']['name'] ?? '';
$logoError = $_FILES['logo']['error'] ?? UPLOAD_ERR_NO_FILE;
if ($logoError === UPLOAD_ERR_OK && is_uploaded_file($logoTmp)) {
    $maxLogoBytes = 5 * 1024 * 1024;
    $logoSize = (int)($_FILES['logo']['size'] ?? 0);
    if ($logoSize <= 0 || $logoSize > $maxLogoBytes) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Logo must be 5 MB or smaller']);
        exit;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $logoTmp) ?: 'application/octet-stream';
    finfo_close($finfo);
    $allowedLogoTypes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];
    if (!isset($allowedLogoTypes[$mime])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Logo must be JPG, PNG, WebP, or PDF']);
        exit;
    }
    $safeBaseName = preg_replace('/[^A-Za-z0-9._-]/', '-', pathinfo($logoName, PATHINFO_FILENAME)) ?: 'logo';
    $safeLogoName = substr($safeBaseName, 0, 80) . '.' . $allowedLogoTypes[$mime];
    $attachment = [
        'name' => $safeLogoName,
        'mime' => $mime,
        'data' => file_get_contents($logoTmp),
    ];
}

$sent = inquiry_send_mail($subject, $bodyText, $name, $email, $attachment);

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail delivery failed']);
    exit;
}

echo json_encode(['ok' => true]);

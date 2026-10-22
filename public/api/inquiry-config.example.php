<?php
/**
 * Copy this file to inquiry-config.local.php on the server (same folder).
 * Do NOT commit inquiry-config.local.php — it contains your mailbox password.
 *
 * Hostinger → Emails → custom@aircoolercover.com → Configuration → SMTP settings
 *
 * Preferred production setup: configure RESEND_API_KEY, INQUIRY_TO and
 * INQUIRY_FROM as Hostinger environment variables. The SMTP values below are
 * retained only for installations that do not use Resend.
 */
return [
    'resend_api_key' => '',
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_secure' => 'ssl', // ssl for 465, tls for 587
    'smtp_user' => 'custom@aircoolercover.com',
    'smtp_pass' => 'YOUR_MAILBOX_PASSWORD_HERE',

    'from_email' => 'custom@aircoolercover.com',
    'from_name' => 'CoolerFit Website',
    'to_email' => 'custom@aircoolercover.com',
];

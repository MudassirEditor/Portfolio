<?php
header('Content-Type: text/plain; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit('Only POST requests are accepted.');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  exit('Please provide a valid name, email, subject, and message.');
}

$recipient = 'mudassirtheeditor@gmail.com';
$safeSubject = str_replace(["\r", "\n"], '', $subject);
$safeName = str_replace(["\r", "\n"], '', $name);
$body = "Name: {$safeName}\nEmail: {$email}\n\nMessage:\n{$message}";
$headers = [
  'From: Website Contact Form <mudassirtheeditor@gmail.com>',
  'Reply-To: ' . $email,
  'Content-Type: text/plain; charset=UTF-8'
];

if (mail($recipient, $safeSubject, $body, implode("\r\n", $headers))) {
  echo 'OK';
} else {
  http_response_code(500);
  echo 'The message could not be sent. Please email mudassirtheeditor@gmail.com directly.';
}
?>

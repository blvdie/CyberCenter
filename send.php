<?php
header('Content-Type: application/json');

$token = "8877843737:AAHmFvKDlvlR7JH4Q1xOE6VMEPA42XKSguw";
$chatId = "2004552725";

$name    = isset($_POST['name'])    ? trim($_POST['name'])    : '';
$phone   = isset($_POST['phone'])   ? trim($_POST['phone'])   : '';
$date    = isset($_POST['date'])    ? trim($_POST['date'])    : '';
$time    = isset($_POST['time'])    ? trim($_POST['time'])    : '';
$zone    = isset($_POST['zone'])    ? trim($_POST['zone'])    : '';

if (!$name || !$phone || !$date || !$time || !$zone) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Заполните все поля']);
    exit;
}

$name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$phone   = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$date    = htmlspecialchars($date, ENT_QUOTES, 'UTF-8');
$time    = htmlspecialchars($time, ENT_QUOTES, 'UTF-8');
$zone    = htmlspecialchars($zone, ENT_QUOTES, 'UTF-8');

$text = "<b>🔥 НОВАЯ БРОНЬ</b>\n\n"
      . "<b>Имя:</b> $name\n"
      . "<b>Телефон:</b> $phone\n"
      . "<b>Дата:</b> $date\n"
      . "<b>Время:</b> $time\n"
      . "<b>Зона:</b> $zone";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.telegram.org/bot$token/sendMessage");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'chat_id'    => $chatId,
    'text'       => $text,
    'parse_mode' => 'HTML'
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($result && $httpCode === 200) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка отправки']);
}
?>

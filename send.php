<?php
header('Content-Type: application/json; charset=utf-8');

$token  = "СЮДА ТОКЕН ИЗ ЧАТА";
$chatId = "СЮДА АЙДИ ИЗ ЧАТА";

if (!empty($_POST['website'])) {
    echo json_encode(['status' => 'success']);
    exit;
}

$name  = isset($_POST['name'])  ? trim($_POST['name'])  : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$date  = isset($_POST['date'])  ? trim($_POST['date'])  : '';
$time  = isset($_POST['time'])  ? trim($_POST['time'])  : '';
$zone  = isset($_POST['zone'])  ? trim($_POST['zone'])  : '';

$digits = preg_replace('/\D/', '', $phone);
if (mb_strlen($name) < 2 || mb_strlen($name) > 100
    || strlen($digits) < 10 || strlen($digits) > 15
    || !$date || !$time || !$zone) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Проверьте правильность заполнения полей']);
    exit;
}

$csvCell = function ($v) {
    $v = str_replace(["\r", "\n", "\t"], ' ', (string)$v);
    if ($v !== '' && strpos('=+-@', $v[0]) !== false) $v = "'" . $v; // защита от CSV-инъекций
    return '"' . str_replace('"', '""', $v) . '"';
};
$logLine = implode(';', array_map($csvCell, [
    date('Y-m-d H:i:s'), $name, $phone, $date, $time, $zone,
    isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : ''
])) . "\n";
@file_put_contents(dirname(__DIR__) . '/bookings.csv', $logLine, FILE_APPEND | LOCK_EX);

$e = function ($v) { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); };

$text = "<b>🔥 НОВАЯ БРОНЬ</b>\n\n"
      . "<b>Имя:</b> "     . $e($name)  . "\n"
      . "<b>Телефон:</b> " . $e($phone) . "\n"
      . "<b>Дата:</b> "    . $e($date)  . "\n"
      . "<b>Время:</b> "   . $e($time)  . "\n"
      . "<b>Зона:</b> "    . $e($zone);

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
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

$result   = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($result && $httpCode === 200) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Не удалось отправить заявку']);
}

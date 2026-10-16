<?php
// backend/src/users.php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['GET', 'POST', 'PUT'], true)) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan']);
    exit;
}

$data = json_decode(file_get_contents('php://input'));
if ($method === 'POST') {
    $data = (object) $_POST;
}
if ($method === 'GET') {
    $data = (object) $_GET;
}
if (!is_object($data)) {
    $data = (object) [];
}

$token = trim($data->token ?? '');
if ($token === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'pesan' => 'Silahkan login terlebih dahulu']);
    exit;
}

verifyToken($token);

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, username, email, nama_lengkap, nomor_hp, foto, created_at FROM users WHERE token=? LIMIT 1');
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    echo json_encode(['status' => 'success', 'user' => $user]);
    $conn->close();
    exit;
}

$username = trim($data->username ?? '');
$email = trim($data->email ?? '');
$namaLengkap = trim($data->nama_lengkap ?? '');
$nomorHp = trim($data->nomor_hp ?? '');
$password = trim($data->password ?? '');

if ($username === '' || $email === '' || $namaLengkap === '' || $nomorHp === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'pesan' => 'Data user tidak boleh kosong']);
    exit;
}

$stmtUser = $conn->prepare('SELECT foto FROM users WHERE token=? LIMIT 1');
$stmtUser->bind_param('s', $token);
$stmtUser->execute();
$currentUser = $stmtUser->get_result()->fetch_assoc();
$stmtUser->close();
$upload = savePortfolioImage('foto');
if ($upload['error']) {
    http_response_code($upload['status']);
    echo json_encode(['status' => 'error', 'message' => $upload['error']]);
    exit;
}

$newFoto = $upload['filename'];
$foto = $currentUser['foto'] ?? '';
if ($newFoto !== null) {
    $foto = $newFoto;
}

$stmt = null;
try {
    if ($password !== '') {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare('UPDATE users SET username=?, email=?, `password`=?, nama_lengkap=?, nomor_hp=?, foto=? WHERE token=? LIMIT 1');
        $stmt->bind_param('sssssss', $username, $email, $passwordHash, $namaLengkap, $nomorHp, $foto, $token);
    } else {
        $stmt = $conn->prepare('UPDATE users SET username=?, email=?, nama_lengkap=?, nomor_hp=?, foto=? WHERE token=? LIMIT 1');
        $stmt->bind_param('ssssss', $username, $email, $namaLengkap, $nomorHp, $foto, $token);
    }

    $updateSucceeded = $stmt->execute();
    $stmt->close();
    $stmt = null;
} catch (mysqli_sql_exception $exception) {
    error_log('Failed to update portfolio user: ' . $exception->getMessage());
    if ($stmt instanceof mysqli_stmt) {
        $stmt->close();
    }
    $updateSucceeded = false;
}

if (!$updateSucceeded) {
    deletePortfolioImage($newFoto);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui data user']);
    $conn->close();
    exit;
}

if ($newFoto !== null) {
    deletePortfolioImage($currentUser['foto'] ?? null);
}
echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui data user']);
$conn->close();
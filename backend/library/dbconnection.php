<?php
// backend/library/dbconnection.php

require_once __DIR__ . '/environment.php';

define('DB_HOST', getenv('DB_HOST') !== false ? getenv('DB_HOST') : '127.0.0.1');
define('DB_USER', getenv('DB_USER') !== false ? getenv('DB_USER') : 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_NAME', getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'portofolio');

// Membuat koneksi ke server database MySQL
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

// Cek apakah koneksi berhasil
if ($conn->connect_error) {
    die('Koneksi gagal: ' . $conn->connect_error);
}

// Coba memilih database target
try {
    $conn->select_db(DB_NAME);
} catch (mysqli_sql_exception $e) {
    // Database belum ada (normal terjadi saat menjalankan migrasi pertama kali)
}

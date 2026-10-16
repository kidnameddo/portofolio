<?php
// backend/library/environment.php

function loadBackendEnvironment()
{
    $envFile = __DIR__ . '/../.env';
    if (!is_file($envFile)) {
        return;
    }

    if (!is_readable($envFile)) {
        error_log('Backend environment file is not readable: ' . $envFile);
        throw new RuntimeException('Backend environment file is not readable.');
    }

    $lines = file($envFile, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        error_log('Failed to read backend environment file: ' . $envFile);
        throw new RuntimeException('Failed to read backend environment file.');
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }

        if (!preg_match('/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/', $line, $matches)) {
            throw new RuntimeException('Invalid entry in backend environment file.');
        }

        $name = $matches[1];
        $value = trim($matches[2]);
        if (strlen($value) >= 2 && (($value[0] === '"' && substr($value, -1) === '"') || ($value[0] === "'" && substr($value, -1) === "'"))) {
            $value = substr($value, 1, -1);
        }

        $existingValue = getenv($name);
        if ($existingValue === false || $existingValue === '') {
            putenv($name . '=' . $value);
        }
    }
}

loadBackendEnvironment();

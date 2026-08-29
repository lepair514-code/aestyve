<?php
/**
 * Aestyve 관리자 API
 * - 로그인 / 로그아웃 / 비밀번호 변경
 * - 텍스트 콘텐츠 저장 (../content.json)
 * - 이미지 교체 업로드 (../assets/*)
 *
 * 이 파일 하나로 모든 관리자 동작을 처리합니다.
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

$ROOT       = dirname(__DIR__);              // 웹 루트 (site/)
$ADMIN_DIR  = __DIR__;                        // site/admin
$AUTH_FILE  = $ADMIN_DIR . '/auth.json';
$CONTENT_FILE = $ROOT . '/content.json';
$ASSETS_DIR = $ROOT . '/assets';

$MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB
$ALLOWED_EXT = ['webp', 'png', 'jpg', 'jpeg', 'svg'];

function respond($ok, $data = [], $code = 200) {
    http_response_code($code);
    echo json_encode(array_merge(['ok' => $ok], $data), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function require_login() {
    if (empty($_SESSION['aestyve_admin'])) {
        respond(false, ['error' => 'unauthorized'], 401);
    }
}

function require_csrf() {
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf'] ?? '');
    if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], (string)$sent)) {
        respond(false, ['error' => 'bad_csrf'], 403);
    }
}

function read_json_body() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function file_lock_write($path, $content) {
    $fp = fopen($path, 'c');
    if (!$fp) return false;
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, $content);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

$action = $_GET['action'] ?? '';

// ---------------------------------------------------------------
// 로그인
// ---------------------------------------------------------------
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = read_json_body();
    $password = (string)($body['password'] ?? '');

    $auth = json_decode(@file_get_contents($AUTH_FILE), true);
    $hash = $auth['hash'] ?? '';

    // 간단한 무차별 대입 방지 (요청 간 최소 지연)
    usleep(300000);

    if ($hash && password_verify($password, $hash)) {
        session_regenerate_id(true);
        $_SESSION['aestyve_admin'] = true;
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
        respond(true, ['csrf' => $_SESSION['csrf']]);
    }
    respond(false, ['error' => 'invalid_password'], 401);
}

// ---------------------------------------------------------------
// 로그아웃
// ---------------------------------------------------------------
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    respond(true);
}

// ---------------------------------------------------------------
// 로그인 상태 확인
// ---------------------------------------------------------------
if ($action === 'session') {
    if (!empty($_SESSION['aestyve_admin'])) {
        if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24));
        respond(true, ['loggedIn' => true, 'csrf' => $_SESSION['csrf']]);
    }
    respond(true, ['loggedIn' => false]);
}

// ---------------------------------------------------------------
// 비밀번호 변경
// ---------------------------------------------------------------
if ($action === 'change_password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_login();
    require_csrf();
    $body = read_json_body();
    $old = (string)($body['old'] ?? '');
    $new = (string)($body['new'] ?? '');

    $auth = json_decode(@file_get_contents($AUTH_FILE), true);
    $hash = $auth['hash'] ?? '';

    if (!$hash || !password_verify($old, $hash)) {
        respond(false, ['error' => 'wrong_old_password'], 400);
    }
    if (strlen($new) < 8) {
        respond(false, ['error' => 'new_password_too_short'], 400);
    }
    $newHash = password_hash($new, PASSWORD_DEFAULT);
    file_lock_write($AUTH_FILE, json_encode(['hash' => $newHash]));
    respond(true);
}

// ---------------------------------------------------------------
// 이미지 목록 (assets 폴더 스캔)
// ---------------------------------------------------------------
if ($action === 'images') {
    require_login();
    $files = [];
    foreach (scandir($ASSETS_DIR) as $f) {
        if ($f === '.' || $f === '..') continue;
        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        if (!in_array($ext, $ALLOWED_EXT, true)) continue;
        $full = $ASSETS_DIR . '/' . $f;
        $files[] = [
            'name'  => $f,
            'size'  => filesize($full),
            'mtime' => filemtime($full),
        ];
    }
    usort($files, fn($a, $b) => strcmp($a['name'], $b['name']));
    respond(true, ['files' => $files]);
}

// ---------------------------------------------------------------
// 텍스트 콘텐츠 저장
// ---------------------------------------------------------------
if ($action === 'save_text' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_login();
    require_csrf();
    $updates = read_json_body(); // { key: newValue, ... }

    $current = json_decode(@file_get_contents($CONTENT_FILE), true);
    if (!is_array($current)) $current = [];

    foreach ($updates as $key => $val) {
        if (!isset($current[$key])) continue; // 존재하는 키만 갱신 (임의 키 주입 방지)
        $val = (string)$val;
        // 관리자만 접근 가능하지만 최소한의 방어 차원에서 <script> 제거
        $val = preg_replace('/<script.*?<\/script>/is', '', $val);
        $current[$key]['value'] = $val;
    }

    file_lock_write($CONTENT_FILE, json_encode($current, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    respond(true);
}

// ---------------------------------------------------------------
// 이미지 업로드 (기존 파일을 그대로 덮어써서 즉시 반영)
// ---------------------------------------------------------------
if ($action === 'upload_image' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_login();
    require_csrf();

    $target = basename((string)($_POST['target'] ?? ''));
    $targetPath = $ASSETS_DIR . '/' . $target;

    // 기존에 존재하는 파일만 교체 가능 (경로 조작/신규 파일 생성 방지)
    if ($target === '' || !is_file($targetPath) || strpos(realpath($targetPath), realpath($ASSETS_DIR)) !== 0) {
        respond(false, ['error' => 'invalid_target'], 400);
    }

    if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        respond(false, ['error' => 'upload_failed'], 400);
    }
    if ($_FILES['image']['size'] > $MAX_UPLOAD_BYTES) {
        respond(false, ['error' => 'file_too_large'], 400);
    }

    $targetExt = strtolower(pathinfo($target, PATHINFO_EXTENSION));
    $tmpPath = $_FILES['image']['tmp_name'];

    if ($targetExt === 'svg') {
        $svg = file_get_contents($tmpPath);
        if (stripos($svg, '<svg') === false) {
            respond(false, ['error' => 'not_svg'], 400);
        }
        // 스크립트/이벤트 핸들러 제거 (기본적인 정화)
        $svg = preg_replace('/<script.*?<\/script>/is', '', $svg);
        $svg = preg_replace('/on\w+\s*=\s*"[^"]*"/i', '', $svg);
        file_lock_write($targetPath, $svg);
        respond(true, ['name' => $target, 'mtime' => filemtime($targetPath)]);
    }

    if (!extension_loaded('gd')) {
        respond(false, ['error' => 'gd_not_available_ask_host_to_enable_php_gd'], 500);
    }

    $info = @getimagesize($tmpPath);
    if (!$info) {
        respond(false, ['error' => 'not_an_image'], 400);
    }

    $mime = $info['mime'];
    $srcImg = null;
    switch ($mime) {
        case 'image/jpeg': if (function_exists('imagecreatefromjpeg')) $srcImg = @imagecreatefromjpeg($tmpPath); break;
        case 'image/png':  if (function_exists('imagecreatefrompng'))  $srcImg = @imagecreatefrompng($tmpPath); break;
        case 'image/webp': if (function_exists('imagecreatefromwebp')) $srcImg = @imagecreatefromwebp($tmpPath); break;
        case 'image/gif':  if (function_exists('imagecreatefromgif'))  $srcImg = @imagecreatefromgif($tmpPath); break;
    }

    if (!$srcImg) {
        respond(false, ['error' => 'unsupported_image_type'], 400);
    }

    imagepalettetotruecolor($srcImg);
    imagealphablending($srcImg, true);
    imagesavealpha($srcImg, true);

    $ok = false;
    if ($targetExt === 'webp' && function_exists('imagewebp')) {
        $ok = imagewebp($srcImg, $targetPath, 92);
    } elseif ($targetExt === 'png' && function_exists('imagepng')) {
        $ok = imagepng($srcImg, $targetPath, 6);
    } elseif (in_array($targetExt, ['jpg', 'jpeg'], true) && function_exists('imagejpeg')) {
        $ok = imagejpeg($srcImg, $targetPath, 90);
    }
    imagedestroy($srcImg);

    if (!$ok) {
        respond(false, ['error' => 'save_failed_target_format_unsupported_by_server'], 500);
    }
    respond(true, ['name' => $target, 'mtime' => filemtime($targetPath)]);
}

respond(false, ['error' => 'unknown_action'], 404);

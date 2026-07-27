<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
    exit();
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No se recibió ningún archivo válido']);
    exit();
}

$file = $_FILES['file'];
$tmpPath = $file['tmp_name'];
$originalName = basename($file['name']);
$fileSize = $file['size'];
$fileType = mime_content_type($tmpPath) ?: $file['type'];

// Configuración de Backblaze B2 S3
$bucket = 'Barilochesuite';
$keyId = '00429a18a8ece8c0000000009';
$secretKey = 'K004y+xZSybuU2z6b51Qp0ncILi0Nf8';
$region = 'us-west-004';
$host = "{$bucket}.s3.{$region}.backblazeb2.com";

// Sanitizar nombre de archivo y generar Key única
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm', 'svg'];

if (!in_array($ext, $allowedExts)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Formato de archivo no permitido']);
    exit();
}

$prefix = in_array($ext, ['mp4', 'mov', 'webm']) ? 'videos/' : 'fotos/';
$objectKey = $prefix . time() . '_' . preg_replace('/[^a-zA-Z0-9\._-]/', '', $originalName);

$payload = file_get_contents($tmpPath);
$payloadHash = hash('sha256', $payload);

$now = time();
$amzDate = gmdate('Ymd\THis\Z', $now);
$dateStamp = gmdate('Ymd', $now);

// Firma AWS V4
$canonicalUri = '/' . implode('/', array_map('rawurlencode', explode('/', $objectKey)));
$canonicalHeaders = "host:{$host}\nx-amz-content-sha256:{$payloadHash}\nx-amz-date:{$amzDate}\n";
$signedHeaders = "host;x-amz-content-sha256;x-amz-date";
$canonicalRequest = "PUT\n{$canonicalUri}\n\n{$canonicalHeaders}\n{$signedHeaders}\n{$payloadHash}";

$algorithm = 'AWS4-HMAC-SHA256';
$credentialScope = "{$dateStamp}/{$region}/s3/aws4_request";
$stringToSign = "{$algorithm}\n{$amzDate}\n{$credentialScope}\n" . hash('sha256', $canonicalRequest);

$kDate = hash_hmac('sha256', $dateStamp, "AWS4{$secretKey}", true);
$kRegion = hash_hmac('sha256', $region, $kDate, true);
$kService = hash_hmac('sha256', 's3', $kRegion, true);
$kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
$signature = hash_hmac('sha256', $stringToSign, $kSigning);

$authorizationHeader = "{$algorithm} Credential={$keyId}/{$credentialScope}, SignedHeaders={$signedHeaders}, Signature={$signature}";

// Envío cURL a Backblaze B2 S3
$url = "https://{$host}/{$objectKey}";
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_PUT => true,
    CURLOPT_INFILE => fopen($tmpPath, 'rb'),
    CURLOPT_INFILESIZE => $fileSize,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Host: {$host}",
        "x-amz-date: {$amzDate}",
        "x-amz-content-sha256: {$payloadHash}",
        "Content-Type: {$fileType}",
        "Authorization: {$authorizationHeader}"
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    $publicUrl = "https://{$host}/{$objectKey}";
    echo json_encode([
        'status' => 'success',
        'url' => $publicUrl,
        'objectKey' => $objectKey,
        'size' => $fileSize,
        'mime' => $fileType
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al subir a Backblaze B2. HTTP Code: ' . $httpCode,
        'details' => $response
    ]);
}
?>

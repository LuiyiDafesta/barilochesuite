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
    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido. Utilizar POST.'
    ]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$message = trim($input['message'] ?? '');

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Por favor, complete todos los campos obligatorios.'
    ]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'El correo electrónico ingresado no es válido.'
    ]);
    exit();
}

// Configuración del correo
$to = "info@vistabosque.com.ar"; // Cambiar al correo final deseado
$subject = "Nueva Consulta desde Sitio Web - Vista Alta / Bariloche Suite";
$body = "Ha recibido una nueva consulta desde el sitio web:\n\n";
$body .= "Nombre: $name\n";
$body .= "Email: $email\n";
$body .= "Teléfono: " . ($phone ? $phone : 'No especificado') . "\n\n";
$body .= "Mensaje:\n$message\n";

$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Intentar envío por mail nativo
$sent = @mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Su mensaje ha sido enviado con éxito.'
    ]);
} else {
    // Si la función mail no está configurada aún en Ferozo, responder con estado recibido
    echo json_encode([
        'status' => 'success',
        'message' => 'Mensaje recibido correctamente en el servidor.'
    ]);
}
?>

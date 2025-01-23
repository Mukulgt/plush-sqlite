<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = getPostData();
        
        if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            sendJSON(['error' => 'Invalid email address'], 400);
        }
        
        $conn = getConnection();
        
        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM newsletter_subscribers WHERE email = :email");
        $stmt->execute([':email' => $data['email']]);
        
        if ($stmt->fetch()) {
            sendJSON(['error' => 'Email already subscribed'], 400);
        }
        
        // Add new subscriber
        $stmt = $conn->prepare("
            INSERT INTO newsletter_subscribers (email, subscribed_at) 
            VALUES (:email, NOW())
        ");
        
        $stmt->execute([':email' => $data['email']]);
        
        sendJSON(['message' => 'Successfully subscribed to newsletter']);
    } catch(PDOException $e) {
        sendJSON(['error' => 'Failed to subscribe to newsletter'], 500);
    }
}

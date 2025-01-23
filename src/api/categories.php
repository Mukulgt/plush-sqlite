<?php
require_once 'config.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $conn = getConnection();
        $stmt = $conn->query("SELECT * FROM categories ORDER BY name");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendJSON($categories);
    } catch(PDOException $e) {
        sendJSON(['error' => 'Failed to fetch categories'], 500);
    }
}

// Handle POST request (for admin to add new categories)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check admin authentication here
        
        $data = getPostData();
        if (!isset($data['name'])) {
            sendJSON(['error' => 'Category name is required'], 400);
        }
        
        $conn = getConnection();
        $stmt = $conn->prepare("INSERT INTO categories (name) VALUES (:name)");
        $stmt->execute([':name' => $data['name']]);
        
        sendJSON(['message' => 'Category added successfully', 'id' => $conn->lastInsertId()]);
    } catch(PDOException $e) {
        sendJSON(['error' => 'Failed to add category'], 500);
    }
}

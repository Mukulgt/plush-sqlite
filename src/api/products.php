<?php
require_once 'config.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $conn = getConnection();
        
        // Build query based on filters
        $query = "SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE 1=1";
        $params = array();
        
        // Apply category filter
        if (!empty($_GET['category'])) {
            $query .= " AND p.category_id = :category";
            $params[':category'] = $_GET['category'];
        }
        
        // Apply price filters
        if (!empty($_GET['minPrice'])) {
            $query .= " AND p.price >= :minPrice";
            $params[':minPrice'] = $_GET['minPrice'];
        }
        if (!empty($_GET['maxPrice'])) {
            $query .= " AND p.price <= :maxPrice";
            $params[':maxPrice'] = $_GET['maxPrice'];
        }
        
        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendJSON($products);
    } catch(PDOException $e) {
        sendJSON(['error' => 'Failed to fetch products'], 500);
    }
}

// Handle POST request (for admin to add new products)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check admin authentication here
        
        $data = getPostData();
        if (!isset($data['name']) || !isset($data['price'])) {
            sendJSON(['error' => 'Missing required fields'], 400);
        }
        
        $conn = getConnection();
        $stmt = $conn->prepare("
            INSERT INTO products (name, description, price, image, category_id) 
            VALUES (:name, :description, :price, :image, :category_id)
        ");
        
        $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'] ?? '',
            ':price' => $data['price'],
            ':image' => $data['image'] ?? '',
            ':category_id' => $data['category_id'] ?? null
        ]);
        
        sendJSON(['message' => 'Product added successfully', 'id' => $conn->lastInsertId()]);
    } catch(PDOException $e) {
        sendJSON(['error' => 'Failed to add product'], 500);
    }
}

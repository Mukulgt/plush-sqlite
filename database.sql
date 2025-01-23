-- Create database
CREATE DATABASE IF NOT EXISTS plushoff_store;
USE plushoff_store;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    category_id INT,
    inventory INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name) VALUES
    ('Teddy Bears'),
    ('Animals'),
    ('Characters'),
    ('Baby Plush');

-- Insert sample products
INSERT INTO products (name, description, price, image, category_id, inventory) VALUES
    ('Classic Teddy Bear', 'A classic brown teddy bear perfect for cuddling', 19.99, 'images/products/teddy1.jpg', 1, 50),
    ('Panda Bear', 'Adorable black and white panda plush toy', 24.99, 'images/products/panda.jpg', 2, 30),
    ('Unicorn Plush', 'Magical unicorn with rainbow mane', 29.99, 'images/products/unicorn.jpg', 3, 25),
    ('Baby Elephant', 'Soft and cuddly elephant for babies', 15.99, 'images/products/elephant.jpg', 4, 40);

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;

-- Suppliers Table
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    supplier_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Sample Suppliers
INSERT INTO suppliers (name, email, phone) VALUES
('Tech Distributors Ltd', 'contact@techdist.com', '9876543210'),
('Global Supplies Co', 'info@globalsupplies.com', '9876543211'),
('Prime Materials Inc', 'sales@primemat.com', '9876543212');

-- Sample Products
INSERT INTO products (name, sku, price, stock, supplier_id) VALUES
('Laptop Dell XPS 15', 'SKU-LAP-001', 85000.00, 15, 1),
('Wireless Mouse Logitech', 'SKU-MOU-001', 1500.00, 50, 1),
('Mechanical Keyboard', 'SKU-KEY-001', 4500.00, 8, 2),
('Monitor 27 inch 4K', 'SKU-MON-001', 25000.00, 5, 2),
('USB-C Hub', 'SKU-HUB-001', 2500.00, 25, 3);
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
    res.json({ 
        status: 'API is running', 
        service: 'Enterprise Inventory & Order Management System',
        version: '1.0.0'
    });
});

// ============ PRODUCTS ============
// GET all products with supplier name (JOIN)
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, s.name AS supplier_name 
            FROM products p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.id DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST create new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, sku, price, stock, supplier_id } = req.body;
        if (!name || !sku || !price) {
            return res.status(400).json({ success: false, error: 'Name, SKU, and Price are required' });
        }
        const [result] = await db.query(
            'INSERT INTO products (name, sku, price, stock, supplier_id) VALUES (?, ?, ?, ?, ?)',
            [name, sku, price, stock || 0, supplier_id || null]
        );
        res.status(201).json({ success: true, id: result.insertId, message: 'Product created' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT update product stock
app.put('/api/products/:id/stock', async (req, res) => {
    try {
        const { stock } = req.body;
        await db.query('UPDATE products SET stock = ? WHERE id = ?', [stock, req.params.id]);
        res.json({ success: true, message: 'Stock updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ SUPPLIERS ============
app.get('/api/suppliers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM suppliers ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ ORDERS ============
// GET all orders with item count (complex JOIN + subquery)
app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT o.*, 
                   (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) AS total_items
            FROM orders o
            ORDER BY o.id DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST create order — automatically reduces stock
app.post('/api/orders', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { customer_name, items } = req.body;
        
        if (!customer_name || !items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Customer name and items are required' });
        }

        let totalAmount = 0;
        
        // Validate stock and calculate total
        for (const item of items) {
            const [productRows] = await connection.query('SELECT price, stock FROM products WHERE id = ?', [item.product_id]);
            if (productRows.length === 0) {
                throw new Error(`Product ${item.product_id} not found`);
            }
            if (productRows[0].stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}`);
            }
            totalAmount += productRows[0].price * item.quantity;
        }

        // Insert order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_name, total_amount, status) VALUES (?, ?, ?)',
            [customer_name, totalAmount, 'Pending']
        );
        const orderId = orderResult.insertId;

        // Insert order items and reduce stock
        for (const item of items) {
            const [productRows] = await connection.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, productRows[0].price]
            );
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, order_id: orderId, total_amount: totalAmount, message: 'Order created' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// PUT update order status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ DASHBOARD STATS ============
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [[productStats]] = await db.query(
            'SELECT COUNT(*) as total_products, SUM(stock) as total_stock, SUM(stock * price) as inventory_value FROM products'
        );
        const [[orderStats]] = await db.query(
            'SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue FROM orders'
        );
        const [[lowStock]] = await db.query(
            'SELECT COUNT(*) as low_stock_count FROM products WHERE stock < 10'
        );
        
        res.json({
            success: true,
            data: {
                total_products: productStats.total_products,
                total_stock: productStats.total_stock,
                inventory_value: parseFloat(productStats.inventory_value || 0),
                total_orders: orderStats.total_orders,
                total_revenue: parseFloat(orderStats.total_revenue || 0),
                low_stock_count: lowStock.low_stock_count
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ LOW STOCK ALERTS ============
app.get('/api/dashboard/low-stock', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, sku, stock, price FROM products WHERE stock < 10 ORDER BY stock ASC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ TOP SELLING PRODUCTS ============
app.get('/api/dashboard/top-products', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.unit_price) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints ready`);
});
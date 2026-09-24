# 🏢 Enterprise Inventory & Order Management System

**🔗 Live Demo:** (https://inventory-order-system-green.vercel.app)
**🔗 Backend API:** (https://inventory-order-system-8uxz.onrender.com)

A full-stack ERP-style application for product, supplier, and order management with real-time inventory tracking, KPI dashboards, and low-stock alerts.

## 🚀 Features
- **Product Management:** Add, view, and search products with supplier relationships
- **Order Processing:** Create orders with multiple items and automatic stock deduction using database transactions
- **KPI Dashboard:** Real-time metrics (inventory value, revenue, order count, low-stock alerts)
- **Data Visualization:** Top-selling products bar chart and low-stock distribution donut chart
- **Low Stock Alerts:** Automatic flags for products below 10 units
- **Status Workflow:** Orders move through Pending → Shipped → Delivered
- **Cloud Database:** MySQL hosted on Aiven Cloud with SSL

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, React Router, Recharts, Axios
- **Backend:** Node.js, Express.js, REST APIs
- **Database:** MySQL (Aiven Cloud), SQL (Joins, Subqueries, Transactions)
- **Deployment:** Vercel (Frontend), Render (Backend)
- **DevOps:** Git, GitHub

## ⚙️ Local Setup
1. Clone the repo: `git clone https://github.com/avantikaar/inventory-order-system.git`
2. Backend: `cd backend && npm install && npm run dev`
3. Frontend: `cd frontend && npm install && npm run dev`
4. Create `.env` files with your database credentials (see `.env.example`)


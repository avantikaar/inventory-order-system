import { useEffect, useState } from 'react';
import { getDashboardStats, getTopProducts, getLowStock } from '../api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);

    useEffect(() => {
        getDashboardStats().then(res => setStats(res.data.data));
        getTopProducts().then(res => setTopProducts(res.data.data));
        getLowStock().then(res => setLowStock(res.data.data));
    }, []);

    if (!stats) return (
        <div className="loading">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    );

    const cards = [
        { label: 'Total Products', value: stats.total_products, icon: '📦', accent: '#3b82f6', bg: '#dbeafe' },
        { label: 'Inventory Value', value: `₹${Number(stats.inventory_value).toLocaleString('en-IN')}`, icon: '💰', accent: '#10b981', bg: '#d1fae5' },
        { label: 'Total Orders', value: stats.total_orders, icon: '🛒', accent: '#8b5cf6', bg: '#ede9fe' },
        { label: 'Revenue', value: `₹${Number(stats.total_revenue).toLocaleString('en-IN')}`, icon: '📈', accent: '#f59e0b', bg: '#fef3c7' },
        { label: 'Total Stock', value: stats.total_stock, icon: '📊', accent: '#06b6d4', bg: '#cffafe' },
        { label: 'Low Stock Alerts', value: stats.low_stock_count, icon: '⚠️', accent: '#ef4444', bg: '#fee2e2' }
    ];

    return (
        <div className="page fade-in">
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">Real-time metrics across your inventory and orders</p>

            <div className="kpi-grid">
                {cards.map(card => (
                    <div key={card.label} className="kpi-card" style={{ '--accent': card.accent }}>
                        <div className="kpi-icon" style={{ background: card.bg }}>{card.icon}</div>
                        <p className="kpi-label">{card.label}</p>
                        <p className="kpi-value">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="chart-grid">
                <div className="chart-container">
                    <h3 className="chart-title">📊 Top Selling Products</h3>
                    <p className="chart-subtitle">By units sold across all orders</p>
                    {topProducts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📉</div>
                            <p>No orders yet. Create an order to see analytics.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="total_sold" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-container">
                    <h3 className="chart-title">⚠️ Low Stock Distribution</h3>
                    <p className="chart-subtitle">Products requiring immediate reorder</p>
                    {lowStock.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">✅</div>
                            <p>All products are well stocked!</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={lowStock}
                                    dataKey="stock"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={50}
                                    paddingAngle={4}
                                    label={({ name, stock }) => `${name}: ${stock}`}
                                >
                                    {lowStock.map((entry, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
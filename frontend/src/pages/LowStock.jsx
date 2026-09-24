import { useEffect, useState } from 'react';
import { getLowStock } from '../api';

const LowStock = () => {
    const [items, setItems] = useState([]);
    useEffect(() => { getLowStock().then(res => setItems(res.data.data)); }, []);

    return (
        <div className="page fade-in">
            <h1 className="page-title">⚠️ Low Stock Alerts</h1>
            <p className="page-subtitle">Products with stock below 10 units — reorder these soon</p>

            {items.length === 0 ? (
                <div className="chart-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">✅</div>
                        <p style={{ color: '#10b981', fontWeight: 600 }}>All products are well stocked!</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Stock</th>
                                <th>Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(p => (
                                <tr key={p.id}>
                                    <td>#{p.id}</td>
                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{p.sku}</td>
                                    <td className="stock-low">{p.stock}</td>
                                    <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                                    <td><span className="badge badge-low">Reorder Now</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LowStock;
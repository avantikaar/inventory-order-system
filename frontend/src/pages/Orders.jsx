import { useEffect, useState } from 'react';
import { getOrders, getProducts, createOrder, updateOrderStatus } from '../api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
    const [showForm, setShowForm] = useState(false);

    const load = () => {
        getOrders().then(res => setOrders(res.data.data));
        getProducts().then(res => setProducts(res.data.data));
    };
    useEffect(() => { load(); }, []);

    const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
    const updateItem = (idx, field, value) => {
        const copy = [...items];
        copy[idx][field] = value;
        setItems(copy);
    };
    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const parsedItems = items
            .filter(i => i.product_id && i.quantity > 0)
            .map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }));
        if (parsedItems.length === 0) return alert('Add at least one item');
        try {
            await createOrder({ customer_name: customerName, items: parsedItems });
            setCustomerName('');
            setItems([{ product_id: '', quantity: 1 }]);
            setShowForm(false);
            load();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    };

    const changeStatus = async (id, status) => {
        await updateOrderStatus(id, status);
        load();
    };

    const badgeClass = (status) => {
        if (status === 'Delivered') return 'badge badge-delivered';
        if (status === 'Shipped') return 'badge badge-shipped';
        return 'badge badge-pending';
    };

    return (
        <div className="page fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p className="page-subtitle">Create and track customer orders in real time</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ New Order'}
                </button>
            </div>

            {showForm && (
                <div className="form-card fade-in">
                    <h3 className="form-title">Create Order</h3>
                    <form onSubmit={handleSubmit} className="form-grid">
                        <input required placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="input" />
                        <h4 style={{ margin: '8px 0 4px', fontSize: 14, color: '#334155' }}>Items</h4>
                        {items.map((item, idx) => (
                            <div key={idx} className="form-row" style={{ alignItems: 'center' }}>
                                <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} className="input" style={{ flex: 2 }}>
                                    <option value="">Select Product</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — Stock: {p.stock}</option>)}
                                </select>
                                <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="input" style={{ flex: 1 }} />
                                {items.length > 1 && (
                                    <button type="button" onClick={() => removeItem(idx)} className="btn btn-danger">×</button>
                                )}
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={addItem} className="btn btn-secondary">+ Add Item</button>
                            <button type="submit" className="btn btn-success">Create Order</button>
                        </div>
                    </form>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="table-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <p>No orders yet. Click "New Order" to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id}>
                                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{o.id}</td>
                                    <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                                    <td>{o.total_items || 0}</td>
                                    <td style={{ fontWeight: 600 }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                                    <td><span className={badgeClass(o.status)}>{o.status}</span></td>
                                    <td>
                                        <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)} className="input" style={{ padding: '6px 10px', fontSize: 13, maxWidth: 130 }}>
                                            <option>Pending</option>
                                            <option>Shipped</option>
                                            <option>Delivered</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;
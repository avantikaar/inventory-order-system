import { useEffect, useState } from 'react';
import { getProducts, getSuppliers, addProduct } from '../api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [form, setForm] = useState({ name: '', sku: '', price: '', stock: '', supplier_id: '' });
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');

    const load = () => {
        getProducts().then(res => setProducts(res.data.data));
        getSuppliers().then(res => setSuppliers(res.data.data));
    };
    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addProduct({
            ...form,
            price: parseFloat(form.price),
            stock: parseInt(form.stock) || 0,
            supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null
        });
        setForm({ name: '', sku: '', price: '', stock: '', supplier_id: '' });
        setShowForm(false);
        load();
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">Manage your product catalog and inventory</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Add Product'}
                </button>
            </div>

            {showForm && (
                <div className="form-card fade-in">
                    <h3 className="form-title">New Product</h3>
                    <form onSubmit={handleSubmit} className="form-grid">
                        <div className="form-row">
                            <input required placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
                            <input required placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="input" />
                        </div>
                        <div className="form-row">
                            <input required type="number" placeholder="Price (₹)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input" />
                            <input type="number" placeholder="Initial Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input" />
                            <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} className="input">
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-success">Save Product</button>
                    </form>
                </div>
            )}

            <input
                placeholder="🔍 Search products by name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ marginBottom: 20, maxWidth: 400 }}
            />

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Supplier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td style={{ fontWeight: 600 }}>{p.name}</td>
                                <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{p.sku}</td>
                                <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                                <td className={p.stock < 10 ? 'stock-low' : 'stock-ok'}>
                                    {p.stock} {p.stock < 10 && '⚠️'}
                                </td>
                                <td>{p.supplier_name || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
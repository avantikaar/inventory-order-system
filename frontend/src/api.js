import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const getProducts = () => API.get('/products');
export const addProduct = (data) => API.post('/products', data);
export const updateStock = (id, stock) => API.put(`/products/${id}/stock`, { stock });

export const getSuppliers = () => API.get('/suppliers');

export const getOrders = () => API.get('/orders');
export const createOrder = (data) => API.post('/orders', data);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });

export const getDashboardStats = () => API.get('/dashboard/stats');
export const getLowStock = () => API.get('/dashboard/low-stock');
export const getTopProducts = () => API.get('/dashboard/top-products');
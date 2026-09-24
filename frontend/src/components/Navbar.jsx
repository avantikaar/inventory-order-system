import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const links = [
        { path: '/', label: 'Dashboard' },
        { path: '/products', label: 'Products' },
        { path: '/orders', label: 'Orders' },
        { path: '/low-stock', label: 'Low Stock' }
    ];
    return (
        <nav className="navbar">
            <h2 className="navbar-logo">🏢 Enterprise Inventory</h2>
            <div className="navbar-links">
                {links.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
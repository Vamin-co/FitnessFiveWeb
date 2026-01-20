import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
    const { isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar-pro">
            <div className="nav-container">
                <Link to="/" className="nav-brand">F5</Link>

                {/* Desktop Links */}
                <div className="nav-links-desktop">
                    <Link to="/about" className="nav-link">Manifesto</Link>
                    <Link to="/contact" className="nav-link">Support</Link>

                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn btn-primary btn-sm">Launch App</Link>
                    ) : (
                        <div className="auth-group">
                            <Link to="/login" className="nav-link">Log in</Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">Start Free</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </nav>
    );
}

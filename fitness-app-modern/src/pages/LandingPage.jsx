import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChevronRight, Zap, Shield, Globe } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-root">
            <Navbar />

            {/* Hero Section */}
            <section className="hero-pro">
                <div className="hero-content">
                    <div className="badge-pill">v2.0 Now Available</div>
                    <h1 className="hero-headline">
                        Fitness.<br />
                        <span className="text-gradient">Redefined.</span>
                    </h1>
                    <p className="hero-sub">
                        The most advanced activity tracking platform ever built for the web.
                        Precision metrics, beautiful visualization, and privacy by design.
                    </p>
                    <div className="hero-cta-group">
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
                            Start Tracking Free
                        </button>
                        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/about')}>
                            Watch the Film <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* UI Showcase (CSS Art) */}
            <section className="ui-showcase">
                <div className="device-frame glass-panel">
                    <div className="screen-content">
                        {/* Simulated App Header */}
                        <div className="app-header-mock">
                            <div className="pill"></div>
                            <div className="pill short"></div>
                        </div>
                        {/* Simulated Charts */}
                        <div className="chart-mock"></div>
                        <div className="grid-mock">
                            <div className="card-mock"></div>
                            <div className="card-mock"></div>
                            <div className="card-mock"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-pro">
                <div className="container">
                    <div className="section-head">
                        <h2>Pro-grade tools.</h2>
                        <p>Everything you need to master your fitness.</p>
                    </div>

                    <div className="feature-grid-pro">
                        <div className="feature-card-pro glass-panel">
                            <Zap className="feature-icon" size={32} />
                            <h3>Lightning Fast</h3>
                            <p>Instant load times and real-time data synchronization.</p>
                        </div>
                        <div className="feature-card-pro glass-panel">
                            <Shield className="feature-icon" size={32} />
                            <h3>Private & Secure</h3>
                            <p>Your health data is encrypted and stored locally on your device.</p>
                        </div>
                        <div className="feature-card-pro glass-panel">
                            <Globe className="feature-icon" size={32} />
                            <h3>Universal Access</h3>
                            <p>Access your dashboard from any device with a modern browser.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-pro">
                <div className="container">
                    <div className="footer-links">
                        <span>Copyright © 2026 FitnessFive Inc.</span>
                        <div className="links-right">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Sitemap</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

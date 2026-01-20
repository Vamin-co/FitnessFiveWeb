import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
    return (
        <div className="notfound-page">
            <div className="notfound-background">
                <div className="gradient-orb orb-404-1" />
                <div className="gradient-orb orb-404-2" />
            </div>

            <div className="notfound-content animate-fadeIn">
                <div className="error-code">
                    <span>4</span>
                    <div className="error-icon">
                        <div className="dumbbell-icon">🏋️</div>
                    </div>
                    <span>4</span>
                </div>

                <h1>Page Not Found</h1>
                <p>
                    Oops! Looks like this page took a rest day.
                    Let's get you back to your workout.
                </p>

                <div className="notfound-actions">
                    <Link to="/" className="btn btn-primary">
                        <Home size={18} />
                        Go Home
                    </Link>
                    <button className="btn btn-outline" onClick={() => window.history.back()}>
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

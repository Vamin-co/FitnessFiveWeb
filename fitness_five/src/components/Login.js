import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from "../CSS/Workout.module.css";
import axios from 'axios';
import '../CSS/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/login', { username, password });
            const { token } = response.data;
            localStorage.setItem('token', token); // Store JWT in localStorage
            navigate('/dashboard'); // Redirect to the dashboard page
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login-page">
            <div className="container">
                <header className="header">
                <Link to="/" className='title'>
                    <h1>FitnessFive</h1>
                </Link>
                </header>
                <main className="login-box">
                    <div className="login-header">
                        <h1>Log in</h1>
                        <p>Don't have an account? <a href="#">Sign up</a></p>
                    </div>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                aria-label="Username"
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                aria-label="Password"
                            />
                        </div>
                        <div className="input-group">
                            <button type="submit">Continue</button>
                        </div>
                    </form>
                    {error && <p className="error">{error}</p>}
                    <p className="terms">By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
                </main>
            </div>
        </div>
    );
};

export default Login;

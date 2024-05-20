import React from 'react';
import '../CSS/Login.css';

const Login = () => {
    return (
        <div className="container">
            <header className="header">
                <div className="logo">FitnessFive</div>
            </header>
            <main className="login-box">
                <div className="login-header">
                    <h1>Log in</h1>
                    <p>Don't have an account? <a href="#">Sign up</a></p>
                </div>
                <form className="login-form">
                    <div className="input-group">
                        <input type="text" placeholder="Username" required aria-label="Username" />
                    </div>
                    <div className="input-group">
                        <input type="password" placeholder="Password" required aria-label="Password" />
                    </div>
                    <div className="input-group">
                        <button type="submit">Continue</button>
                    </div>
                </form>
                <p className="terms">By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
            </main>
        </div>
    );
};

export default Login;

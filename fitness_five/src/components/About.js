import React from 'react';
import '../CSS/About.css';

const About = () => {
    return (
    <body>
            <div class="container">
                <div class="header">
                    <div class="header-title">FitnessFive</div>
                    <div class="header-links">
                        <button class="header-link">About</button>
                        <button class="header-link">Contact Us</button>
                        <button class="login-button">
                            <div class="login-button-text">Log In</div>
                        </button>
                    </div>
                </div>
                <div class="content">
                    <img class="image" src="https://via.placeholder.com/508x657" alt="FitnessFive Image"></img>
                    <div class="text-container">
                        <div class="title">About FitnessFive</div>
                        <div class="subtitle">Empowering Your Fitness Journey</div>
                        <div class="description">
                            At FitnessFive, we go beyond traditional workouts and weightlifting. Our mission is to empower individuals to transform their lifestyles through consistent and focused physical activity. We recognize that each fitness journey is unique, which is why our approach is carefully tailored to meet individual needs and goals. Whether you're just starting out or looking to elevate your training, we're here to support you every step of the way.<br></br>
                            Utilizing cutting-edge technology, FitnessFive offers a range of tools designed to enhance your training experience. Our app allows you to track workouts, visualize your progress, and compete in virtual leaderboards with participants across the country.
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <div class="footer-section">
                        <div class="footer-text">About us</div>
                        <div class="footer-subtext">Page</div>
                        <div class="footer-subtext">Page</div>
                        <div class="footer-subtext">Page</div>
                    </div>
                    <div class="footer-section">
                        <div class="footer-text">Leaderboard</div>
                        <div class="footer-subtext">Page</div>
                        <div class="footer-subtext">Page</div>
                        <div class="footer-subtext">Page</div>
                    </div>
                    <div class="footer-section">
                        <div class="footer-text">Contact us</div>
                        <div class="footer-subtext">Page</div>
                        <div class="footer-subtext">Page</div>
                        <div class="footer-subtext">Page</div>
                    </div>
                    <div class="footer-title">FitnessFive</div>
                    <div class="social-icons">
                        <div class="social-icon"><img src="https://via.placeholder.com/20x20" alt="Icon 1"></img></div>
                        <div class="social-icon"><img src="https://via.placeholder.com/18x18" alt="Icon 2"></img></div>
                        <div class="social-icon"><img src="https://via.placeholder.com/20x14" alt="Icon 3"></img></div>
                        <div class="social-icon"><img src="https://via.placeholder.com/20x20" alt="Icon 4"></img></div>
                    </div>
                    <div class="divider"></div>
                </div>
            </div>
    </body>
    );
    
}
export default About;
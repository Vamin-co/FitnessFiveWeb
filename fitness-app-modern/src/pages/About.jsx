import Navbar from '../components/Navbar';
import {
    Target, Users, Zap, Award, Heart,
    TrendingUp, Shield, Globe
} from 'lucide-react';
import './About.css';

const values = [
    {
        icon: Heart,
        title: 'Passion for Fitness',
        description: 'We believe fitness should be accessible, enjoyable, and rewarding for everyone.'
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Your data is yours. We prioritize security and never sell your information.'
    },
    {
        icon: TrendingUp,
        title: 'Continuous Growth',
        description: 'We constantly improve our platform based on user feedback and latest research.'
    },
    {
        icon: Globe,
        title: 'Global Community',
        description: 'Join millions of fitness enthusiasts from around the world on their journey.'
    }
];

const team = [
    { name: 'Fitness Team', role: 'Building the Future of Fitness', initials: 'F5' }
];

const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '2M+', label: 'Workouts Tracked' },
    { value: '150+', label: 'Exercise Types' },
    { value: '98%', label: 'Satisfaction Rate' }
];

export default function About() {
    return (
        <div className="about-page">
            <Navbar />

            {/* Hero */}
            <section className="about-hero">
                <div className="hero-background">
                    <div className="gradient-orb orb-about-1" />
                    <div className="gradient-orb orb-about-2" />
                </div>
                <div className="hero-content">
                    <span className="hero-tag">About Us</span>
                    <h1>
                        Transforming Lives Through{' '}
                        <span className="gradient-text">Fitness Technology</span>
                    </h1>
                    <p>
                        FitnessFive was born from a simple idea: everyone deserves access to
                        professional-grade fitness tracking without the complexity.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="section-container">
                    <div className="mission-content">
                        <div className="mission-text">
                            <span className="section-tag">Our Mission</span>
                            <h2>Empowering Your Fitness Journey</h2>
                            <p>
                                We started FitnessFive because we saw a gap in the fitness technology space.
                                Most apps were either too complicated for beginners or too basic for serious
                                athletes. We wanted to create something that grows with you.
                            </p>
                            <p>
                                Today, FitnessFive helps over 50,000 users track their workouts, monitor
                                their progress, and achieve their fitness goals. From first-time gym-goers
                                to professional athletes, our platform adapts to meet you where you are.
                            </p>
                        </div>
                        <div className="mission-visual glass">
                            <div className="visual-card">
                                <Target size={48} />
                                <h3>Goal-Oriented</h3>
                                <p>Set targets and crush them with our smart tracking system.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="section-container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item glass">
                                <span className="stat-value gradient-text">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Our Values</span>
                        <h2>What Drives Us</h2>
                        <p>The principles that guide everything we do at FitnessFive.</p>
                    </div>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card glass">
                                <div className="value-icon gradient-primary">
                                    <value.icon size={24} />
                                </div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="about-footer">
                <p>© 2026 FitnessFive. All rights reserved.</p>
            </footer>
        </div>
    );
}

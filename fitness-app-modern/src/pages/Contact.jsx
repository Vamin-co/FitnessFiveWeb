import { useState } from 'react';
import Navbar from '../components/Navbar';
import {
    Mail, MessageSquare, Send, MapPin,
    Phone, Clock, CheckCircle
} from 'lucide-react';
import './Contact.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save to localStorage (simulating backend)
        const messages = JSON.parse(localStorage.getItem('fitness_messages') || '[]');
        messages.push({
            ...formData,
            id: Date.now(),
            submittedAt: new Date().toISOString()
        });
        localStorage.setItem('fitness_messages', JSON.stringify(messages));

        setIsSubmitted(true);
        setIsLoading(false);
    };

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email Us',
            details: 'support@fitnessfive.com',
            subtext: 'We reply within 24 hours'
        },
        {
            icon: Phone,
            title: 'Call Us',
            details: '+1 (555) 123-4567',
            subtext: 'Mon-Fri 9am-6pm PST'
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            details: 'San Francisco, CA',
            subtext: 'United States'
        }
    ];

    return (
        <div className="contact-page">
            <Navbar />

            <section className="contact-hero">
                <div className="hero-background">
                    <div className="gradient-orb orb-contact-1" />
                    <div className="gradient-orb orb-contact-2" />
                </div>
                <div className="hero-content">
                    <span className="hero-tag">Contact</span>
                    <h1>
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p>
                        Have questions? We'd love to hear from you. Send us a message
                        and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            <section className="contact-section">
                <div className="contact-container">
                    {/* Contact Info */}
                    <div className="contact-info">
                        <h2>Contact Information</h2>
                        <p>Reach out to us through any of these channels.</p>

                        <div className="info-cards">
                            {contactInfo.map((info, index) => (
                                <div key={index} className="info-card glass">
                                    <div className="info-icon gradient-primary">
                                        <info.icon size={20} />
                                    </div>
                                    <div className="info-content">
                                        <h3>{info.title}</h3>
                                        <span className="info-details">{info.details}</span>
                                        <span className="info-subtext">{info.subtext}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hours-card glass">
                            <Clock size={20} />
                            <div>
                                <h3>Business Hours</h3>
                                <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                                <p>Saturday - Sunday: Closed</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-wrapper glass">
                        {isSubmitted ? (
                            <div className="success-message">
                                <div className="success-icon">
                                    <CheckCircle size={48} />
                                </div>
                                <h2>Message Sent!</h2>
                                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setFormData({ name: '', email: '', subject: '', message: '' });
                                    }}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2>Send us a Message</h2>
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Name</label>
                                            <input
                                                id="name"
                                                type="text"
                                                placeholder="Your name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="subject">Subject</label>
                                        <input
                                            id="subject"
                                            type="text"
                                            placeholder="How can we help?"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">Message</label>
                                        <textarea
                                            id="message"
                                            placeholder="Your message..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={5}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                                        {isLoading ? 'Sending...' : 'Send Message'}
                                        {!isLoading && <Send size={18} />}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <footer className="contact-footer">
                <p>© 2026 FitnessFive. All rights reserved.</p>
            </footer>
        </div>
    );
}

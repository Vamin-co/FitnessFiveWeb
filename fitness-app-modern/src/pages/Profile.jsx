import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../context/WorkoutContext';
import {
    ArrowLeft, User, Mail, Calendar, Ruler,
    Weight, Camera, Save, Trophy, Target, Flame
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const { user, updateProfile, logout } = useAuth();
    const { getStats, addWeightEntry } = useWorkouts();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        weight: user?.weight || '',
        height: user?.height || ''
    });
    const [newWeight, setNewWeight] = useState('');

    const stats = getStats();

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    const handleAddWeight = (e) => {
        e.preventDefault();
        if (newWeight) {
            addWeightEntry(newWeight);
            updateProfile({ weight: parseFloat(newWeight) });
            setNewWeight('');
        }
    };

    const getInitials = () => {
        const first = user?.firstName?.charAt(0) || '';
        const last = user?.lastName?.charAt(0) || '';
        return `${first}${last}`.toUpperCase();
    };

    const achievements = [
        { icon: Trophy, name: 'First Workout', earned: stats.totalWorkouts > 0 },
        { icon: Flame, name: '7-Day Streak', earned: stats.streak >= 7 },
        { icon: Target, name: '10 Workouts', earned: stats.completedWorkouts >= 10 },
    ];

    return (
        <div className="profile-page">
            <div className="profile-background">
                <div className="gradient-orb orb-profile-1" />
                <div className="gradient-orb orb-profile-2" />
            </div>

            <header className="profile-header">
                <Link to="/dashboard" className="back-button">
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </Link>
            </header>

            <main className="profile-main">
                <div className="profile-card glass">
                    <div className="profile-cover">
                        <div className="avatar-section">
                            <div className="profile-avatar-large">
                                {user?.profilePhotoUrl ? (
                                    <img src={user.profilePhotoUrl} alt="Profile" />
                                ) : (
                                    <span>{getInitials()}</span>
                                )}
                                <button className="avatar-edit">
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-info-header">
                            <div>
                                <h1>{user?.firstName} {user?.lastName}</h1>
                                <p className="profile-email">{user?.email}</p>
                                <p className="join-date">Member since {user?.joinDate || 'January 2024'}</p>
                            </div>
                            {!isEditing ? (
                                <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleSave}>
                                    <Save size={16} />
                                    Save
                                </button>
                            )}
                        </div>

                        <div className="profile-stats">
                            <div className="profile-stat">
                                <span className="stat-number">{stats.totalWorkouts}</span>
                                <span className="stat-name">Workouts</span>
                            </div>
                            <div className="profile-stat">
                                <span className="stat-number">{stats.streak}</span>
                                <span className="stat-name">Day Streak</span>
                            </div>
                            <div className="profile-stat">
                                <span className="stat-number">{stats.currentWeight || '--'}</span>
                                <span className="stat-name">Current lbs</span>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label><User size={14} /> First Name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><User size={14} /> Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label><Mail size={14} /> Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label><Ruler size={14} /> Height (inches)</label>
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                            placeholder="e.g., 70"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Weight size={14} /> Weight (lbs)</label>
                                        <input
                                            type="number"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            placeholder="e.g., 165"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-details">
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <Ruler size={18} />
                                        <span className="detail-label">Height</span>
                                        <span className="detail-value">{user?.height ? `${user.height}"` : 'Not set'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Weight size={18} />
                                        <span className="detail-label">Weight</span>
                                        <span className="detail-value">{stats.currentWeight ? `${stats.currentWeight} lbs` : 'Not set'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Calendar size={18} />
                                        <span className="detail-label">Birthday</span>
                                        <span className="detail-value">{user?.birthDate || 'Not set'}</span>
                                    </div>
                                </div>

                                <div className="weight-tracker">
                                    <h3>Log Today's Weight</h3>
                                    <form onSubmit={handleAddWeight} className="weight-form">
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Enter weight in lbs"
                                            value={newWeight}
                                            onChange={(e) => setNewWeight(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-primary">
                                            Log Weight
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="achievements-section">
                            <h3>Achievements</h3>
                            <div className="achievements-grid">
                                {achievements.map((achievement, index) => (
                                    <div
                                        key={index}
                                        className={`achievement-badge ${achievement.earned ? 'earned' : ''}`}
                                    >
                                        <achievement.icon size={24} />
                                        <span>{achievement.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

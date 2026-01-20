import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../context/WorkoutContext';
import {
    LayoutGrid, Dumbbell, User, Settings,
    LogOut, Plus, ChevronRight, Activity,
    Flame, Clock, Calendar, TrendingUp
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { workouts, weightData, activityData, getStats } = useWorkouts();
    const stats = getStats();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = () => {
        const first = user?.firstName?.charAt(0) || '';
        const last = user?.lastName?.charAt(0) || '';
        return `${first}${last}`.toUpperCase();
    };

    // Modern Chart Data Formatter
    const chartData = weightData.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        weight: d.weight
    })).slice(-7);

    return (
        <div className="app-shell">
            {/* Pro Sidebar */}
            <aside className="sidebar-pro glass-panel">
                <div className="sidebar-header">
                    <div className="logo-mark">F5</div>
                </div>

                <nav className="nav-menu">
                    <NavLink to="/dashboard" className="nav-item">
                        <LayoutGrid size={22} />
                        <span>Summary</span>
                    </NavLink>
                    <NavLink to="/workout" className="nav-item">
                        <Dumbbell size={22} />
                        <span>Workouts</span>
                    </NavLink>
                    <NavLink to="/profile" className="nav-item">
                        <User size={22} />
                        <span>Profile</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <header className="content-header animate-enter">
                    <div className="date-display">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <h1>Good Morning, {user?.firstName}</h1>
                </header>

                {/* Bento Grid Layout */}
                <div className="bento-grid animate-enter">

                    {/* Main Activity Card (Large) */}
                    <div className="bento-card activity-hero glass-panel">
                        <div className="card-header">
                            <h3>Activity</h3>
                            <span className="live-indicator">Typing...</span>
                        </div>
                        <div className="rings-container">
                            {/* CSS Art Activity Rings */}
                            <div className="ring-group">
                                <div className="ring ring-red" style={{ '--p': '75' }}>
                                    <div className="ring ring-green" style={{ '--p': '50' }}>
                                        <div className="ring ring-blue" style={{ '--p': '90' }}>
                                            <div className="ring-content">
                                                <Activity size={32} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="activity-stats">
                                <div className="stat-row">
                                    <span className="dot red"></span>
                                    <div className="stat-detail">
                                        <span className="label">Move</span>
                                        <span className="value">{stats.totalCaloriesThisWeek} <small>KCAL</small></span>
                                    </div>
                                </div>
                                <div className="stat-row">
                                    <span className="dot green"></span>
                                    <div className="stat-detail">
                                        <span className="label">Exercise</span>
                                        <span className="value">{stats.totalMinutesThisWeek} <small>MIN</small></span>
                                    </div>
                                </div>
                                <div className="stat-row">
                                    <span className="dot blue"></span>
                                    <div className="stat-detail">
                                        <span className="label">Stand</span>
                                        <span className="value">12 <small>HR</small></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stat: Streak */}
                    <div className="bento-card stat-small glass-panel">
                        <div className="icon-wrapper orange">
                            <Flame size={24} />
                        </div>
                        <div className="stat-text">
                            <span className="value-large">{stats.streak}</span>
                            <span className="label-small">Day Streak</span>
                        </div>
                    </div>

                    {/* Quick Stat: Workouts */}
                    <div className="bento-card stat-small glass-panel">
                        <div className="icon-wrapper purple">
                            <Dumbbell size={24} />
                        </div>
                        <div className="stat-text">
                            <span className="value-large">{stats.totalWorkouts}</span>
                            <span className="label-small">Total Workouts</span>
                        </div>
                    </div>

                    {/* Weight Chart (Medium) */}
                    <div className="bento-card chart-card glass-panel">
                        <div className="card-header">
                            <h3>Weight Trend</h3>
                            <TrendingUp size={16} className="trend-icon" />
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height="80%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#30D158" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#30D158" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ background: '#1c1c1e', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#30D158"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorWeight)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Workouts List (Tall) */}
                    <div className="bento-card workouts-list glass-panel">
                        <div className="card-header">
                            <h3>Recent Workouts</h3>
                            <button className="btn-icon" onClick={() => navigate('/workout')}>
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="list-content">
                            {workouts.slice(0, 4).map(workout => (
                                <div key={workout.id} className="list-item" onClick={() => navigate(`/workout/${workout.id}`)}>
                                    <div className="item-icon">
                                        <Dumbbell size={18} />
                                    </div>
                                    <div className="item-details">
                                        <span className="item-title">{workout.title}</span>
                                        <span className="item-meta">{workout.completed ? 'Completed' : 'In Progress'}</span>
                                    </div>
                                    <ChevronRight size={16} className="chevron" />
                                </div>
                            ))}
                            {workouts.length === 0 && (
                                <div className="empty-state">
                                    <p>No recent activity</p>
                                    <button className="btn-text" onClick={() => navigate('/workout')}>Start a workout</button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

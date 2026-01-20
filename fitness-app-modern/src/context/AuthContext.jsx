import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Initial demo user for showcasing the app
const DEMO_USER = {
    id: 1,
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex@fitnessfive.com',
    username: 'alexfit',
    birthDate: '1998-05-15',
    weight: 165,
    height: 70,
    profilePhotoUrl: null,
    joinDate: '2024-01-15',
    streak: 12,
    totalWorkouts: 47,
    achievements: ['First Workout', '7-Day Streak', 'Heavy Lifter']
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session in localStorage
        const storedUser = localStorage.getItem('fitness_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check stored users or use demo credentials
        const storedUsers = JSON.parse(localStorage.getItem('fitness_users') || '[]');
        const foundUser = storedUsers.find(u => u.email === email);

        if (foundUser && foundUser.password === password) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem('fitness_user', JSON.stringify(userWithoutPassword));
            return { success: true };
        }

        // Demo login for testing
        if (email === 'demo@fitnessfive.com' && password === 'demo123') {
            setUser(DEMO_USER);
            localStorage.setItem('fitness_user', JSON.stringify(DEMO_USER));
            return { success: true };
        }

        return { success: false, error: 'Invalid email or password' };
    };

    const signup = async (userData) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const storedUsers = JSON.parse(localStorage.getItem('fitness_users') || '[]');

        // Check if email already exists
        if (storedUsers.some(u => u.email === userData.email)) {
            return { success: false, error: 'Email already in use' };
        }

        const newUser = {
            id: Date.now(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            username: userData.email.split('@')[0],
            birthDate: userData.birthDate || null,
            weight: userData.weight || null,
            height: userData.height || null,
            profilePhotoUrl: null,
            joinDate: new Date().toISOString().split('T')[0],
            streak: 0,
            totalWorkouts: 0,
            achievements: []
        };

        storedUsers.push(newUser);
        localStorage.setItem('fitness_users', JSON.stringify(storedUsers));

        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem('fitness_user', JSON.stringify(userWithoutPassword));

        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('fitness_user');
    };

    const updateProfile = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('fitness_user', JSON.stringify(updatedUser));

        // Also update in the users list
        const storedUsers = JSON.parse(localStorage.getItem('fitness_users') || '[]');
        const userIndex = storedUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            storedUsers[userIndex] = { ...storedUsers[userIndex], ...updates };
            localStorage.setItem('fitness_users', JSON.stringify(storedUsers));
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

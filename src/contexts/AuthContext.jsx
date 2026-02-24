import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Mock authentication - replace with real API call
        // For demo: admin@example.com / admin123 = admin, user@example.com / user123 = participant
        const mockUsers = {
            'admin@example.com': {
                id: 1,
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
                username: 'admin'
            },
            'user@example.com': {
                id: 2,
                email: 'user@example.com',
                name: 'John Doe',
                role: 'participant',
                username: 'johndoe'
            }
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (mockUsers[email] && password.length >= 6) {
            const userData = mockUsers[email];
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true, user: userData };
        } else {
            return { success: false, error: 'Invalid email or password' };
        }
    };

    const register = async (userData) => {
        // Mock registration - replace with real API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const newUser = {
            id: Date.now(),
            email: userData.email,
            name: userData.name,
            username: userData.username,
            role: 'participant' // Default role
        };

        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return { success: true, user: newUser };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isAdmin = () => user?.role === 'admin';
    const isParticipant = () => user?.role === 'participant' || user?.role === 'onfield';
    const isAuthenticated = () => !!user;

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isParticipant,
        isAuthenticated
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

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

    // On mount: verify stored token is still valid
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            authAPI.getCurrentUser()
                .then(res => setUser(res.data))
                .catch(() => {
                    // Token invalid or expired – clear storage
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const res = await authAPI.login(email, password);
            const { access_token, user: userData } = res.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (err) {
            const message =
                err.response?.data?.detail || 'Invalid email or password';
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const res = await authAPI.register(userData);
            // Auto-login after successful registration
            return await login(userData.email, userData.password);
        } catch (err) {
            const detail = err.response?.data?.detail;
            const message =
                typeof detail === 'string'
                    ? detail
                    : Array.isArray(detail)
                        ? detail.map(d => d.msg).join(', ')
                        : 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    };

    const isAdmin = () => user?.role === 'admin';
    const isParticipant = () =>
        user?.role === 'participant' || user?.role === 'onfield';
    const isAuthenticated = () => !!user;

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isParticipant,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

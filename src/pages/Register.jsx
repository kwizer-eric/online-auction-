import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Gavel, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        const result = await register({
            name: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password
        });

        if (result.success) {
            navigate('/auctions');
        } else {
            setError(result.error || 'Registration failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20">
                        <Gavel className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
                    Create Professional Account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-primary hover:text-primary-hover underline underline-offset-4">
                        Sign in here
                    </Link>
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0"
            >
                <div className="bg-white py-10 px-6 shadow-banking rounded-2xl border border-slate-200 sm:px-12">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="name"
                                        required 
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field pl-10" 
                                        placeholder="John Doe"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                                <input 
                                    type="text" 
                                    name="username"
                                    required 
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input-field" 
                                    placeholder="johndoe88"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email"
                                    required 
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field pl-10" 
                                    placeholder="name@example.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input 
                                        type="password" 
                                        name="password"
                                        required 
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field pl-10" 
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    required 
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field" 
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                By registering, you agree to our <strong>Institutional Terms of Service</strong> and <strong>Escrow Protection Policies</strong>. Your identity will be verified for high-value bidding.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full btn-primary flex justify-center items-center gap-2 !py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Registering...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-6 h-6" />
                                    Complete Registration
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

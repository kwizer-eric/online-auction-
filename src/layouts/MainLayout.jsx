import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-slate-900 text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6">
                        <div className="bg-primary p-2 rounded-lg">
                            <img src="/vite.svg" className="w-6 h-6" alt="Logo" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Secure<span className="text-primary">Bid</span>
                        </span>
                    </div>
                    <p className="text-slate-400 max-w-md mx-auto mb-8">
                        The world's most trusted professional online auction platform for high-value assets.
                    </p>
                    <div className="border-t border-slate-800 pt-8 text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} SecureBid Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;

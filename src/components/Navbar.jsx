import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, User, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary p-2 rounded-lg">
                                <Gavel className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">
                                Secure<span className="text-primary">Bid</span>
                            </span>
                        </Link>

                        <div className="hidden md:ml-8 md:flex md:space-x-8">
                            <Link to="/auctions" className="text-slate-600 hover:text-primary px-1 py-2 text-sm font-medium transition-colors">
                                Browse Auctions
                            </Link>
                            <Link to="/categories" className="text-slate-600 hover:text-primary px-1 py-2 text-sm font-medium transition-colors">
                                Categories
                            </Link>
                            <Link to="/how-it-works" className="text-slate-600 hover:text-primary px-1 py-2 text-sm font-medium transition-colors">
                                How it Works
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-slate-600 hover:text-primary p-2 transition-colors">
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>
                        <Link to="/create-auction" className="hidden sm:flex items-center gap-2 btn-primary !py-1.5 !px-4">
                            <PlusCircle className="w-4 h-4" />
                            <span>Host Auction</span>
                        </Link>
                        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 text-slate-700 hover:text-primary font-medium px-3 py-2 transition-colors"
                        >
                            <User className="w-5 h-5" />
                            <span className="hidden sm:inline">Sign In</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

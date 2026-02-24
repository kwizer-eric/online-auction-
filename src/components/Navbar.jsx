import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, User, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-accent-black group-hover:bg-primary p-2 rounded-lg transition-colors duration-300">
                                <Gavel className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-black text-accent-black tracking-tighter">
                                SECURE<span className="text-primary italic">BID</span>
                            </span>
                        </Link>

                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            <Link to="/auctions" className="text-secondary font-bold hover:text-primary px-1 py-2 text-sm transition-colors uppercase tracking-widest">
                                Browse
                            </Link>
                            <Link to="/categories" className="text-secondary font-bold hover:text-primary px-1 py-2 text-sm transition-colors uppercase tracking-widest">
                                Markets
                            </Link>
                            <Link to="/how-it-works" className="text-secondary font-bold hover:text-primary px-1 py-2 text-sm transition-colors uppercase tracking-widest">
                                Trust
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                {isAdmin() && (
                                    <>
                                        <Link to="/admin" className="text-secondary-dark hover:text-primary transition-colors">
                                            <LayoutDashboard className="w-5 h-5" />
                                        </Link>
                                        <Link to="/create-auction" className="hidden sm:flex items-center gap-2 btn-primary !py-2 !px-5 !text-xs !font-black uppercase tracking-widest">
                                            <PlusCircle className="w-4 h-4" />
                                            <span>Host Asset</span>
                                        </Link>
                                    </>
                                )}
                                <div className="h-6 w-[1px] bg-slate-200"></div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-xs font-bold text-slate-900">{user.name}</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-accent-black hover:text-primary font-black text-xs uppercase tracking-widest transition-colors"
                                    >
                                        <LogOut className="w-5 h-5 text-primary" />
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {isAdmin() && (
                                    <Link to="/admin" className="text-secondary-dark hover:text-primary transition-colors">
                                        <LayoutDashboard className="w-5 h-5" />
                                    </Link>
                                )}
                                <Link to="/create-auction" className="hidden sm:flex items-center gap-2 btn-primary !py-2 !px-5 !text-xs !font-black uppercase tracking-widest">
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Host Asset</span>
                                </Link>
                                <div className="h-6 w-[1px] bg-slate-200"></div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 text-accent-black hover:text-primary font-black text-xs uppercase tracking-widest transition-colors"
                                >
                                    <User className="w-5 h-5 text-primary" />
                                    <span className="hidden sm:inline">Portal</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Gavel,
    Users,
    Settings,
    BarChart3,
    PlusCircle,
    HelpCircle
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
        { icon: Gavel, label: 'Manage Auctions', path: '/admin/auctions' },
        { icon: PlusCircle, label: 'Create Auction', path: '/create-auction' },
        { icon: Users, label: 'Bidders', path: '/admin/bidders' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-6 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary-light text-primary'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-auto p-6 border-t border-slate-100">
                <Link
                    to="/help"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                    <HelpCircle className="w-5 h-5" />
                    Support Help
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;

import React from 'react';
import {
    Users,
    Gavel,
    TrendingUp,
    DollarSign,
    MoreVertical,
    Eye
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { mockAuctions } from '../mock/auctions';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Executive Overview</h1>
                <p className="text-slate-500">Real-time performance metrics and asset management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Active Auctions"
                    value="24"
                    icon={Gavel}
                    trend="up"
                    trendValue="12"
                />
                <StatsCard
                    title="Total Bidders"
                    value="1,284"
                    icon={Users}
                    trend="up"
                    trendValue="8"
                />
                <StatsCard
                    title="Revenue (MB)"
                    value="$4.2M"
                    icon={DollarSign}
                    trend="up"
                    trendValue="24"
                />
                <StatsCard
                    title="Conversion Rate"
                    value="18.5%"
                    icon={TrendingUp}
                    trend="down"
                    trendValue="2"
                />
            </div>

            <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-slate-900">Recent Asset Listings</h3>
                    <button className="text-primary font-bold text-sm hover:underline">Export Report</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Current Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Bids</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {mockAuctions.map((auction) => (
                                <tr key={auction.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={auction.image} className="w-10 h-10 rounded-lg object-cover shadow-sm" alt="" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 line-clamp-1">{auction.title}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{auction.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-900">
                                        ${auction.currentPrice.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-primary-light text-primary rounded-lg text-[10px] font-black uppercase tracking-tighter border border-primary/10">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{auction.bids}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">+3 since last check</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                        View All Internal Asset Records
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

import React, { useState } from 'react';
import {
    Users,
    Gavel,
    TrendingUp,
    DollarSign,
    MoreVertical,
    Eye,
    Radio
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LiveAuctionControl from '../components/LiveAuctionControl';
import { mockAuctions } from '../mock/auctions';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [liveAuction, setLiveAuction] = useState(null);

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {liveAuction && (
                    <div className="fixed bottom-8 right-8 z-[60] w-full max-w-md">
                        <LiveAuctionControl
                            auction={liveAuction}
                            onClose={() => setLiveAuction(null)}
                        />
                    </div>
                )}
            </AnimatePresence>

            <div>
                <h1 className="text-3xl font-black text-accent-black mb-2">Executive Overview</h1>
                <p className="text-secondary font-medium">Real-time performance metrics and hybrid asset management.</p>
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
                    <h3 className="font-bold text-accent-black">Asset Inventory & Live Control</h3>
                    <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Export Portfolio</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Asset Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Current Price</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Bids</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {mockAuctions.map((auction) => (
                                <tr key={auction.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={auction.image} className="w-10 h-10 rounded-lg object-cover shadow-sm grayscale group-hover:grayscale-0 transition-all" alt="" />
                                            <div>
                                                <p className="text-sm font-bold text-accent-black line-clamp-1">{auction.title}</p>
                                                <p className="text-[10px] text-secondary uppercase font-black tracking-tighter">{auction.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-accent-black">
                                        ${auction.currentPrice.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-primary-light text-primary rounded-lg text-[10px] font-black uppercase tracking-tighter border border-primary/10">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-accent-black">{auction.bids}</span>
                                            <span className="text-[10px] text-secondary font-medium">+3 synced</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setLiveAuction(auction)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${liveAuction?.id === auction.id
                                                        ? 'bg-primary text-white'
                                                        : 'bg-accent-black text-white hover:bg-primary'
                                                    }`}
                                            >
                                                <Radio className={`w-3 h-3 ${liveAuction?.id === auction.id ? 'animate-pulse' : ''}`} />
                                                Live Control
                                            </button>
                                            <button className="p-2 text-secondary-dark hover:text-primary transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

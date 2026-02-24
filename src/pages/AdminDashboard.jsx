import React, { useState, useEffect } from 'react';
import {
    Users,
    Gavel,
    TrendingUp,
    DollarSign,
    MoreVertical,
    Eye,
    Radio,
    Play,
    Square
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LiveAuctionControl from '../components/LiveAuctionControl';
import { auctionService } from '../services/auctionService';
import { registrationService } from '../services/registrationService';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [liveAuction, setLiveAuction] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAuctions();
    }, []);

    const loadAuctions = async () => {
        await auctionService.loadAuctions();
        setAuctions(auctionService.getAuctions());
        setLoading(false);
    };

    const handleStartAuction = (auctionId) => {
        const updated = auctionService.startAuction(auctionId);
        if (updated) {
            setAuctions([...auctionService.getAuctions()]);
            // If this auction is now live, open control panel
            if (updated.status === 'live') {
                setLiveAuction(updated);
            }
        }
    };

    const handleEndAuction = (auctionId) => {
        const updated = auctionService.endAuction(auctionId);
        if (updated) {
            setAuctions([...auctionService.getAuctions()]);
            // Close control panel if this was the live auction
            if (liveAuction?.id === auctionId) {
                setLiveAuction(null);
            }
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
            live: 'bg-primary-light text-primary border-primary/20 animate-pulse',
            completed: 'bg-slate-100 text-slate-600 border-slate-200'
        };
        const labels = {
            scheduled: 'Scheduled',
            live: 'LIVE',
            completed: 'Completed'
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${badges[status] || badges.scheduled}`}>
                {labels[status] || 'Scheduled'}
            </span>
        );
    };

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {liveAuction && (
                    <div className="fixed bottom-8 right-8 z-[60] w-full max-w-md">
                        <LiveAuctionControl
                            auction={liveAuction}
                            onClose={() => setLiveAuction(null)}
                            onAuctionEnd={() => loadAuctions()}
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
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Participants</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Bids</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        Loading auctions...
                                    </td>
                                </tr>
                            ) : auctions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        No auctions found
                                    </td>
                                </tr>
                            ) : (
                                auctions.map((auction) => (
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
                                        {getStatusBadge(auction.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const counts = registrationService.getRegistrationCounts(auction.id);
                                            return (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-slate-400" />
                                                        <span className="text-sm font-bold text-accent-black">{counts.total}</span>
                                                    </div>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] text-primary font-medium">
                                                            {counts.online} online
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {counts.onfield} on-field
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-accent-black">{auction.bids || 0}</span>
                                            {auction.status === 'live' && (
                                                <span className="text-[10px] text-primary font-medium">Active</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {auction.status === 'scheduled' && (
                                                <button
                                                    onClick={() => handleStartAuction(auction.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-green-600 text-white hover:bg-green-700"
                                                    title="Start Live Auction"
                                                >
                                                    <Play className="w-3 h-3" />
                                                    Start
                                                </button>
                                            )}
                                            {auction.status === 'live' && (
                                                <>
                                                    <button
                                                        onClick={() => setLiveAuction(auction)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${liveAuction?.id === auction.id
                                                                ? 'bg-primary text-white'
                                                                : 'bg-accent-black text-white hover:bg-primary'
                                                            }`}
                                                    >
                                                        <Radio className={`w-3 h-3 ${liveAuction?.id === auction.id ? 'animate-pulse' : ''}`} />
                                                        Control
                                                    </button>
                                                    <button
                                                        onClick={() => handleEndAuction(auction.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-rose-600 text-white hover:bg-rose-700"
                                                        title="End Auction"
                                                    >
                                                        <Square className="w-3 h-3" />
                                                        End
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => window.location.href = `/auction/${auction.id}`}
                                                className="p-2 text-secondary-dark hover:text-primary transition-colors"
                                                title="View Auction"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

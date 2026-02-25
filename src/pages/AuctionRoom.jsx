import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Share2, Heart, ShieldCheck as Shield } from 'lucide-react';
import { auctionAPI, bidAPI } from '../services/api';
import { socketService } from '../services/socket';
import CountdownTimer from '../components/CountdownTimer';
import BidPanel from '../components/BidPanel';
import BidHistory from '../components/BidHistory';
import ChatBox from '../components/ChatBox';
import AuctionRegistration from '../components/AuctionRegistration';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const AuctionRoom = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [auction, setAuction] = useState(null);
    const [currentBids, setCurrentBids] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [bidError, setBidError] = useState('');

    useEffect(() => {
        loadAuction();
        loadBids();
    }, [id]);

    const loadAuction = async () => {
        try {
            const res = await auctionAPI.getById(id);
            setAuction(res.data);
            setCurrentPrice(res.data.current_price || res.data.starting_price || 0);
        } catch (err) {
            console.error('Failed to load auction:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadBids = async () => {
        try {
            const res = await bidAPI.getAuctionBids(id, { limit: 50 });
            setCurrentBids(res.data || []);
        } catch (err) {
            console.error('Failed to load bids:', err);
        }
    };

    // Refresh auction status periodically
    useEffect(() => {
        if (!auction) return;
        const interval = setInterval(async () => {
            try {
                const res = await auctionAPI.getById(id);
                setAuction(res.data);
                setCurrentPrice(res.data.current_price || res.data.starting_price || 0);
            } catch { }
        }, 10000);
        return () => clearInterval(interval);
    }, [id, auction]);

    useEffect(() => {
        // Join auction room for real-time WebSocket updates
        socketService.joinAuction(id);

        // The FastAPI backend broadcasts messages as: { type: 'bid_update', data: {...} }
        const handleBidUpdate = (data) => {
            const newBid = {
                id: data.id || Date.now(),
                auction_id: data.auction_id,
                bidder_name: data.bidder_name || data.user_name || 'Anonymous',
                amount: data.amount,
                bid_type: data.bid_type || 'online',
                created_at: data.created_at || new Date().toISOString()
            };
            setCurrentBids(prev => [newBid, ...prev]);
            setCurrentPrice(data.amount);
        };

        socketService.on('bid_update', handleBidUpdate);
        // Also listen for legacy event name just in case
        socketService.on('bidUpdated', handleBidUpdate);

        return () => {
            socketService.leaveAuction(id);
            socketService.off('bid_update', handleBidUpdate);
            socketService.off('bidUpdated', handleBidUpdate);
        };
    }, [id]);

    const handlePlaceBid = async (amount) => {
        if (!isAuthenticated()) {
            alert('Please login to place bids');
            return;
        }
        setBidError('');
        try {
            await bidAPI.placeBid({
                auction_id: Number(id),
                amount: Number(amount)
            });
            // The WebSocket will push the update; also refresh bids as fallback
            await loadBids();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to place bid';
            setBidError(msg);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading auction...</p>
                </div>
            </div>
        );
    }

    if (!auction) return <div className="p-20 text-center">Auction not found.</div>;

    const auctionStatus = auction.status || 'scheduled';
    const isLive = auctionStatus === 'live';

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link to="/auctions" className="hover:text-primary flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Back to Auctions
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900 font-medium">{auction.category}</span>
                    <span>/</span>
                    <span className="truncate max-w-[200px]">{auction.title}</span>
                </div>

                {/* Live Event Status Banner */}
                {isLive && (
                    <div className="mb-6 bg-primary text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            <div>
                                <p className="font-black text-sm uppercase tracking-widest">Live Auction Event</p>
                                <p className="text-xs opacity-90">On-field and online participants are bidding in real-time</p>
                            </div>
                        </div>
                        <CountdownTimer auctionDate={auction.auctionDate} status={auctionStatus} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Image & Info */}
                    <div className="lg:col-span-8 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card p-4 overflow-hidden"
                        >
                            <div className="aspect-video rounded-lg overflow-hidden relative border border-slate-200 shadow-inner">
                                <img
                                    src={auction.image}
                                    alt={auction.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-y-0 left-0 z-20 w-full max-w-[320px] hidden md:block">
                                    <ChatBox />
                                </div>
                                <div className="absolute bottom-6 right-6 z-10">
                                    <div className="bg-slate-900 border border-slate-700 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Session Status</span>
                                            <span className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                                Live Event
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-700" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Floor Presence</span>
                                            <span className="text-sm font-black text-white uppercase tracking-tighter">Active Participants</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="card p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h1 className="text-3xl font-black text-slate-900">{auction.title}</h1>
                                        {isLive && (
                                            <div className="px-2.5 py-1 bg-accent-black text-white rounded text-[10px] font-black uppercase tracking-widest">Live Event</div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                                            ID: #SEC-{auction.id}092
                                        </span>
                                        {auction.location && (
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                                                <ChevronLeft className="w-3 h-3 rotate-[-90deg]" />
                                                {auction.location}
                                            </span>
                                        )}
                                    </div>
                                    {auction.auctionDate && !isLive && (
                                        <div className="mt-2">
                                            <p className="text-xs text-slate-500 font-medium">
                                                Scheduled for: {new Date(auction.auctionDate).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Share2 className="w-5 h-5 text-slate-600" />
                                    </button>
                                    <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Heart className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    Asset Description
                                </h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    {auction.description}
                                </p>
                                {isLive ? (
                                    <div className="bg-primary-light border border-primary/20 rounded-xl p-4">
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                            <strong className="text-primary">Live Event:</strong> This auction is currently being conducted as a live event.
                                            Participants are attending both on-field (at {auction.location || 'the physical location'}) and online.
                                            All bids from both groups are being shared in real-time and coordinated by the admin.
                                        </p>
                                    </div>
                                ) : auctionStatus === 'scheduled' ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                            <strong>Scheduled Live Event:</strong> This auction will be conducted as a live event on the scheduled date.
                                            You can attend either on-field (at {auction.location || 'the physical location'}) or online.
                                            All bids will be shared in real-time between both groups during the live event.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            This auction has been completed.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-primary-light border border-primary/10 rounded-xl">
                                    <Shield className="w-8 h-8 text-primary" />
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">Verified Authenticity</h4>
                                        <p className="text-xs text-slate-500">Physical inspection completed.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs italic">
                                        $
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">Escrow Secure</h4>
                                        <p className="text-xs text-slate-500">Instant settlement available.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bidding & Interaction */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="card p-6 mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 text-center lg:text-left">Current Highest Bid</p>
                                <div className="flex items-center justify-center lg:justify-start gap-4">
                                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                                        ${currentPrice.toLocaleString()}
                                    </h2>
                                    <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                        Active
                                    </div>
                                </div>
                            </div>

                            {auctionStatus === 'scheduled' && (
                                <AuctionRegistration auction={auction} />
                            )}

                            {isLive ? (
                                <BidPanel
                                    currentPrice={currentPrice}
                                    onPlaceBid={handlePlaceBid}
                                />
                            ) : auctionStatus === 'scheduled' ? (
                                <div className="card p-6 bg-slate-900 text-white border-0 shadow-2xl">
                                    <div className="text-center py-8">
                                        <h3 className="text-xl font-black mb-2">Auction Not Started</h3>
                                        <p className="text-slate-400 mb-4">This live auction event will begin on:</p>
                                        <p className="text-2xl font-black text-primary mb-4">
                                            {new Date(auction.auctionDate).toLocaleString()}
                                        </p>
                                        <CountdownTimer auctionDate={auction.auctionDate} status={auctionStatus} />
                                    </div>
                                </div>
                            ) : (
                                <div className="card p-6 bg-slate-900 text-white border-0 shadow-2xl">
                                    <div className="text-center py-8">
                                        <h3 className="text-xl font-black mb-2">Auction Completed</h3>
                                        <p className="text-slate-400">This auction has ended.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <BidHistory bids={currentBids} />
                            <div className="md:hidden">
                                <ChatBox />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionRoom;

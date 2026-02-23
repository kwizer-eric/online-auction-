import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Share2, Heart, ShieldCheck as Shield } from 'lucide-react';
import { mockAuctions } from '../mock/auctions';
import { mockBids } from '../mock/bids';
import { socketService } from '../services/socket';
import CountdownTimer from '../components/CountdownTimer';
import BidPanel from '../components/BidPanel';
import BidHistory from '../components/BidHistory';
import ChatBox from '../components/ChatBox';
import { motion } from 'framer-motion';

const AuctionRoom = () => {
    const { id } = useParams();
    const auction = mockAuctions.find(a => a.id === Number(id));
    const [currentBids, setCurrentBids] = useState(mockBids.filter(b => b.auctionId === Number(id)));
    const [currentPrice, setCurrentPrice] = useState(auction?.currentPrice || 0);

    useEffect(() => {
        // Listen for mock bid updates
        socketService.on('bidUpdated', (data) => {
            if (data.auctionId === Number(id)) {
                const newBid = {
                    id: Date.now(),
                    auctionId: data.auctionId,
                    bidderName: data.bidderName,
                    amount: data.newPrice,
                    type: data.type || 'online',
                    timestamp: data.timestamp
                };
                setCurrentBids(prev => [newBid, ...prev]);
                setCurrentPrice(data.newPrice);
            }
        });
    }, [id]);

    const handlePlaceBid = (amount) => {
        socketService.emit('placeBid', {
            auctionId: Number(id),
            amount: amount,
            bidderName: 'You (Erick)'
        });
    };

    if (!auction) return <div className="p-20 text-center">Auction not found.</div>;

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
                                        <div className="px-2.5 py-1 bg-accent-black text-white rounded text-[10px] font-black uppercase tracking-widest">On-Field Event</div>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                                        ID: #SEC-{auction.id}092
                                    </span>
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
                                <p className="text-slate-600 leading-relaxed">
                                    {auction.description} This asset is being auctioned live at the central bank repository.
                                    Online bids are being relayed to the floor in real-time.
                                </p>
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

                            <BidPanel
                                currentPrice={currentPrice}
                                onPlaceBid={handlePlaceBid}
                            />
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

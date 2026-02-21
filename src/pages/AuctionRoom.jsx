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
                            <div className="aspect-video rounded-lg overflow-hidden relative">
                                <img
                                    src={auction.image}
                                    alt={auction.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-4">
                                    <CountdownTimer endTime={auction.endTime} />
                                </div>
                            </div>
                        </motion.div>

                        <div className="card p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 mb-2">{auction.title}</h1>
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
                                    {auction.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                                <p className="text-slate-600 leading-relaxed mt-4">
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-primary-light border border-primary/10 rounded-xl">
                                    <Shield className="w-8 h-8 text-primary" />
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">Verified Authenticity</h4>
                                        <p className="text-xs text-slate-500">Certificate of transparency included.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs italic">
                                        $
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">Escrow Secure</h4>
                                        <p className="text-xs text-slate-500">Funds protected by global regulations.</p>
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
                                    <div className="bg-primary-light text-primary px-2 py-1 rounded text-xs font-black">
                                        LIVE
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
                            <ChatBox />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionRoom;

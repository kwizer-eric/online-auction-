import React, { useState, useEffect } from 'react';
import { Gavel, Send, X, Square } from 'lucide-react';
import { socketService } from '../services/socket';
import { auctionService } from '../services/auctionService';

const LiveAuctionControl = ({ auction, onClose, onAuctionEnd }) => {
    const [bidAmount, setBidAmount] = useState(auction.currentPrice + 1000);
    const [currentAuction, setCurrentAuction] = useState(auction);

    useEffect(() => {
        // Refresh auction data periodically
        const interval = setInterval(() => {
            const updated = auctionService.getAuction(auction.id);
            if (updated) {
                setCurrentAuction(updated);
                setBidAmount(updated.currentPrice + 1000);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [auction.id]);

    const handleBroadcast = () => {
        socketService.emit('broadcastFloorBid', {
            auctionId: auction.id,
            amount: Number(bidAmount)
        });
        // Success feedback or increment recommendation
        setBidAmount(prev => Number(prev) + 1000);
    };

    return (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <Gavel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs opacity-50">Live Floor Control</h4>
                        <p className="font-bold text-sm truncate max-w-[200px]">{currentAuction.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Current: ${currentAuction.currentPrice.toLocaleString()}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">New Floor Price (USD)</label>
                        <button
                            onClick={() => setBidAmount(auction.currentPrice + 500)}
                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                            Reset to Min (+500)
                        </button>
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-4 pl-8 pr-4 text-2xl font-black text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 5000].map(inc => (
                        <button
                            key={inc}
                            onClick={() => setBidAmount(prev => Number(prev) + inc)}
                            className="py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black transition-all border-b-2 border-slate-950 active:translate-y-0.5 active:border-b-0"
                        >
                            +{inc.toLocaleString()}
                        </button>
                    ))}
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready to Relay</span>
                    <span className="text-lg font-black text-primary">${Number(bidAmount).toLocaleString()}</span>
                </div>

                <button
                    onClick={handleBroadcast}
                    disabled={currentAuction.status !== 'live'}
                    className="w-full bg-primary hover:bg-primary-hover py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    SYNC FLOOR BID TO ONLINE
                </button>

                {currentAuction.status === 'live' && (
                    <button
                        onClick={() => {
                            auctionService.endAuction(currentAuction.id);
                            if (onAuctionEnd) onAuctionEnd();
                            onClose();
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-700 py-3 rounded-xl font-black flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        <Square className="w-4 h-4" />
                        END AUCTION
                    </button>
                )}

                <p className="text-[10px] text-center text-slate-500 font-medium italic">
                    {currentAuction.status === 'live' 
                        ? 'Pushing this will notify all online users instantly.'
                        : 'Auction is not live. Start it from the dashboard.'}
                </p>
            </div>
        </div>
    );
};

export default LiveAuctionControl;

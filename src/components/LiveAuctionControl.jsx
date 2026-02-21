import React, { useState } from 'react';
import { Gavel, Send, X } from 'lucide-react';
import { socketService } from '../services/socket';

const LiveAuctionControl = ({ auction, onClose }) => {
    const [bidAmount, setBidAmount] = useState(auction.currentPrice + 1000);

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
                        <p className="font-bold text-sm truncate max-w-[200px]">{auction.title}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">New Floor Price (USD)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-2xl font-black text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 5000].map(inc => (
                        <button
                            key={inc}
                            onClick={() => setBidAmount(prev => Number(prev) + inc)}
                            className="py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-700"
                        >
                            +{inc.toLocaleString()}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleBroadcast}
                    className="w-full bg-primary hover:bg-primary-hover py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                    <Send className="w-5 h-5" />
                    BROADCAST FLOOR BID
                </button>

                <p className="text-[10px] text-center text-slate-500 font-medium italic">
                    Pushing this will notify all online users instantly.
                </p>
            </div>
        </div>
    );
};

export default LiveAuctionControl;

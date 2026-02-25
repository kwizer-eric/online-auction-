import React, { useState, useEffect } from 'react';
import { Gavel, Send, X, Square, AlertCircle } from 'lucide-react';
import { bidAPI, auctionAPI } from '../services/api';

const LiveAuctionControl = ({ auction, onClose, onAuctionEnd }) => {
    const startingPrice = auction.current_price || auction.currentPrice || 0;
    const [bidAmount, setBidAmount] = useState(startingPrice + 1000);
    const [currentAuction, setCurrentAuction] = useState(auction);
    const [isSending, setIsSending] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Refresh auction data every 5s to get latest price
        const interval = setInterval(async () => {
            try {
                const { auctionAPI: api } = await import('../services/api');
                const res = await api.getById(auction.id);
                setCurrentAuction(res.data);
                const newPrice = res.data.current_price || res.data.starting_price || 0;
                setBidAmount(newPrice + 1000);
            } catch { }
        }, 5000);
        return () => clearInterval(interval);
    }, [auction.id]);

    const handleBroadcast = async () => {
        setError('');
        setSuccess('');
        setIsSending(true);
        try {
            await bidAPI.placeFloorBid({
                auction_id: auction.id,
                amount: Number(bidAmount)
            });
            setSuccess('Floor bid synced successfully!');
            setBidAmount(Number(bidAmount) + 1000);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to sync bid';
            setError(msg);
        } finally {
            setIsSending(false);
        }
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
                        <p className="text-[10px] text-slate-500 mt-1">
                            Current: ${(currentAuction.current_price || currentAuction.currentPrice || 0).toLocaleString()}
                        </p>
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

                {error && (
                    <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-900/30 border border-rose-800 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 text-green-400 text-xs bg-green-900/30 border border-green-800 rounded-lg p-3">
                        ✓ {success}
                    </div>
                )}

                <button
                    onClick={handleBroadcast}
                    disabled={currentAuction.status !== 'live' || isSending}
                    className="w-full bg-primary hover:bg-primary-hover py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            SYNC FLOOR BID TO ONLINE
                        </>
                    )}
                </button>

                {currentAuction.status === 'live' && (
                    <button
                        disabled={isEnding}
                        onClick={async () => {
                            setIsEnding(true);
                            try {
                                await auctionAPI.end(currentAuction.id);
                                if (onAuctionEnd) onAuctionEnd();
                                onClose();
                            } catch (err) {
                                setError('Failed to end auction');
                                setIsEnding(false);
                            }
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-700 py-3 rounded-xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Square className="w-4 h-4" />
                        {isEnding ? 'Ending...' : 'END AUCTION'}
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

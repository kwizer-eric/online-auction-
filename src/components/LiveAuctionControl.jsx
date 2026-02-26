import React, { useState, useEffect, useRef } from 'react';
import { Gavel, Send, X, Square, AlertCircle, Users, MessageSquare, History, Maximize2, Minimize2 } from 'lucide-react';
import { bidAPI, auctionAPI, chatAPI } from '../services/api';
import { socketService } from '../services/socket';
import ChatBox from './ChatBox';

const LiveAuctionControl = ({ auction, onClose, onAuctionEnd }) => {
    const [bidAmount, setBidAmount] = useState(0);
    const [currentAuction, setCurrentAuction] = useState(auction);
    const [isSending, setIsSending] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [bids, setBids] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('bids'); // 'bids' or 'chat' or 'participants'

    useEffect(() => {
        const initialPrice = auction.current_price || auction.starting_price || 0;
        setBidAmount(initialPrice + 1000);
        setCurrentAuction(auction);
        loadInitialBids();

        // Join auction room
        socketService.joinAuction(auction.id);

        const handleBidUpdate = (data) => {
            const newBid = {
                id: data.id || Date.now(),
                auction_id: data.auctionId || data.auction_id,
                bidder_name: data.bidderName || data.bidder_name || 'Anonymous',
                amount: data.newPrice || data.amount,
                type: data.type || 'online',
                timestamp: data.timestamp || data.created_at || new Date().toISOString()
            };
            setBids(prev => [newBid, ...prev].slice(0, 50));
            setCurrentAuction(prev => ({
                ...prev,
                current_price: newBid.amount
            }));
            setBidAmount(newBid.amount + 1000);
        };

        const handleParticipantUpdate = (data) => {
            setParticipants(data.participants || []);
        };

        socketService.on('bidUpdated', handleBidUpdate);
        socketService.on('bid_update', handleBidUpdate);
        socketService.on('participantUpdate', handleParticipantUpdate);

        return () => {
            socketService.off('bidUpdated', handleBidUpdate);
            socketService.off('bid_update', handleBidUpdate);
            socketService.off('participantUpdate', handleParticipantUpdate);
            socketService.leaveAuction(auction.id);
        };
    }, [auction.id]);

    const loadInitialBids = async () => {
        try {
            const res = await bidAPI.getAuctionBids(auction.id, { limit: 20 });
            setBids(res.data || []);
        } catch (err) {
            console.error('Failed to load initial bids:', err);
        }
    };

    const handleBroadcast = async () => {
        setError('');
        setSuccess('');
        setIsSending(true);
        try {
            await bidAPI.placeFloorBid({
                auction_id: auction.id,
                amount: Number(bidAmount),
                bidder_name: "Floor Bidder",
                bidder_number: "FLOOR"
            });
            setSuccess('Floor bid synced successfully!');
            // WebSocket will update bidAmount and currentPrice
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to sync bid';
            setError(msg);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={`bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 transition-all duration-500 overflow-hidden flex flex-col ${isExpanded ? 'fixed inset-4 z-[100] md:inset-10 lg:inset-20' : 'w-full'}`}>
            {/* Header */}
            <div className="bg-slate-800/50 p-6 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
                        <Gavel className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-black uppercase tracking-widest text-[10px] text-primary">Live Command Center</h4>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <p className="font-bold text-lg truncate max-w-[250px]">{currentAuction.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2.5 hover:bg-slate-700 rounded-xl transition-all text-slate-400"
                        title={isExpanded ? "Minimize" : "Full Screen"}
                    >
                        {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                    <button onClick={onClose} className="p-2.5 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className={`flex flex-1 min-h-0 ${isExpanded ? 'flex-col lg:flex-row' : 'flex-col'}`}>
                {/* Main Controls */}
                <div className={`p-6 space-y-6 ${isExpanded ? 'lg:w-1/2 overflow-y-auto' : ''}`}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Current Price</span>
                            <span className="text-3xl font-black text-white">${(currentAuction.current_price || 0).toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Active Bidders</span>
                            <span className="text-3xl font-black text-primary">{participants.length}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Manual Floor Sync (USD)</label>
                                <button
                                    onClick={() => setBidAmount((currentAuction.current_price || 0) + 1000)}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                >
                                    Min Inc (+1,000)
                                </button>
                            </div>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xl">$</span>
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl py-5 pl-10 pr-4 text-3xl font-black text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left rounded-b-2xl" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[1000, 5000, 10000].map(inc => (
                                <button
                                    key={inc}
                                    onClick={() => setBidAmount(prev => Number(prev) + inc)}
                                    className="py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-black transition-all border-b-4 border-slate-950 active:translate-y-1 active:border-b-0 hover:scale-[1.02]"
                                >
                                    +{inc.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-3 text-green-400 text-xs bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                {success}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handleBroadcast}
                                disabled={currentAuction.status !== 'live' || isSending}
                                className="flex-1 bg-primary hover:bg-primary-hover py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20 group disabled:opacity-50 disabled:cursor-not-allowed text-lg uppercase tracking-tighter"
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Sync Floor Bid
                                    </>
                                )}
                            </button>
                        </div>

                        {currentAuction.status === 'live' && (
                            <button
                                disabled={isEnding}
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to end this auction?')) return;
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
                                className="w-full bg-slate-800 hover:bg-rose-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 border border-slate-700 text-slate-400 hover:text-white"
                            >
                                <Square className="w-4 h-4" />
                                {isEnding ? 'Ending...' : 'END AUCTION SESSION'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Tabs / Content */}
                <div className={`border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col min-h-0 ${isExpanded ? 'lg:w-1/2' : 'max-h-[300px]'}`}>
                    <div className="flex border-b border-slate-700 bg-slate-800/30">
                        <button
                            onClick={() => setActiveTab('bids')}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'bids' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}
                        >
                            <History className="w-4 h-4" /> Bids
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'chat' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}
                        >
                            <MessageSquare className="w-4 h-4" /> Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'participants' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Users className="w-4 h-4" /> Online ({participants.length})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        {activeTab === 'bids' && (
                            <div className="divide-y divide-slate-800 p-2">
                                {bids.length === 0 ? (
                                    <div className="py-20 text-center text-slate-600 italic">No bids yet.</div>
                                ) : (
                                    bids.map((bid, idx) => (
                                        <div key={bid.id || idx} className="p-4 flex justify-between items-center group hover:bg-slate-800/40 rounded-xl transition-all">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-black text-white">{bid.bidder_name || bid.bidderName}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${bid.type === 'floor' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                                        {bid.type}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <span className="text-lg font-black text-white tracking-tighter">${(bid.amount).toLocaleString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'chat' && (
                            <div className="h-full flex flex-col">
                                <ChatBox isAdminView={true} auctionId={auction.id} />
                            </div>
                        )}

                        {activeTab === 'participants' && (
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
                                {participants.length === 0 ? (
                                    <div className="py-20 text-center text-slate-600 italic lg:col-span-1">Waiting for participants...</div>
                                ) : (
                                    participants.map((participant, idx) => (
                                        <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-black text-slate-400 text-xs">
                                                {participant.user_name?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{participant.user_name}</p>
                                                <p className="text-[8px] font-black text-primary uppercase tracking-widest">Connected</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950/80 p-3 text-center border-t border-slate-800">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    Hybrid Auction Link Stable • Latency: {participants.length > 0 ? 'Optimal' : '--'} • {isExpanded ? 'Full Spectrum Monitor' : 'Mini Monitor'}
                </p>
            </div>
        </div>
    );
};

export default LiveAuctionControl;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Gavel,
    Send,
    X,
    Square,
    AlertCircle,
    Users,
    TrendingUp,
    Activity,
    ChevronLeft,
    CheckCircle,
    Loader2,
    Bell,
    RotateCcw
} from 'lucide-react';
import { bidAPI, auctionAPI, chatAPI } from '../services/api';
import { socketService } from '../services/socket';
import ChatBox from '../components/ChatBox';

// --- Sub-components ---

const StatusBadge = ({ status }) => {
    const map = {
        live: { label: 'Live', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
        ended: { label: 'Ended', cls: 'bg-slate-700 text-slate-400 border-slate-600' },
        upcoming: { label: 'Upcoming', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    };
    const { label, cls } = map[status] || map.upcoming;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${cls}`}>
            {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
            {label}
        </span>
    );
};

const KpiCard = ({ label, value, sub, accent = false }) => (
    <div className={`rounded-xl p-4 border flex flex-col gap-1 ${accent ? 'bg-primary/10 border-primary/30' : 'bg-[#1c1f26] border-slate-800'}`}>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold tabular-nums leading-tight ${accent ? 'text-primary' : 'text-white'}`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
);

const SectionHeader = ({ label }) => (
    <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">{label}</h3>
);

const FeedbackBanner = ({ success, error }) => {
    if (!success && !error) return null;
    if (success) return (
        <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            {success}
        </div>
    );
    return (
        <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            {error}
        </div>
    );
};

// --- Main Page ---

const LiveControlCenter = () => {
    const { auctionId } = useParams();
    const navigate = useNavigate();

    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [warningStep, setWarningStep] = useState(0); // 0 = idle, 1,2,3 = sequenced
    const lastBidTimes = useRef([]);
    const [bidVelocity, setBidVelocity] = useState(0);

    const bidValues = useMemo(() => bids.map(b => b.amount), [bids]);

    const gainPct = useMemo(() => {
        if (!auction?.starting_price || !auction?.current_price) return null;
        return (((auction.current_price - auction.starting_price) / auction.starting_price) * 100).toFixed(1);
    }, [auction]);

    useEffect(() => {
        loadData();
        socketService.joinAuction(auctionId);

        const handleBidUpdate = (data) => {
            const now = Date.now();
            lastBidTimes.current = [...lastBidTimes.current, now].filter(t => now - t < 60000);
            setBidVelocity(lastBidTimes.current.length);
            setWarningStep(0);

            const newBid = {
                id: data.id || Date.now(),
                bidder_name: data.bidderName || data.bidder_name || 'Anonymous',
                bidder_number: data.bidderNumber || data.bidder_number || '—',
                amount: data.newPrice || data.amount,
                type: data.type || 'online',
                timestamp: data.timestamp || data.created_at || new Date().toISOString(),
            };
            setBids(prev => [newBid, ...prev].slice(0, 100));
            setAuction(prev => prev ? { ...prev, current_price: newBid.amount } : prev);
            setBidAmount(String(newBid.amount + 1000));
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
            socketService.leaveAuction(auctionId);
        };
    }, [auctionId]);

    const loadData = async () => {
        try {
            const [aucRes, bidsRes] = await Promise.all([
                auctionAPI.getById(auctionId),
                bidAPI.getAuctionBids(auctionId, { limit: 50 }),
            ]);
            setAuction(aucRes.data);
            setBids(bidsRes.data || []);
            const next = (aucRes.data.current_price || aucRes.data.starting_price || 0) + (aucRes.data.bid_increment || 1000);
            setBidAmount(String(next));
        } catch (err) {
            setError('Failed to load auction data. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const flashSuccess = (msg) => {
        setSuccess(msg);
        setError('');
        setTimeout(() => setSuccess(''), 3500);
    };

    const flashError = (msg) => {
        setError(msg);
        setSuccess('');
        setTimeout(() => setError(''), 4000);
    };

    const handleFloorBid = async () => {
        const amount = Number(bidAmount);
        if (!amount || amount <= (auction?.current_price || 0)) {
            return flashError('Amount must be higher than the current bid.');
        }
        setIsSending(true);
        try {
            await bidAPI.placeFloorBid({
                auction_id: auctionId,
                amount,
                bidder_name: 'Auctioneer',
                bidder_number: 'HOST',
            });
            flashSuccess(`Floor bid of $${amount.toLocaleString()} synced successfully.`);
        } catch (err) {
            flashError(err.response?.data?.detail || 'Failed to sync floor bid.');
        } finally {
            setIsSending(false);
        }
    };

    const handleFairWarning = async (step) => {
        const labels = ['Going Once…', 'Going Twice…', 'Fair Warning — Final Call!'];
        setWarningStep(step);
        try {
            await chatAPI.sendMessage({
                auction_id: auctionId,
                message: labels[step - 1],
                is_admin_message: true,
            });
        } catch (err) {
            console.error('Failed to broadcast warning:', err);
        }
    };

    const handleEndAuction = async () => {
        if (!window.confirm('End this auction? This action cannot be undone.')) return;
        setIsEnding(true);
        try {
            await auctionAPI.end(auctionId);
            navigate('/admin');
        } catch (err) {
            flashError(err.response?.data?.detail || 'Failed to end auction.');
            setIsEnding(false);
        }
    };

    // ---- Loading ----
    if (loading) return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Loading auction data…</p>
            </div>
        </div>
    );

    const minNextBid = (auction?.current_price || auction?.starting_price || 0) + (auction?.bid_increment || 1000);

    return (
        <div className="h-screen bg-[#0f1117] text-slate-200 flex flex-col overflow-hidden text-sm">

            {/* ── TOPBAR ── */}
            <header className="h-14 bg-[#0f1117] border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Dashboard
                    </button>
                    <div className="h-5 w-px bg-slate-800" />
                    <div className="flex items-center gap-3">
                        <Gavel className="w-4 h-4 text-primary" />
                        <h1 className="font-semibold text-white text-sm truncate max-w-[340px]">
                            {auction?.title || 'Loading…'}
                        </h1>
                        <StatusBadge status={auction?.status} />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">
                        {participants.length} online
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-slate-500">WebSocket Active</span>
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">

                {/* ── COL 1: Context Panel ── */}
                <aside className="col-span-3 border-r border-slate-800 flex flex-col overflow-hidden bg-[#0f1117]">

                    {/* Asset Card */}
                    <div className="p-5 border-b border-slate-800">
                        <div className="rounded-xl overflow-hidden mb-4 bg-slate-900 aspect-video">
                            {auction?.image ? (
                                <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <Gavel className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-white text-base leading-snug mb-1">{auction?.title}</h2>
                        <p className="text-xs text-slate-500 mb-3">{auction?.description?.slice(0, 80)}{auction?.description?.length > 80 ? '…' : ''}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                                <p className="text-slate-500 mb-0.5">Category</p>
                                <p className="font-semibold text-white capitalize">{auction?.category || '—'}</p>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                                <p className="text-slate-500 mb-0.5">Min Increment</p>
                                <p className="font-semibold text-white">${(auction?.bid_increment || 1000).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Online Participants */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Registered Bidders</span>
                            </div>
                            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                {participants.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {participants.length === 0 ? (
                                <div className="flex items-center justify-center h-24 text-slate-600 text-xs">No participants online</div>
                            ) : (
                                participants.map((p, i) => (
                                    <div key={p.user_id || i} className="flex items-center gap-3 px-5 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                                            {(p.user_name || '?')[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white text-xs truncate">{p.user_name}</p>
                                            <p className="text-[11px] text-slate-500">#{p.bidder_number || p.user_id?.slice(-6)}</p>
                                        </div>
                                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Online" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* ── COL 2: Operations Center ── */}
                <main className="col-span-6 flex flex-col min-h-0 overflow-y-auto border-r border-slate-800">
                    <div className="flex-1 p-6 space-y-6">

                        {/* Section: KPI Row */}
                        <div>
                            <SectionHeader label="Auction Stats" />
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <KpiCard
                                    label="Current Bid"
                                    value={`$${(auction?.current_price || 0).toLocaleString()}`}
                                    sub={gainPct ? `+${gainPct}% from start` : undefined}
                                    accent={true}
                                />
                                <KpiCard
                                    label="Starting Price"
                                    value={`$${(auction?.starting_price || 0).toLocaleString()}`}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <KpiCard label="Total Bids" value={bids.length} />
                                <KpiCard label="Bid Velocity" value={`${bidVelocity}/min`} sub="Rolling 60s" />
                                <KpiCard
                                    label="Net Gain"
                                    value={`+$${((auction?.current_price || 0) - (auction?.starting_price || 0)).toLocaleString()}`}
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-800" />

                        {/* Section: Bid History (last 5 visible) */}
                        <div>
                            <SectionHeader label="Bid Log" />
                            <div className="rounded-xl border border-slate-800 overflow-hidden">
                                {bids.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-slate-600">No bids yet</div>
                                ) : (
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-800/50">
                                                <th className="text-left px-4 py-2.5 font-semibold text-slate-400">Bidder</th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-slate-400">Bidder #</th>
                                                <th className="text-right px-4 py-2.5 font-semibold text-slate-400">Amount</th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-slate-400">Type</th>
                                                <th className="text-right px-4 py-2.5 font-semibold text-slate-400">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bids.map((bid, i) => (
                                                <tr key={bid.id || i} className={`border-t border-slate-800 ${i === 0 ? 'bg-primary/5' : 'hover:bg-slate-800/20'} transition-colors`}>
                                                    <td className={`px-4 py-3 font-medium ${i === 0 ? 'text-primary' : 'text-white'}`}>
                                                        {bid.bidder_name}
                                                        {i === 0 && <span className="ml-2 text-[10px] bg-primary text-white rounded px-1 font-bold">Latest</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{bid.bidder_number || '—'}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-white">${bid.amount.toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${bid.type === 'floor' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}`}>
                                                            {bid.type === 'floor' ? 'Floor' : 'Online'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-slate-500 tabular-nums">
                                                        {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-800" />

                        {/* Section: Floor Bid Relay */}
                        <div>
                            <SectionHeader label="Floor Bid Relay" />
                            <div className="bg-[#1c1f26] border border-slate-800 rounded-xl p-5">
                                <p className="text-[11px] text-slate-500 mb-4">
                                    Sync a bid from a floor (in-room) participant. Minimum next bid: <span className="text-white font-semibold">${minNextBid.toLocaleString()}</span>
                                </p>
                                <div className="flex gap-3 mb-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg select-none">$</span>
                                        <input
                                            type="number"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            min={minNextBid}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition tabular-nums"
                                            placeholder={String(minNextBid)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleFloorBid}
                                        disabled={isSending}
                                        className="px-6 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shrink-0"
                                    >
                                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Sync Bid
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {[1000, 5000, 10000, 25000].map(inc => (
                                        <button
                                            key={inc}
                                            onClick={() => setBidAmount(prev => String(Number(prev) + inc))}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                                        >
                                            +{inc.toLocaleString()}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setBidAmount(String(minNextBid))}
                                        className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-primary flex items-center gap-1 transition-colors ml-auto"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Reset to Min
                                    </button>
                                </div>
                                <div className="mt-4 h-5">
                                    <FeedbackBanner success={success} error={error} />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-800" />

                        {/* Section: Closing Sequence */}
                        <div>
                            <SectionHeader label="Closing Sequence" />
                            <p className="text-[11px] text-slate-500 mb-4">
                                Broadcast each stage in order. Each action sends a message to the live chat visible to all bidders.
                            </p>
                            <div className="flex items-stretch gap-3 mb-5">
                                {[
                                    { step: 1, label: 'Going Once' },
                                    { step: 2, label: 'Going Twice' },
                                    { step: 3, label: 'Fair Warning', icon: <Bell className="w-4 h-4" /> },
                                ].map(({ step, label, icon }) => {
                                    const active = warningStep >= step;
                                    return (
                                        <button
                                            key={step}
                                            onClick={() => handleFairWarning(step)}
                                            className={`flex-1 py-3 px-4 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${active
                                                    ? 'bg-primary border-primary text-white'
                                                    : 'bg-[#1c1f26] border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                                                }`}
                                        >
                                            {active && !icon && <CheckCircle className="w-4 h-4" />}
                                            {icon}
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* End Auction */}
                            <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-red-400 mb-1">End Auction</p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Permanently close this auction. The highest bid at this point will be declared the winner. This cannot be undone.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleEndAuction}
                                        disabled={isEnding}
                                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        {isEnding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                                        End Auction
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom padding */}
                        <div className="h-4" />
                    </div>
                </main>

                {/* ── COL 3: Live Chat ── */}
                <aside className="col-span-3 flex flex-col min-h-0 bg-[#0f1117]">
                    <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2 shrink-0">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Live Chat</span>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ChatBox auctionId={auctionId} isAdminView={true} />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default LiveControlCenter;

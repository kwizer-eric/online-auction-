import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Gavel,
    Clock,
    Users,
    TrendingUp,
    Calendar,
    ChevronRight,
    Loader2,
    Radio
} from 'lucide-react';
import { auctionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

// ── Helpers ──────────────────────────────────────────────────

const FadeIn = ({ children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

const FadeInView = ({ children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

const StatusBadge = ({ status }) => {
    if (status === 'live') return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Live
        </span>
    );
    if (status === 'upcoming') return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold uppercase">
            <Calendar className="w-3 h-3" />
            Upcoming
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/40 text-slate-400 text-[10px] font-bold uppercase">
            Ended
        </span>
    );
};

const AuctionCard = ({ auction, delay = 0 }) => (
    <FadeInView delay={delay}>
        <Link
            to={`/auction/${auction.id}`}
            className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
        >
            <div className="relative h-52 bg-slate-100 overflow-hidden">
                {auction.image ? (
                    <img
                        src={auction.image}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Gavel className="w-10 h-10 text-slate-300" />
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <StatusBadge status={auction.status} />
                </div>
                {auction.status === 'live' && (
                    <div className="absolute inset-0 bg-red-600/5 group-hover:bg-transparent transition-colors" />
                )}
            </div>
            <div className="p-5">
                {auction.category && (
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{auction.category}</p>
                )}
                <h3 className="font-bold text-slate-900 text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {auction.title}
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                            {auction.status === 'live' ? 'Current Bid' : auction.status === 'ended' ? 'Final Bid' : 'Starting At'}
                        </p>
                        <p className="text-xl font-black text-slate-900">
                            ${(auction.current_price || auction.starting_price || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-primary flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </Link>
    </FadeInView>
);

// ── Main Component ───────────────────────────────────────────

const Welcome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [liveAuctions, setLiveAuctions] = useState([]);
    const [upcomingAuctions, setUpcomingAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    // If already logged in, redirect to auctions
    useEffect(() => {
        if (user) {
            navigate('/auctions', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        const load = async () => {
            try {
                const [liveRes, upcomingRes] = await Promise.all([
                    auctionAPI.getAll({ status: 'live' }),
                    auctionAPI.getAll({ status: 'upcoming' }),
                ]);
                setLiveAuctions((liveRes.data || []).slice(0, 3));
                setUpcomingAuctions((upcomingRes.data || []).slice(0, 3));
            } catch (e) {
                console.error('Welcome data error:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="flex flex-col bg-white min-h-screen">

            {/* ══ HERO ════════════════════════════════════════ */}
            <section className="relative bg-[#0c0f14] overflow-hidden">
                {/* Background accent */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(125,26,6,0.2),transparent_60%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(125,26,6,0.08),transparent_60%)] pointer-events-none" />

                <div className="max-w-5xl mx-auto px-6 sm:px-8 py-28 text-center relative z-10">
                    <FadeIn delay={0}>
                        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                            <Radio className="w-3.5 h-3.5 animate-pulse" />
                            Hybrid Live Auction Platform
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.08}>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.92] tracking-tighter mb-6">
                            Bid Live.{' '}
                            <span className="text-primary italic">Win Big.</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                            Join thousands of bidders on SecureBid — the platform that connects physical auction floors with the global digital audience in real time.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.22} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all active:scale-95 shadow-lg shadow-primary/30"
                        >
                            Create Free Account <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all"
                        >
                            Sign In
                        </Link>
                    </FadeIn>

                    {/* Stats */}
                    <FadeIn delay={0.3} className="mt-16 pt-10 border-t border-white/5 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                        {[
                            { val: '$2.4B+', lab: 'Trade Volume' },
                            { val: '48K+', lab: 'Active Bidders' },
                            { val: '99.9%', lab: 'Uptime' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl font-black text-white">{s.val}</p>
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">{s.lab}</p>
                            </div>
                        ))}
                    </FadeIn>
                </div>
            </section>

            {/* ══ LIVE AUCTIONS ══════════════════════════════ */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6 sm:px-8">
                    <FadeInView className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Happening Now</p>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Live Auctions</h2>
                        </div>
                        <Link
                            to="/auctions"
                            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
                        >
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </FadeInView>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : liveAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveAuctions.map((a, i) => (
                                <AuctionCard key={a.id} auction={a} delay={i * 0.07} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 py-16 text-center">
                            <Gavel className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No live auctions right now</p>
                            <p className="text-slate-400 text-sm mt-1">Check back soon or view upcoming lots below</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ══ UPCOMING AUCTIONS ══════════════════════════ */}
            <section className="py-20 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 sm:px-8">
                    <FadeInView className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                                <p className="text-[11px] font-bold text-sky-500 uppercase tracking-widest">Coming Soon</p>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Upcoming Lots</h2>
                        </div>
                        <Link
                            to="/auctions"
                            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
                        >
                            Browse All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </FadeInView>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : upcomingAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingAuctions.map((a, i) => (
                                <AuctionCard key={a.id} auction={a} delay={i * 0.07} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No upcoming auctions scheduled</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ══ HOW IT WORKS ═══════════════════════════════ */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
                    <FadeInView>
                        <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Simple Process</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-12">How It Works</h2>
                    </FadeInView>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { n: '01', title: 'Register Your Account', body: 'Create a free account and complete your identity verification in minutes.' },
                            { n: '02', title: 'Join a Live Auction', body: 'Browse upcoming lots, get notified, and join the session when it goes live.' },
                            { n: '03', title: 'Bid & Win', body: 'Place competitive bids in real time — online or synced from the auction floor.' },
                        ].map((h, i) => (
                            <FadeInView key={i} delay={i * 0.1}>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                                        <span className="text-xl font-black text-primary">{h.n}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base mb-2">{h.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{h.body}</p>
                                </div>
                            </FadeInView>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ CTA ════════════════════════════════════════ */}
            <section className="py-24 bg-[#0c0f14]">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <FadeInView>
                        <h2 className="text-4xl font-black text-white tracking-tight mb-4">
                            Ready to Place Your First Bid?
                        </h2>
                        <p className="text-slate-400 mb-10">
                            Register for free and get instant access to all live and upcoming auctions on SecureBid.
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all active:scale-95 shadow-lg shadow-primary/30"
                        >
                            Get Started — It's Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <p className="mt-6 text-slate-600 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
                        </p>
                    </FadeInView>
                </div>
            </section>

            {/* ══ FOOTER ═════════════════════════════════════ */}
            <footer className="bg-[#0c0f14] border-t border-white/5 py-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded">
                            <Gavel className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-black tracking-tighter text-lg">
                            SECURE<span className="text-primary italic">BID</span>
                        </span>
                    </div>
                    <p className="text-slate-600 text-xs">© 2026 SecureBid. All rights reserved.</p>
                    <div className="flex items-center gap-5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                        <Link to="/auctions" className="hover:text-white transition-colors">Browse</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Register</Link>
                        <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;

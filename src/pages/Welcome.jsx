import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, Gavel, Clock, ChevronRight, Loader2,
    ShieldCheck, Users, Building2, Star, Award, Heart, Banknote
} from 'lucide-react';
import { auctionAPI, bidAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

/* ─── Animation helpers ─────────────────────────────── */
const ease = [0.22, 1, 0.36, 1];
const FadeUp = ({ children, delay = 0, className = '' }) => (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease }} className={className}>
        {children}
    </motion.div>
);
const FadeUpView = ({ children, delay = 0, className = '' }) => (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, delay, ease }}
        className={className}>
        {children}
    </motion.div>
);

/* ─── Status badge ──────────────────────────────────── */
const StatusPill = ({ status }) => {
    if (status === 'live') return (
        <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live Now
        </span>
    );
    if (status === 'upcoming') return (
        <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-md">
            <Clock className="w-3 h-3" /> Upcoming
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 bg-slate-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Ended</span>
    );
};

/* ─── Auction card ──────────────────────────────────── */
const AuctionTile = ({ auction, delay = 0 }) => (
    <FadeUpView delay={delay}>
        <Link to={`/auction/${auction.id}`}
            className="group block rounded-2xl overflow-hidden bg-white border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="relative h-52 overflow-hidden bg-slate-100">
                {auction.image
                    ? <img src={auction.image} alt={auction.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Gavel className="w-10 h-10 text-slate-300" /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-3 left-3"><StatusPill status={auction.status} /></div>
                {auction.category && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                        {auction.category}
                    </div>
                )}
            </div>
            <div className="p-5">
                <h3 className="font-bold text-slate-900 text-[15px] mb-3 line-clamp-1 group-hover:text-primary transition-colors">{auction.title}</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                            {auction.status === 'live' ? 'Current Bid' : auction.status === 'ended' ? 'Final Bid' : 'Opening Bid'}
                        </p>
                        <p className="text-xl font-black text-slate-900 tabular-nums">
                            ${(auction.current_price || auction.starting_price || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-all">
                        <ChevronRight className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </Link>
    </FadeUpView>
);

/* ─── Main component ────────────────────────────────── */
const Welcome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [liveAuctions, setLiveAuctions] = useState([]);
    const [upcomingAuctions, setUpcomingAuctions] = useState([]);
    const [heroAuction, setHeroAuction] = useState(null);
    const [heroBids, setHeroBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (user) navigate('/auctions', { replace: true }); }, [user, navigate]);

    useEffect(() => {
        const load = async () => {
            try {
                const [liveRes, upcomingRes] = await Promise.all([
                    auctionAPI.getAll({ status: 'live' }),
                    auctionAPI.getAll({ status: 'upcoming' }),
                ]);
                const live = liveRes.data || [];
                const upcoming = upcomingRes.data || [];
                setLiveAuctions(live.slice(0, 3));
                setUpcomingAuctions(upcoming.slice(0, 3));

                let hero = live[0] || upcoming[0] || null;
                if (!hero) { const anyRes = await auctionAPI.getAll(); hero = (anyRes.data || [])[0] || null; }
                if (hero) {
                    setHeroAuction(hero);
                    try { const r = await bidAPI.getAuctionBids(hero.id, { limit: 3 }); setHeroBids(r.data || []); } catch (_) { }
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div className="flex flex-col bg-white overflow-x-hidden">

            {/* ════════════════════════════════════════════════
                HERO — Full-bleed with photo backdrop
            ════════════════════════════════════════════════ */}
            <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
                {/* Background photo */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1600&auto=format&fit=crop"
                        alt="Community"
                        className="w-full h-full object-cover"
                    />
                    {/* Rich overlay */}
                    <div className="absolute inset-0 bg-[#0a0c12]/75" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c12]/95 via-[#0a0c12]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c12]/80 via-transparent to-transparent" />
                </div>

                {/* Decorative accent line */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-60" />

                <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-14 lg:px-20 py-28 grid lg:grid-cols-2 gap-16 items-center w-full">
                    {/* Left — editorial content */}
                    <div>
                        <FadeUp delay={0}>
                            <div className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">SecureBank · Community Auctions</span>
                            </div>
                        </FadeUp>

                        <FadeUp delay={0.07}>
                            <h1 className="text-5xl sm:text-6xl xl:text-[68px] font-black text-white leading-[0.95] tracking-tighter mb-6">
                                Real Assets.<br />
                                Real People.<br />
                                <span className="text-primary italic">Real Opportunity.</span>
                            </h1>
                        </FadeUp>

                        <FadeUp delay={0.14}>
                            <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-md">
                                SecureBank's official auction platform — giving our community direct access to prime repossessed assets, property, vehicles, and more at fair, transparent prices.
                            </p>
                        </FadeUp>

                        <FadeUp delay={0.2} className="flex flex-col sm:flex-row gap-3 mb-12">
                            <Link to="/register"
                                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.97] shadow-xl shadow-primary/30">
                                Register to Bid <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/login"
                                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all backdrop-blur-sm">
                                Sign In
                            </Link>
                        </FadeUp>

                        {/* Trust indicators */}
                        <FadeUp delay={0.26} className="flex flex-wrap gap-5">
                            {[
                                { icon: <ShieldCheck className="w-4 h-4 text-green-400" />, label: 'Bank-Regulated' },
                                { icon: <Award className="w-4 h-4 text-amber-400" />, label: 'Certified Auctions' },
                                { icon: <Heart className="w-4 h-4 text-rose-400" />, label: 'Community First' },
                            ].map((t, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 px-3 py-2 rounded-full">
                                    {t.icon}
                                    <span className="text-white text-xs font-semibold">{t.label}</span>
                                </div>
                            ))}
                        </FadeUp>
                    </div>

                    {/* Right — featured lot card */}
                    <div className="hidden lg:block">
                        {heroAuction ? (
                            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.9, delay: 0.35, ease }}
                                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
                                {/* Top image */}
                                <div className="relative h-56">
                                    {heroAuction.image
                                        ? <img src={heroAuction.image} alt={heroAuction.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center bg-slate-900"><Gavel className="w-12 h-12 text-slate-600" /></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute top-4 left-4"><StatusPill status={heroAuction.status} /></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">{heroAuction.category || 'Featured Lot'}</p>
                                        <h3 className="text-white font-black text-xl leading-tight line-clamp-1">{heroAuction.title}</h3>
                                    </div>
                                </div>
                                {/* Body */}
                                <div className="p-6">
                                    <div className="flex items-end justify-between mb-5">
                                        <div>
                                            <p className="text-white/50 text-[11px] font-semibold mb-0.5">
                                                {heroAuction.status === 'ended' ? 'Final Price' : heroAuction.status === 'live' ? 'Current Bid' : 'Opening From'}
                                            </p>
                                            <p className="text-3xl font-black text-white tabular-nums">
                                                ${(heroAuction.current_price || heroAuction.starting_price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        {heroBids.length > 0 && (
                                            <div className="text-right">
                                                <p className="text-white/50 text-[11px] font-semibold mb-0.5">Bidders</p>
                                                <p className="text-xl font-black text-white">{heroBids.length}+</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bids preview */}
                                    {heroBids.length > 0 && (
                                        <div className="space-y-2 mb-5">
                                            {heroBids.map((bid, i) => (
                                                <div key={bid.id || i} className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs ${i === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-white/5'}`}>
                                                    <span className={`font-semibold ${i === 0 ? 'text-white' : 'text-white/50'}`}>{bid.bidder_name || 'Community Member'}</span>
                                                    <span className={`font-black tabular-nums ${i === 0 ? 'text-primary' : 'text-white/40'}`}>${(bid.amount || 0).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Link to={`/auction/${heroAuction.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg shadow-primary/30">
                                        {heroAuction.status === 'live' ? 'Bid Now' : heroAuction.status === 'upcoming' ? 'Register Interest' : 'View Results'}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white/10 rounded-3xl border border-white/15 overflow-hidden animate-pulse">
                                <div className="h-56 bg-white/5" />
                                <div className="p-6 space-y-3">
                                    <div className="h-8 bg-white/10 rounded w-2/3" />
                                    <div className="h-5 bg-white/10 rounded" />
                                    <div className="h-11 bg-white/10 rounded-xl" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                STATS BAR
            ════════════════════════════════════════════════ */}
            <section className="bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
                    {[
                        { val: '12,000+', lab: 'Assets Auctioned', icon: <Gavel className="w-5 h-5 text-primary" /> },
                        { val: '48,000+', lab: 'Registered Bidders', icon: <Users className="w-5 h-5 text-primary" /> },
                        { val: '$2.4B+', lab: 'Community Value Unlocked', icon: <Banknote className="w-5 h-5 text-primary" /> },
                        { val: '99.9%', lab: 'Secure & Verified', icon: <ShieldCheck className="w-5 h-5 text-primary" /> },
                    ].map((s, i) => (
                        <FadeUpView key={i} delay={i * 0.05} className="py-7 px-6 text-center border-r last:border-r-0 border-slate-100">
                            <div className="flex justify-center mb-2">{s.icon}</div>
                            <p className="text-2xl font-black text-slate-900">{s.val}</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{s.lab}</p>
                        </FadeUpView>
                    ))}
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                LIVE AUCTIONS
            ════════════════════════════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 sm:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <FadeUpView>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Happening Right Now</p>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Live Auctions</h2>
                        </FadeUpView>
                        <FadeUpView className="hidden sm:block">
                            <Link to="/auctions" className="text-sm font-semibold text-slate-400 hover:text-primary flex items-center gap-1.5 transition-colors">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </FadeUpView>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                    ) : liveAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveAuctions.map((a, i) => <AuctionTile key={a.id} auction={a} delay={i * 0.07} />)}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 py-16 text-center">
                            <Gavel className="w-9 h-9 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">No live auctions right now</p>
                            <p className="text-slate-400 text-xs mt-1">Upcoming lots are scheduled below</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                PHOTO STORY — Community Mission
            ════════════════════════════════════════════════ */}
            <section className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Images collage */}
                    <FadeUpView className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="rounded-2xl overflow-hidden h-52 shadow-lg">
                                    <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop"
                                        alt="Community auction" className="w-full h-full object-cover" />
                                </div>
                                <div className="rounded-2xl overflow-hidden h-32 shadow-lg">
                                    <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop"
                                        alt="Banking" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="space-y-4 mt-8">
                                <div className="rounded-2xl overflow-hidden h-32 shadow-lg">
                                    <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop"
                                        alt="Property" className="w-full h-full object-cover" />
                                </div>
                                <div className="rounded-2xl overflow-hidden h-52 shadow-lg">
                                    <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0729?q=80&w=600&auto=format&fit=crop"
                                        alt="Cars" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-2xl shadow-2xl shadow-primary/30 flex items-center gap-3 whitespace-nowrap">
                            <Star className="w-5 h-5 fill-white" />
                            <span className="font-black text-sm">Bank-Certified Auction Program</span>
                        </div>
                    </FadeUpView>

                    {/* Text */}
                    <FadeUpView delay={0.1}>
                        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.25em] mb-4">Our Mission</p>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                            Giving Assets Back<br />to the Community
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-6 text-base">
                            SecureBank's auction program was designed with one goal: to create fair, transparent access to repossessed and surplus assets for everyday people — not just investors.
                        </p>
                        <p className="text-slate-500 leading-relaxed mb-8 text-sm">
                            Every auction is conducted following strict banking regulations, with complete transparency in pricing, bidder identity verification, and post-sale documentation. Whether you're looking for your first vehicle, a property, or business equipment — this is your platform.
                        </p>
                        <div className="space-y-3">
                            {[
                                'All assets legally verified & bank-certified',
                                'Open to all registered community members',
                                'No hidden fees — what you bid is what you pay',
                                'Full documentation provided on asset handover',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-slate-700 text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </FadeUpView>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                UPCOMING AUCTIONS
            ════════════════════════════════════════════════ */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 sm:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <FadeUpView>
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Coming Soon</p>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Upcoming Lots</h2>
                        </FadeUpView>
                        <FadeUpView className="hidden sm:block">
                            <Link to="/auctions" className="text-sm font-semibold text-slate-400 hover:text-primary flex items-center gap-1.5 transition-colors">
                                Browse all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </FadeUpView>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                    ) : upcomingAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingAuctions.map((a, i) => <AuctionTile key={a.id} auction={a} delay={i * 0.07} />)}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 py-16 text-center">
                            <Clock className="w-9 h-9 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">No upcoming auctions scheduled yet</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                HOW IT WORKS
            ════════════════════════════════════════════════ */}
            <section className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="max-w-5xl mx-auto px-6 sm:px-8">
                    <FadeUpView className="text-center mb-16">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.25em] mb-3">Simple. Transparent. Fair.</p>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">How to Participate</h2>
                    </FadeUpView>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { n: '01', icon: <Users className="w-6 h-6 text-primary" />, title: 'Open Your Account', body: 'Register with your national ID and bank account details. Approval takes under 24 hours.' },
                            { n: '02', icon: <Gavel className="w-6 h-6 text-primary" />, title: 'Browse the Catalog', body: 'View available lots — property, vehicles, equipment. Read full asset reports before bidding.' },
                            { n: '03', icon: <Star className="w-6 h-6 text-primary" />, title: 'Place Your Bid', body: 'Bid live when the auction opens. Online bids compete with in-room floor bids in real time.' },
                            { n: '04', icon: <ShieldCheck className="w-6 h-6 text-primary" />, title: 'Win & Collect', body: 'Winners receive official bank documentation and complete the transfer through our secure process.' },
                        ].map((s, i) => (
                            <FadeUpView key={i} delay={i * 0.08}>
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">{s.icon}</div>
                                        <span className="text-4xl font-black text-slate-100">{s.n}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-[15px] mb-2">{s.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
                                </div>
                            </FadeUpView>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                CTA BANNER — Photo background
            ════════════════════════════════════════════════ */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1600&auto=format&fit=crop"
                        alt="Community handshake" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#0a0c12]/85" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c12]/90 to-[#0a0c12]/60" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <FadeUpView>
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest">
                            <Heart className="w-3.5 h-3.5 fill-primary" /> Community-Powered Auctions
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tight leading-tight mb-5">
                            Join Thousands of<br />Community Members
                        </h2>
                        <p className="text-slate-300 text-base mb-10 max-w-xl mx-auto leading-relaxed">
                            Be part of a transparent, bank-backed auction community. Fair prices. Verified assets. No surprises.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register"
                                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.97] shadow-2xl shadow-primary/30">
                                Create Your Account <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/auctions"
                                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all">
                                Explore Auctions
                            </Link>
                        </div>
                        <p className="mt-7 text-slate-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-2">Sign in here</Link>
                        </p>
                    </FadeUpView>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                FOOTER
            ════════════════════════════════════════════════ */}
            <footer className="bg-[#080a0f] border-t border-white/5 py-12">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 items-start mb-10">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-3">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <Gavel className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-black tracking-tighter text-base">
                                SECURE<span className="text-primary italic">BID</span>
                            </span>
                        </Link>
                        <p className="text-slate-600 text-xs leading-relaxed">
                            The official auction platform of SecureBank, serving the community with regulated, transparent asset sales.
                        </p>
                    </div>
                    {/* Links */}
                    <div>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">Platform</p>
                        <div className="space-y-2">
                            {[['Browse Auctions', '/auctions'], ['Register', '/register'], ['Sign In', '/login']].map(([l, h]) => (
                                <Link key={h} to={h} className="block text-slate-600 hover:text-white text-sm transition-colors">{l}</Link>
                            ))}
                        </div>
                    </div>
                    {/* Info */}
                    <div>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">SecureBank</p>
                        <p className="text-slate-600 text-xs leading-relaxed">
                            All auctions are conducted in compliance with banking and financial regulations. Assets are verified prior to listing.
                        </p>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-6 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-slate-700 text-xs">© 2026 SecureBank. All rights reserved. Licensed financial institution.</p>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 text-xs font-semibold">Bank-Regulated Platform</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;

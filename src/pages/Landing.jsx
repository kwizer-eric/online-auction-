import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    Zap,
    Globe2,
    ArrowRight,
    Gavel,
    Users,
    Building2,
    TrendingUp,
    Clock,
    ChevronRight,
    CheckCircle
} from 'lucide-react';
import { auctionAPI, bidAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import { motion } from 'framer-motion';

// ── Fade-in wrapper ─────────────────────────────────────────
const FadeIn = ({ children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

const FadeInView = ({ children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

// ── Stats data ───────────────────────────────────────────────
const STATS = [
    { value: '$2.4B+', label: 'Total Trade Volume' },
    { value: '48,000+', label: 'Active Bidders' },
    { value: '12,000+', label: 'Auctions Completed' },
    { value: '99.9%', label: 'Platform Uptime' },
];

// ── Trust pillars ────────────────────────────────────────────
const TRUST = [
    {
        icon: <Building2 className="w-5 h-5 text-primary" />,
        title: 'SEC-Compliant Custody',
        body: 'All assets are held in institutional-grade storage facilities until final settlement — physical and digital.'
    },
    {
        icon: <Gavel className="w-5 h-5 text-orange-700" />,
        title: 'Legally Binding Bids',
        body: 'Every bid is contract-backed and verified against market-manipulation checks in real time.'
    },
    {
        icon: <Zap className="w-5 h-5 text-blue-700" />,
        title: 'Zero-Latency Engine',
        body: 'Our high-frequency bidding engine handles 50,000+ operations per second with millisecond precision.'
    },
];

// ── HOW IT WORKS ─────────────────────────────────────────────
const HOW = [
    { step: '01', title: 'Create an Account', body: 'Register and complete identity verification in under 5 minutes.' },
    { step: '02', title: 'Browse or Join Live', body: 'Discover upcoming auctions or jump straight into a live session.' },
    { step: '03', title: 'Bid with Confidence', body: 'Place bids online or sync floor bids in our hybrid system.' },
    { step: '04', title: 'Secure Settlement', body: 'Win, pay securely, and receive your asset with full documentation.' },
];

// ── MAIN COMPONENT ───────────────────────────────────────────
const Landing = () => {
    const [featuredAuctions, setFeaturedAuctions] = useState([]);
    const [heroAuction, setHeroAuction] = useState(null);
    const [heroBids, setHeroBids] = useState([]);

    useEffect(() => {
        const loadAll = async () => {
            try {
                // Featured cards: try live first, fall back to any
                const liveRes = await auctionAPI.getAll({ status: 'live' });
                const liveItems = liveRes.data || [];
                let featured = liveItems;
                if (featured.length < 3) {
                    const allRes = await auctionAPI.getAll();
                    featured = allRes.data || [];
                }
                setFeaturedAuctions(featured.slice(0, 3));

                // Hero auction: best live → upcoming → ended
                let hero = liveItems[0] || null;
                if (!hero) {
                    const upcomingRes = await auctionAPI.getAll({ status: 'upcoming' });
                    hero = (upcomingRes.data || [])[0] || null;
                }
                if (!hero) {
                    const endedRes = await auctionAPI.getAll({ status: 'ended' });
                    hero = (endedRes.data || [])[0] || null;
                }
                if (!hero && featured.length > 0) hero = featured[0];

                if (hero) {
                    setHeroAuction(hero);
                    try {
                        const bidsRes = await bidAPI.getAuctionBids(hero.id, { limit: 3 });
                        setHeroBids(bidsRes.data || []);
                    } catch (_) {
                        setHeroBids([]);
                    }
                }
            } catch (err) {
                console.error('Landing data load error:', err);
            }
        };
        loadAll();
    }, []);

    return (
        <div className="flex flex-col bg-white">

            {/* ══════════════════════════════════════════
                HERO — Split Screen
            ══════════════════════════════════════════ */}
            <section className="relative min-h-[calc(100vh-64px)] grid lg:grid-cols-2 overflow-hidden bg-[#0c0f14]">

                {/* Left — Content */}
                <div className="relative flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-24 z-10">
                    {/* Subtle left glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(125,26,6,0.18),transparent_65%)] pointer-events-none" />

                    <FadeIn delay={0}>
                        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Live Platform — Hybrid Auctions
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.08}>
                        <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white leading-[0.92] tracking-tighter mb-8">
                            The Smartest Way to{' '}
                            <span className="text-primary italic">Buy & Sell</span>{' '}
                            <br className="hidden sm:block" />
                            at Auction.
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.16}>
                        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md font-medium">
                            Bridging physical auction floors and the global digital audience.
                            Real-time synchronization. Institutional-grade security. Zero compromise.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.22} className="flex flex-col sm:flex-row gap-4 mb-16">
                        <Link
                            to="/auctions"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-primary/30"
                        >
                            Browse Live Auctions
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200"
                        >
                            Create Free Account
                        </Link>
                    </FadeIn>

                    {/* Social proof row */}
                    <FadeIn delay={0.30}>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {['A', 'B', 'C', 'D'].map((l, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0c0f14] bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                                        {l}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-slate-400">
                                <span className="text-white font-semibold">48,000+</span> active bidders worldwide
                            </div>
                        </div>
                    </FadeIn>
                </div>

                {/* Right — visual */}
                <div className="relative hidden lg:flex flex-col justify-center items-center px-12 overflow-hidden">
                    {/* Full-cover background image with overlay */}
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop"
                            alt="Auction"
                            className="w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f14] via-[#0c0f14]/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-transparent to-[#0c0f14]/60" />
                    </div>

                    {/* Floating bid card — real data */}
                    {heroAuction && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10 w-full max-w-[380px]"
                        >
                            <div className="bg-[#161a22]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                {/* Image */}
                                <div className="relative">
                                    {heroAuction.image ? (
                                        <img
                                            src={heroAuction.image}
                                            alt={heroAuction.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-slate-800 flex items-center justify-center">
                                            <Gavel className="w-10 h-10 text-slate-600" />
                                        </div>
                                    )}
                                    {/* Status badge */}
                                    {heroAuction.status === 'live' && (
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                            Live Now
                                        </div>
                                    )}
                                    {heroAuction.status === 'upcoming' && (
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-sky-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                                            <Clock className="w-3 h-3" />
                                            Upcoming
                                        </div>
                                    )}
                                    {heroAuction.status === 'ended' && (
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                                            Ended
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#161a22] to-transparent" />
                                </div>

                                <div className="p-5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 truncate">
                                        {heroAuction.category || 'Featured Lot'}
                                    </p>
                                    <h3 className="text-white font-bold text-base mb-4 line-clamp-1">{heroAuction.title}</h3>

                                    <div className="flex items-end justify-between mb-5">
                                        <div>
                                            <p className="text-[11px] text-slate-500 font-medium mb-0.5">
                                                {heroAuction.status === 'ended' ? 'Final Bid' : heroAuction.status === 'live' ? 'Current Bid' : 'Starting Price'}
                                            </p>
                                            <p className="text-3xl font-black text-white">
                                                ${(heroAuction.current_price || heroAuction.starting_price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        {heroAuction.status === 'live' && (
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                                <span className="text-xs font-bold text-green-400">
                                                    {heroBids.length} bid{heroBids.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent bids or placeholder */}
                                    <div className="space-y-2 mb-5">
                                        {heroBids.length > 0 ? (
                                            heroBids.map((bid, i) => (
                                                <div key={bid.id || i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${i === 0 ? 'bg-primary/15 border border-primary/20' : 'bg-white/5'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white">
                                                            {(bid.bidder_name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <span className={`text-xs font-semibold ${i === 0 ? 'text-primary' : 'text-slate-400'}`}>
                                                            {bid.bidder_name || 'Bidder'}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-bold ${i === 0 ? 'text-white' : 'text-slate-500'}`}>
                                                        ${(bid.amount || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-3 text-slate-600 text-xs">
                                                {heroAuction.status === 'upcoming' ? 'Bidding opens soon' : 'No bids yet — be the first!'}
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        to={`/auctions/${heroAuction.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
                                    >
                                        {heroAuction.status === 'live' ? 'Place a Bid' : heroAuction.status === 'upcoming' ? 'View Details' : 'See Results'}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Skeleton placeholder while loading */}
                    {!heroAuction && (
                        <div className="w-full max-w-[380px] bg-[#161a22]/60 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                            <div className="w-full h-48 bg-slate-800" />
                            <div className="p-5 space-y-3">
                                <div className="h-3 bg-slate-800 rounded w-1/3" />
                                <div className="h-5 bg-slate-800 rounded w-2/3" />
                                <div className="h-10 bg-slate-800 rounded" />
                                <div className="h-8 bg-slate-800 rounded" />
                                <div className="h-8 bg-slate-800 rounded" />
                                <div className="h-10 bg-primary/20 rounded-xl" />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════════
                STAT BAR
            ══════════════════════════════════════════ */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
                        {STATS.map((s, i) => (
                            <FadeInView key={i} delay={i * 0.06} className="py-8 px-8 text-center">
                                <p className="text-3xl font-black text-slate-900 tracking-tight mb-1">{s.value}</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{s.label}</p>
                            </FadeInView>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                FEATURED AUCTIONS
            ══════════════════════════════════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                        <FadeInView>
                            <div>
                                <p className="text-[11px] font-bold text-primary uppercase tracking-[0.25em] mb-2">Live & Upcoming</p>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Featured Lots</h2>
                            </div>
                        </FadeInView>
                        <FadeInView delay={0.1}>
                            <Link
                                to="/auctions"
                                className="group inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors"
                            >
                                View All Auctions
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </FadeInView>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredAuctions.length > 0 ? (
                            featuredAuctions.map((auction, i) => (
                                <FadeInView key={auction.id} delay={i * 0.08}>
                                    <AuctionCard auction={auction} />
                                </FadeInView>
                            ))
                        ) : (
                            <div className="col-span-3 py-20 text-center text-slate-400 text-sm">
                                No live auctions at the moment. Check back soon.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════ */}
            <section className="py-28 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <FadeInView>
                            <p className="text-[11px] font-bold text-primary uppercase tracking-[0.25em] mb-3">Simple Process</p>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">How It Works</h2>
                        </FadeInView>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {HOW.map((h, i) => (
                            <FadeInView key={i} delay={i * 0.08}>
                                <div className="relative">
                                    {i < HOW.length - 1 && (
                                        <div className="hidden lg:block absolute top-6 left-[calc(100%_-_1rem)] w-8 border-t-2 border-dashed border-slate-200 z-10" />
                                    )}
                                    <div className="mb-5">
                                        <span className="text-5xl font-black text-slate-100 leading-none">{h.step}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base mb-2">{h.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{h.body}</p>
                                </div>
                            </FadeInView>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                TRUST SECTION
            ══════════════════════════════════════════ */}
            <section className="py-28 bg-slate-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(125,26,6,0.15),transparent_60%)] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <FadeInView>
                            <div>
                                <p className="text-[11px] font-bold text-primary uppercase tracking-[0.25em] mb-4">Built for Institutions</p>
                                <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-6">
                                    The Infrastructure<br />of <span className="text-primary">Trust.</span>
                                </h2>
                                <p className="text-slate-400 leading-relaxed mb-10 text-base max-w-md">
                                    SecureBid is built to the same standards as the world's leading financial exchanges — because your assets deserve nothing less.
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
                                >
                                    Start Bidding <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </FadeInView>

                        <div className="space-y-5">
                            {TRUST.map((t, i) => (
                                <FadeInView key={i} delay={i * 0.1}>
                                    <div className="flex gap-5 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.08] transition-colors">
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                            {t.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1.5 text-sm uppercase tracking-wide">{t.title}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed">{t.body}</p>
                                        </div>
                                    </div>
                                </FadeInView>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                CTA BANNER
            ══════════════════════════════════════════ */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <FadeInView>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-5">
                            Ready to Bid?
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
                            Join thousands of bidders on SecureBid. Register free and be notified when your target lot goes live.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Create Free Account <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/auctions"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm uppercase tracking-wide transition-all"
                            >
                                Browse Auctions
                            </Link>
                        </div>
                    </FadeInView>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════ */}
            <footer className="bg-[#0c0f14] border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded">
                            <Gavel className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-black tracking-tighter text-lg">
                            SECURE<span className="text-primary italic">BID</span>
                        </span>
                    </div>
                    <p className="text-slate-600 text-xs">© 2026 SecureBid. Institutional-grade auction platform.</p>
                    <div className="flex items-center gap-6 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                        <Link to="/auctions" className="hover:text-white transition-colors">Browse</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Register</Link>
                        <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

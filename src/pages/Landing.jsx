import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Globe2, ArrowRight, Gavel, Users, Building2 } from 'lucide-react';
import { auctionAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import { motion } from 'framer-motion';

const Landing = () => {
    const [featuredAuctions, setFeaturedAuctions] = useState([]);

    useEffect(() => {
        auctionAPI.getAll({ status: 'live' })
            .then(res => {
                const items = res.data || [];
                // If no live auctions, fall back to any auctions
                if (items.length < 3) return auctionAPI.getAll();
                return { data: items };
            })
            .then(res => setFeaturedAuctions((res.data || []).slice(0, 3)))
            .catch(() => setFeaturedAuctions([]));
    }, []);



    return (
        <div className="flex flex-col bg-white">
            {/* Hero Section 2.0 - Compressed for single-screen fit */}
            <section className="relative min-h-[calc(100vh-80px)] flex items-center pt-12 pb-16 lg:pt-0 lg:pb-0 overflow-hidden bg-slate-900">
                {/* Visual Ornaments */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -mr-80 -mt-80"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -ml-40 -mb-40"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-7"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary-light text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
                                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                Institutional Grade Asset Exchange
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-6 tracking-tighter">
                                LIVE FLOW <span className="text-primary">HYBRID.</span> <br />
                                BID FROM <span className="italic font-serif font-light text-slate-400 text-4xl md:text-6xl">THE FLOOR.</span>
                            </h1>

                            <p className="text-lg text-slate-400 mb-8 leading-snug max-w-lg font-medium">
                                Bridging the gap between physical trackside auctions and the global digital audience. Experience real-time synchronization.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/auctions" className="btn-primary !py-4 !px-8 text-base font-black flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-primary/20">
                                    Join Live Session <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/register" className="px-8 py-4 rounded-xl font-black text-white border-2 border-slate-700 hover:bg-slate-800 transition-all text-sm text-center">
                                    Register to Bid
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center gap-6 border-t border-slate-800 pt-8">
                                <div>
                                    <p className="text-2xl font-black text-white">$2.4B+</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Trade Volume</p>
                                </div>
                                <div className="w-px h-8 bg-slate-800"></div>
                                <div>
                                    <p className="text-2xl font-black text-white">48K+</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Active Bidders</p>
                                </div>
                                <div className="w-px h-8 bg-slate-800"></div>
                                <div>
                                    <p className="text-2xl font-black text-white">99.9%</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Uptime Rate</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:block lg:col-span-5 relative"
                        >
                            <div className="relative z-10 card !bg-slate-800/50 !border-slate-700 backdrop-blur-xl p-6 transform rotate-2 shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop"
                                    alt="Live Auction"
                                    className="rounded-lg mb-4 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer shadow-lg w-full h-[250px] object-cover"
                                />
                                <div className="flex justify-between items-center bg-slate-900 rounded-xl p-4 border border-slate-700">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Highest Bid</p>
                                        <p className="text-3xl font-black text-white">$452,000</p>
                                    </div>
                                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black animate-pulse">
                                        LIVE
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-primary/30 rounded-[2rem] -rotate-6 z-0"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-24 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Prime Inventory</h2>
                            <p className="text-slate-500 font-medium">Active biddings closing soon. Act with conviction.</p>
                        </div>
                        <Link to="/auctions" className="group flex items-center gap-3 py-3 px-8 bg-white border border-slate-200 rounded-xl font-black text-sm hover:border-primary transition-all shadow-sm">
                            ENTER THE GALLERY <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {featuredAuctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section 2.0 */}
            <section className="py-32 bg-white overflow-hidden relative border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-10"
                            >
                                <h2 className="text-5xl font-black text-accent-black leading-[1.1] tracking-tighter">
                                    The Infrastructure Of <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-[12px]">Trust.</span>
                                </h2>

                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <div className="bg-primary-light p-4 rounded-2xl h-fit">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-accent-black text-lg mb-2 uppercase tracking-tight">SEC-Compliant Custody</h4>
                                            <p className="text-secondary font-medium leading-relaxed">
                                                All digital and physical assets are held in institutional-grade sub-zero storage facilities until the auction settle.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="bg-orange-50 p-4 rounded-2xl h-fit">
                                            <Gavel className="w-6 h-6 text-orange-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-accent-black text-lg mb-2 uppercase tracking-tight">Legal Transparency</h4>
                                            <p className="text-secondary font-medium leading-relaxed">
                                                Every bid is legally binding and backed by smart contract verification to ensure zero market manipulation.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="bg-blue-50 p-4 rounded-2xl h-fit">
                                            <Zap className="w-6 h-6 text-blue-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-accent-black text-lg mb-2 uppercase tracking-tight">Zero-Latency Execution</h4>
                                            <p className="text-secondary font-medium leading-relaxed">
                                                Our high-frequency bidding engine handles 50,000+ operations per second with millisecond precision.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px]"></div>
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-6 mt-12">
                                    <div className="card p-8 bg-slate-900 text-white !border-slate-800">
                                        <p className="text-3xl font-black mb-1 italic font-serif">A+</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Financial Rating</p>
                                    </div>
                                    <div className="card p-8">
                                        <Users className="w-8 h-8 text-primary mb-4" />
                                        <p className="text-sm font-black text-slate-900 leading-tight">Elite Membership Validation</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="card p-8">
                                        <Globe2 className="w-8 h-8 text-slate-900 mb-4" />
                                        <p className="text-sm font-black text-slate-900 leading-tight">Global Escrow Network</p>
                                    </div>
                                    <div className="card p-8 bg-primary text-white border-0 shadow-xl shadow-primary/30">
                                        <ShieldCheck className="w-10 h-10 mb-4" />
                                        <p className="text-sm font-black leading-tight">End-to-End Asset Protection</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;

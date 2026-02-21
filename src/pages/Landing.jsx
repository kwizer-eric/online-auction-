import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Globe2, ArrowRight } from 'lucide-react';
import { mockAuctions } from '../mock/auctions';
import AuctionCard from '../components/AuctionCard';
import { motion } from 'framer-motion';

const Landing = () => {
    const featuredAuctions = mockAuctions.slice(0, 3);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-white py-20 lg:py-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Institutional Grade Security
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8"
                        >
                            The Premier Destination For <span className="text-primary italic">High-Value</span> Assets
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-500 mb-10 leading-relaxed"
                        >
                            Experience the future of digital auctions. Secure, transparent, and built for professionals. Join elite collectors and investors in our live bidding rooms.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link to="/auctions" className="btn-primary flex items-center justify-center gap-2">
                                Start Bidding <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/how-it-works" className="px-8 py-2.5 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-all border border-slate-200">
                                Learn More
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Featured Auctions</h2>
                            <p className="text-slate-500">Discover hand-picked treasures selected for our elite community.</p>
                        </div>
                        <Link to="/auctions" className="text-primary font-bold hover:underline flex items-center gap-1 group">
                            View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredAuctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-20 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 bg-primary-light p-3 rounded-2xl h-fit">
                                <Globe2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Global Reach</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Connect with bidders and sellers from over 150 countries worldwide.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 bg-orange-100 p-3 rounded-2xl h-fit">
                                <ShieldCheck className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Escrow Protection</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Your funds are held in secure escrow until you receive and verify your item.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-2xl h-fit">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Real-time Updates</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Experience zero-latency bidding with our proprietary Socket engine.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;

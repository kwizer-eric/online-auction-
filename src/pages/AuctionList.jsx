import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { auctionAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import { motion } from 'framer-motion';

const AuctionList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAuctions();
        const interval = setInterval(loadAuctions, 15000);
        return () => clearInterval(interval);
    }, []);

    const loadAuctions = async () => {
        try {
            const res = await auctionAPI.getAll();
            setAuctions(res.data || []);
        } catch (err) {
            setError('Failed to load auctions. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Watches', 'Art', 'Automobiles', 'Electronics', 'Jewelry'];

    const filteredAuctions = auctions.filter(auction => {
        const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || auction.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Scheduled Live Auctions</h1>
                    <p className="text-slate-500">View upcoming live auction events. Attend on-field or online - all bids are shared in real-time.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search auctions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full sm:min-w-[300px]"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {error ? (
                <div className="text-center py-20 bg-rose-50 rounded-2xl border border-rose-200">
                    <p className="text-rose-700 font-bold text-lg mb-2">⚠ Unable to connect to backend</p>
                    <p className="text-rose-500 text-sm">{error}</p>
                </div>
            ) : loading ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading auctions...</p>
                </div>
            ) : filteredAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredAuctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No auctions found</h3>
                    <p className="text-slate-500">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default AuctionList;

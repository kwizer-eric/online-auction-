import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, TrendingUp } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { motion } from 'framer-motion';

const AuctionCard = ({ auction }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="card overflow-hidden group h-full flex flex-col"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                    <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-xl">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Session</span>
                    </div>
                </div>
                <div className="absolute top-3 left-3">
                    <span className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">
                        {auction.category}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                    {auction.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                    {auction.description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                                Current Bid
                            </p>
                            <p className="text-xl font-black text-slate-900">
                                ${auction.currentPrice.toLocaleString()}
                            </p>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary mb-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{auction.bids} Bids</span>
                            </div>
                            <button
                                onClick={() => navigate(`/auction/${auction.id}`)}
                                className="btn-primary !py-1.5 !px-4 text-sm flex items-center gap-2"
                            >
                                <Gavel className="w-4 h-4" />
                                <span>Bid Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AuctionCard;

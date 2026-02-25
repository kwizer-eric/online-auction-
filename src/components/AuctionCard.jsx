import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, TrendingUp, MapPin } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { motion } from 'framer-motion';

const AuctionCard = ({ auction }) => {
    const navigate = useNavigate();
    const status = auction.status || 'scheduled';
    // Support both snake_case (API) and camelCase (legacy mock)
    const price = auction.current_price ?? auction.currentPrice ?? auction.starting_price ?? 0;
    const auctionDate = auction.auction_date || auction.auctionDate;
    const bidCount = auction.bid_count ?? auction.bids ?? 0;
    const imageUrl = auction.image_url || auction.image || `https://picsum.photos/seed/${auction.id}/640/480`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="card overflow-hidden group h-full flex flex-col"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={auction.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                    <CountdownTimer auctionDate={auctionDate} status={status} />
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
                <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                    {auction.description}
                </p>

                {auction.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-medium">{auction.location}</span>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-end">
                        <div>
                            {status === 'live' ? (
                                <>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                                        Current Bid
                                    </p>
                                    <p className="text-xl font-black text-slate-900">
                                        ${price.toLocaleString()}
                                    </p>
                                </>
                            ) : status === 'completed' ? (
                                <>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                                        Final Price
                                    </p>
                                    <p className="text-xl font-black text-slate-900">
                                        ${price.toLocaleString()}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                                        Starting Price
                                    </p>
                                    <p className="text-xl font-black text-slate-900">
                                        ${price.toLocaleString()}
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col items-end">
                            {status === 'live' && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-primary mb-1">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{bidCount} Bids</span>
                                </div>
                            )}
                            <button
                                onClick={() => navigate(`/auction/${auction.id}`)}
                                className="btn-primary !py-1.5 !px-4 text-sm flex items-center gap-2"
                                disabled={status === 'completed'}
                            >
                                <Gavel className="w-4 h-4" />
                                <span>{status === 'live' ? 'Join Live' : status === 'completed' ? 'View Details' : 'View Auction'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AuctionCard;

import React, { useState } from 'react';
import { DollarSign, CheckCircle2, AlertCircle, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BidPanel = ({ currentPrice, onPlaceBid }) => {
    const [bidAmount, setBidAmount] = useState(currentPrice + 100);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const minBid = currentPrice + 1;

    const handlePlaceBid = () => {
        if (bidAmount < minBid) return;
        setShowConfirm(true);
    };

    const confirmBid = () => {
        onPlaceBid(bidAmount);
        setShowConfirm(false);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
    };

    return (
        <div className="card p-6 bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <label className="block text-slate-400 text-sm font-bold mb-4 uppercase tracking-widest">
                    Quick Bid Interface
                </label>

                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl text-3xl font-black focus:border-primary transition-all outline-none"
                        min={minBid}
                    />
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {[100, 500, 1000].map((inc) => (
                        <button
                            key={inc}
                            onClick={() => setBidAmount(currentPrice + inc)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors border border-slate-700"
                        >
                            +${inc}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handlePlaceBid}
                    className="w-full btn-primary !py-4 text-lg font-black flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <Gavel className="w-6 h-6" />
                    Place Bid Now
                </button>

                <p className="mt-4 text-center text-xs text-slate-500 font-medium">
                    Minimum bid: <span className="text-slate-300 font-bold">${minBid.toLocaleString()}</span>
                </p>
            </div>

            {/* Confirmation Modal Overlay */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center"
                    >
                        <AlertCircle className="w-12 h-12 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Confirm Your Bid</h3>
                        <p className="text-slate-400 mb-6 px-4">
                            You are about to place a bid of <span className="text-white font-bold">${bidAmount.toLocaleString()}</span>. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBid}
                                className="flex-1 py-3 bg-primary hover:bg-primary-hover rounded-lg font-bold transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                )}

                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary z-30 flex flex-col items-center justify-center p-6 text-center"
                    >
                        <CheckCircle2 className="w-16 h-16 text-white mb-4" />
                        <h3 className="text-2xl font-black text-white mb-1">Bid Placed!</h3>
                        <p className="text-white/80 font-medium">You are currently the highest bidder.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BidPanel;

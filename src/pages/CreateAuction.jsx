import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PlusCircle,
    Image as ImageIcon,
    Calendar,
    DollarSign,
    Tag,
    Info,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateAuction = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => navigate('/admin'), 2000);
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Host New Asset Auction</h1>
                <p className="text-slate-500">Provide high-fidelity details to attract premium bidders.</p>
            </div>

            <div className="card bg-white p-8 relative overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            General Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Auction Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="e.g. 1965 Vintage Porsche Prototype"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select className="input-field pl-10 appearance-none bg-white">
                                        <option>Select Asset Class</option>
                                        <option>Automobiles</option>
                                        <option>Real Estate</option>
                                        <option>Luxury Watches</option>
                                        <option>Fine Art</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Starting Price (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                    <input type="number" required className="input-field pl-10" placeholder="50,000" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Asset Description</label>
                            <textarea
                                rows="4"
                                required
                                className="input-field"
                                placeholder="Describe the asset's history, condition, and unique value propositions..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Media & Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                Media Assets
                            </h3>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                                <PlusCircle className="w-10 h-10 text-slate-300 mb-4" />
                                <p className="text-sm font-bold text-slate-900 mb-1">Upload High-Res Images</p>
                                <p className="text-xs text-slate-500">PNG, JPG up to 10MB each</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Auction Schedule
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date & Time</label>
                                    <input type="datetime-local" className="input-field" />
                                </div>
                                <div className="p-3 bg-primary-light rounded-lg border border-primary/10">
                                    <p className="text-xs text-primary font-medium leading-relaxed">
                                        <strong>Note:</strong> Auctions must run for a minimum of 24 hours to ensure global participation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="px-8 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Discard Draft
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary !px-12 !py-3 text-lg flex items-center gap-2 min-w-[200px] justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Publish Auction
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <AnimatePresence>
                    {isSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center z-20"
                        >
                            <div className="bg-primary text-white p-4 rounded-full mb-6">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Auction Published!</h2>
                            <p className="text-slate-500">Redirecting to management dashboard...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CreateAuction;

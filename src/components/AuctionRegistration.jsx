import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, X, Users, MapPin, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../contexts/AuthContext';

const AuctionRegistration = ({ auction }) => {
    const { user, isAuthenticated } = useAuth();
    const [isRegistered, setIsRegistered] = useState(false);
    const [registration, setRegistration] = useState(null);
    const [registrationType, setRegistrationType] = useState('online');
    const [isRegistering, setIsRegistering] = useState(false);
    const [counts, setCounts] = useState({ total: 0, online: 0, onfield: 0 });

    useEffect(() => {
        if (user && auction) {
            checkRegistration();
            loadCounts();
        }
    }, [user, auction]);

    const checkRegistration = () => {
        if (!user || !auction) return;
        const reg = registrationService.getRegistration(auction.id, user.id);
        setIsRegistered(!!reg);
        setRegistration(reg);
    };

    const loadCounts = () => {
        if (!auction) return;
        const registrationCounts = registrationService.getRegistrationCounts(auction.id);
        setCounts(registrationCounts);
    };

    const handleRegister = async () => {
        if (!user || !auction) return;

        setIsRegistering(true);
        const result = await registrationService.register(
            auction.id,
            user.id,
            registrationType,
            {
                userName: user.name,
                userEmail: user.email
            }
        );

        if (result.success) {
            setIsRegistered(true);
            setRegistration(result.registration);
            loadCounts();
        }
        setIsRegistering(false);
    };

    const handleUnregister = () => {
        if (!user || !auction) return;

        const result = registrationService.unregister(auction.id, user.id);
        if (result.success) {
            setIsRegistered(false);
            setRegistration(null);
            loadCounts();
        }
    };

    if (!auction || auction.status === 'completed') return null;

    if (!isAuthenticated()) {
        return (
            <div className="card p-6 bg-gradient-to-br from-primary-light to-blue-50 border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary p-2 rounded-lg">
                        <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900">Register to Participate</h3>
                        <p className="text-xs text-slate-600">Login required to register for this auction</p>
                    </div>
                </div>
                <a
                    href="/login"
                    className="btn-primary w-full !py-3 flex items-center justify-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Login to Register
                </a>
            </div>
        );
    }

    if (isRegistered) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 bg-green-50 border border-green-200"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900">Registered</h3>
                            <p className="text-xs text-slate-600">
                                You're registered as <span className="font-bold uppercase">{registration?.type || 'online'}</span> participant
                            </p>
                        </div>
                    </div>
                    {registration?.type === 'online' && (
                        <div className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                            Online
                        </div>
                    )}
                    {registration?.type === 'onfield' && (
                        <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                            On-Field
                        </div>
                    )}
                </div>

                {auction.status === 'scheduled' && (
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">Location: {auction.location || 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Radio className="w-4 h-4" />
                            <span className="font-medium">Auction Date: {new Date(auction.auctionDate).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {auction.status === 'live' && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                        <p className="text-sm font-bold text-primary">
                            Auction is LIVE! You can now place bids.
                        </p>
                    </div>
                )}

                {auction.status === 'scheduled' && (
                    <button
                        onClick={handleUnregister}
                        className="w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Unregister
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 bg-slate-900 text-white"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                    <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-black text-white">Register for Live Auction</h3>
                    <p className="text-xs text-slate-400">Choose how you'll participate</p>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <button
                    onClick={() => setRegistrationType('online')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                        registrationType === 'online'
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Radio className="w-5 h-5 text-primary" />
                            <div className="text-left">
                                <p className="font-black text-sm">Online Participation</p>
                                <p className="text-xs text-slate-400">Bid remotely from anywhere</p>
                            </div>
                        </div>
                        {registrationType === 'online' && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                    </div>
                </button>

                <button
                    onClick={() => setRegistrationType('onfield')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                        registrationType === 'onfield'
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div className="text-left">
                                <p className="font-black text-sm">On-Field Participation</p>
                                <p className="text-xs text-slate-400">Attend at physical location</p>
                            </div>
                        </div>
                        {registrationType === 'onfield' && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                    </div>
                </button>
            </div>

            <div className="bg-slate-800 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Total Registered:</span>
                </div>
                <span className="font-black text-white">{counts.total}</span>
            </div>

            <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full btn-primary !py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isRegistering ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Registering...</span>
                    </>
                ) : (
                    <>
                        <UserPlus className="w-4 h-4" />
                        Register Now
                    </>
                )}
            </button>
        </motion.div>
    );
};

export default AuctionRegistration;

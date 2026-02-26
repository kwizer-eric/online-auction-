import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronLeft,
    UserCheck,
    UserX,
    Hash,
    Search,
    Filter,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import { registrationAPI, auctionAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const BiddersManagement = () => {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [editingBidderNumber, setEditingBidderNumber] = useState(null);
    const [tempBidderNumber, setTempBidderNumber] = useState('');

    useEffect(() => {
        loadData();
    }, [auctionId]);

    const loadData = async () => {
        try {
            const [regRes, aucRes] = await Promise.all([
                registrationAPI.getAuctionRegistrations(auctionId),
                auctionAPI.getById(auctionId)
            ]);
            setRegistrations(regRes.data || []);
            setAuction(aucRes.data);
        } catch (err) {
            console.error('Failed to load bidder data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (regId) => {
        try {
            await registrationAPI.approve(regId);
            setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'approved' } : r));
        } catch (err) {
            console.error('Failed to approve registration:', err);
        }
    };

    const handleReject = async (regId) => {
        try {
            await registrationAPI.reject(regId);
            setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'rejected' } : r));
        } catch (err) {
            console.error('Failed to reject registration:', err);
        }
    };

    const handleAssignNumber = async (regId) => {
        try {
            await registrationAPI.assignBidderNumber(regId, tempBidderNumber);
            setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, bidder_number: tempBidderNumber } : r));
            setEditingBidderNumber(null);
            setTempBidderNumber('');
        } catch (err) {
            console.error('Failed to assign bidder number:', err);
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = (reg.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reg.bidder_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 leading-none mb-2 tracking-tight">Bidder Management</h1>
                        <p className="text-slate-500 font-medium">Managing participants for: <span className="text-primary font-bold">{auction?.title}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black uppercase text-slate-600 tracking-tighter">Event Lock: Stable</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card p-6 bg-slate-900 border-0 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserCheck className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Registered</p>
                    <h2 className="text-4xl font-black text-white">{registrations.length}</h2>
                </div>
                <div className="card p-6 border-l-4 border-l-primary">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved Participants</p>
                    <h2 className="text-4xl font-black text-slate-900">{registrations.filter(r => r.status === 'approved').length}</h2>
                </div>
                <div className="card p-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Review</p>
                    <h2 className="text-4xl font-black text-slate-900">{registrations.filter(r => r.status === 'registered').length}</h2>
                </div>
            </div>

            {/* Filters and List */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or bidder #..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['all', 'registered', 'approved', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterStatus === status
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {status === 'registered' ? 'Pending' : status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participant</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bidder #</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredRegistrations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                        No participants matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                                    <span className="font-black text-slate-400">{(reg.user_name || 'U')[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{reg.user_name || 'Legacy User'}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Reg Date: {new Date(reg.registered_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${reg.type === 'onfield' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'
                                                }`}>
                                                {reg.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {reg.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                {reg.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-500" />}
                                                {reg.status === 'registered' && <Clock className="w-4 h-4 text-amber-500" />}
                                                <span className={`text-xs font-bold ${reg.status === 'approved' ? 'text-green-700' :
                                                        reg.status === 'rejected' ? 'text-rose-700' : 'text-amber-700'
                                                    } capitalize`}>
                                                    {reg.status === 'registered' ? 'Pending' : reg.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingBidderNumber === reg.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={tempBidderNumber}
                                                        onChange={(e) => setTempBidderNumber(e.target.value)}
                                                        className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black outline-none focus:border-primary"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleAssignNumber(reg.id)}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingBidderNumber(null)}
                                                        className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex items-center gap-2 group/btn cursor-pointer"
                                                    onClick={() => {
                                                        setEditingBidderNumber(reg.id);
                                                        setTempBidderNumber(reg.bidder_number || '');
                                                    }}
                                                >
                                                    <span className="font-black text-slate-900 text-sm">{reg.bidder_number || '---'}</span>
                                                    <Hash className="w-3 h-3 text-slate-300 group-hover/btn:text-primary transition-colors" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {reg.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleApprove(reg.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 border border-transparent hover:border-green-100 rounded-xl transition-all"
                                                        title="Approve Bidder"
                                                    >
                                                        <UserCheck className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {reg.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => handleReject(reg.id)}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                                        title="Reject Bidder"
                                                    >
                                                        <UserX className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                        Secure Authentication Protocol V4.2 • Admin Authorization Level: Executive
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BiddersManagement;

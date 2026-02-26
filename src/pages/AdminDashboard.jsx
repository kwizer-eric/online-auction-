import { useNavigate } from 'react-router-dom';
import {
    Users,
    Gavel,
    TrendingUp,
    DollarSign,
    Eye,
    Radio,
    Play,
    Square,
    AlertTriangle,
    UserCheck
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LiveAuctionControl from '../components/LiveAuctionControl';
import { auctionAPI } from '../services/api';
import { registrationAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [liveAuction, setLiveAuction] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAuctions();
    }, []);

    const loadAuctions = async () => {
        try {
            setError(null);
            const res = await auctionAPI.getAll();
            setAuctions(res.data || []);
        } catch (err) {
            console.error('Failed to load auctions:', err);
            setError('Could not connect to the auction service. Please check your backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartAuction = async (auctionId) => {
        try {
            const res = await auctionAPI.start(auctionId);
            const updated = res.data;
            await loadAuctions();
            if (updated?.status === 'live') {
                setLiveAuction(updated);
            }
        } catch (err) {
            console.error('Failed to start auction:', err);
        }
    };

    const handleEndAuction = async (auctionId) => {
        try {
            await auctionAPI.end(auctionId);
            await loadAuctions();
            if (liveAuction?.id === auctionId) {
                setLiveAuction(null);
            }
        } catch (err) {
            console.error('Failed to end auction:', err);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
            live: 'bg-primary-light text-primary border-primary/20 animate-pulse',
            completed: 'bg-slate-100 text-slate-600 border-slate-200'
        };
        const labels = {
            scheduled: 'Scheduled',
            live: 'LIVE',
            completed: 'Completed'
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${badges[status] || badges.scheduled}`}>
                {labels[status] || 'Scheduled'}
            </span>
        );
    };

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {liveAuction && (
                    <div className="fixed bottom-8 right-8 z-[60] w-full max-w-md">
                        <LiveAuctionControl
                            auction={liveAuction}
                            onClose={() => setLiveAuction(null)}
                            onAuctionEnd={() => loadAuctions()}
                        />
                    </div>
                )}
            </AnimatePresence>

            <div>
                <h1 className="text-3xl font-black text-accent-black mb-2">Executive Overview</h1>
                <p className="text-secondary font-medium">Real-time performance metrics and hybrid asset management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Auctions"
                    value={auctions.length.toString()}
                    icon={Gavel}
                    trend="up"
                    trendValue=""
                />
                <StatsCard
                    title="Live Now"
                    value={auctions.filter(a => a.status === 'live').length.toString()}
                    icon={Radio}
                    trend="up"
                    trendValue=""
                />
                <StatsCard
                    title="Scheduled"
                    value={auctions.filter(a => a.status === 'scheduled').length.toString()}
                    icon={TrendingUp}
                    trend="up"
                    trendValue=""
                />
                <StatsCard
                    title="Completed"
                    value={auctions.filter(a => a.status === 'completed').length.toString()}
                    icon={DollarSign}
                    trend="up"
                    trendValue=""
                />
            </div>

            <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-accent-black">Asset Inventory & Live Control</h3>
                    <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Export Portfolio</button>
                </div>
                <div className="overflow-x-auto">
                    {error && (
                        <div className="p-4 m-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" />
                            <p className="text-xs font-bold">{error}</p>
                        </div>
                    )}
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Asset Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Current Price</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Participants</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Bids</th>
                                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest leading-none text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        Loading auctions...
                                    </td>
                                </tr>
                            ) : auctions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        No auctions found
                                    </td>
                                </tr>
                            ) : (
                                auctions.map((auction) => (
                                    <tr key={auction.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={auction.image_url || auction.image || `https://picsum.photos/seed/${auction.id}/40/40`}
                                                    className="w-10 h-10 rounded-lg object-cover shadow-sm grayscale group-hover:grayscale-0 transition-all"
                                                    alt=""
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-accent-black line-clamp-1">{auction.title}</p>
                                                    <p className="text-[10px] text-secondary uppercase font-black tracking-tighter">{auction.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-accent-black">
                                            ${(auction.current_price || auction.starting_price || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(auction.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-bold text-accent-black">
                                                    {auction.registration_count || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-accent-black">{auction.bid_count || 0}</span>
                                                {auction.status === 'live' && (
                                                    <span className="text-[10px] text-primary font-medium">Active</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {auction.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleStartAuction(auction.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-green-600 text-white hover:bg-green-700"
                                                        title="Start Live Auction"
                                                    >
                                                        <Play className="w-3 h-3" />
                                                        Start
                                                    </button>
                                                )}
                                                {auction.status === 'live' && (
                                                    <>
                                                        <button
                                                            onClick={() => setLiveAuction(auction)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${liveAuction?.id === auction.id
                                                                ? 'bg-primary text-white'
                                                                : 'bg-accent-black text-white hover:bg-primary'
                                                                }`}
                                                        >
                                                            <Radio className={`w-3 h-3 ${liveAuction?.id === auction.id ? 'animate-pulse' : ''}`} />
                                                            Control
                                                        </button>
                                                        <button
                                                            onClick={() => handleEndAuction(auction.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-rose-600 text-white hover:bg-rose-700"
                                                            title="End Auction"
                                                        >
                                                            <Square className="w-3 h-3" />
                                                            End
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/admin/bidders/${auction.id}`)}
                                                    className="p-2 text-secondary-dark hover:text-primary transition-colors"
                                                    title="Manage Bidders"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/auction/${auction.id}`)}
                                                    className="p-2 text-secondary-dark hover:text-primary transition-colors"
                                                    title="View Auction"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

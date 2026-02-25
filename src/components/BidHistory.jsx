import { User, Clock } from 'lucide-react';

const BidHistory = ({ bids }) => {
    return (
        <div className="card h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Bid History</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                    {bids.length} entries
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {bids.map((bid, index) => (
                    <div
                        key={bid.id}
                        className={`flex items-start justify-between p-3 rounded-xl transition-all ${index === 0 ? 'bg-primary-light border border-primary/20' : 'bg-slate-50'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${index === 0 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">
                                    {bid.bidder_name || bid.bidderName || 'Anonymous'}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                        {new Date(bid.created_at || bid.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <p className={`font-black tracking-tight ${index === 0 ? 'text-primary' : 'text-slate-900'}`}>
                                ${bid.amount.toLocaleString()}
                            </p>
                            <div className="flex gap-1 items-center mt-1">
                                {(bid.bid_type || bid.type) === 'floor' && (
                                    <span className="px-2 py-0.5 bg-accent-black text-white text-[8px] font-black rounded uppercase tracking-[0.15em]">Floor</span>
                                )}
                                {(bid.bid_type || bid.type) === 'online' && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[8px] font-black rounded uppercase tracking-[0.15em]">Online</span>
                                )}
                                {index === 0 && (
                                    <span className="text-[8px] font-black uppercase text-primary tracking-widest">Winning</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BidHistory;

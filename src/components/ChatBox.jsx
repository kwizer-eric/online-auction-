import React, { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

const ChatBox = ({ auctionId: propAuctionId, isAdminView = false }) => {
    const { id: paramAuctionId } = useParams();
    const auctionId = propAuctionId || paramAuctionId;
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(!!auctionId);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    // Load chat history
    useEffect(() => {
        if (!auctionId) return;

        const loadHistory = async () => {
            try {
                const res = await chatAPI.getHistory(auctionId);
                const formattedMessages = res.data.map(msg => ({
                    id: msg.id,
                    user: msg.user_name || (msg.is_admin_message ? 'System' : 'Unknown'),
                    text: msg.message,
                    type: msg.is_admin_message ? (msg.user_id ? 'user' : 'system') : 'user',
                    userId: msg.user_id
                }));
                // Add a welcome message if history is empty
                if (formattedMessages.length === 0) {
                    setMessages([{ id: 'welcome', user: 'System', text: 'Welcome to the live auction chat!', type: 'system' }]);
                } else {
                    setMessages(formattedMessages);
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
                setMessages([{ id: 'error', user: 'System', text: 'Failed to load chat history.', type: 'system' }]);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [auctionId]);

    // Real-time updates
    useEffect(() => {
        if (!auctionId) return;

        const handleNewMessage = (data) => {
            const newMessage = {
                id: data.id,
                user: data.user_name,
                text: data.message,
                type: 'user',
                userId: data.user_id
            };
            setMessages(prev => [...prev.filter(m => m.id !== 'welcome'), newMessage]);
        };

        const handleBidUpdate = (data) => {
            const botMessage = {
                id: `bid-${Date.now()}`,
                user: 'AuctionBot',
                text: `New bid placed: $${data.amount.toLocaleString()}`,
                type: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
        };

        socketService.on('chatMessage', handleNewMessage);
        socketService.on('bid_update', handleBidUpdate);

        return () => {
            socketService.off('chatMessage', handleNewMessage);
            socketService.off('bid_update', handleBidUpdate);
        };
    }, [auctionId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !auctionId) return;

        const messageText = input;
        setInput('');

        try {
            await chatAPI.sendMessage({
                auction_id: auctionId,
                message: messageText
            });
            // The message will come back via WebSocket
        } catch (err) {
            console.error('Failed to send message:', err);
            // Optionally show error in chat
        }
    };

    if (loading && auctionId) {
        return (
            <div className="bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 flex flex-col h-full items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 flex flex-col h-full shadow-[20px_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-32 bg-primary/10 blur-[60px] -translate-y-16" />

            {/* Header: Command Center Style */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping absolute inset-0" />
                        <div className="w-2 h-2 bg-primary rounded-full relative" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-[10px] uppercase tracking-[0.3em] leading-none mb-0.5">
                            {isAdminView ? 'Admin Monitor' : 'Live Terminal'}
                        </h3>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                            {isAdminView ? 'Bidder Communication' : 'Encrypted Connection'}
                        </p>
                    </div>
                </div>
                <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
                    <span className="text-[9px] font-black text-white/60 tracking-tighter">{messages.length} MSGS</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 relative z-10 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'}`}>
                        {msg.type !== 'system' && (
                            <span className="text-[9px] font-black text-white/30 mb-1.5 px-1 uppercase tracking-[0.1em]">
                                {msg.user} {msg.user === 'AuctionBot' && '• VERIFIED'}
                            </span>
                        )}

                        <div className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed transition-all duration-300 ${msg.type === 'system'
                            ? 'bg-white/5 text-white/40 text-[10px] font-bold text-center w-full rounded-lg border border-white/5 py-1.5' :
                            msg.type === 'bot'
                                ? 'bg-primary/10 text-primary-light font-black border-l-2 border-primary px-4 italic tracking-tight shadow-[0_0_20px_rgba(125,26,6,0.1)]' :
                                msg.user === 'You'
                                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20 font-medium' :
                                    'bg-white/5 text-white/90 rounded-tl-none border border-white/10 backdrop-blur-md'
                            }`}>
                            {msg.text}
                        </div>

                        {msg.type === 'bot' && (
                            <div className="mt-1 flex gap-2">
                                <div className="h-[1px] w-8 bg-primary/30 mt-2" />
                                <span className="text-[8px] font-black text-primary uppercase tracking-widest">Event Synced</span>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area: Secure Terminal Style */}
            <div className="p-4 bg-black/40 border-t border-white/5 relative z-10 backdrop-blur-md">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="ENTER MESSAGE..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-[11px] font-black text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all uppercase tracking-widest"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                        disabled={!input.trim()}
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute -bottom-2 left-4 w-12 h-0.5 bg-primary/40 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </form>
            </div>
        </div>
    );
};

export default ChatBox;

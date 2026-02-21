import React, { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';

const ChatBox = () => {
    const [messages, setMessages] = useState([
        { id: 1, user: 'System', text: 'Welcome to the live auction chat!', type: 'system' },
        { id: 2, user: 'AuctionBot', text: 'New bid placed: $8,500', type: 'bot' },
        { id: 3, user: 'Sarah123', text: 'Beautiful piece! Good luck everyone.', type: 'user' },
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = {
            id: Date.now(),
            user: 'You',
            text: input,
            type: 'user'
        };

        setMessages([...messages, newMessage]);
        setInput('');
    };

    return (
        <div className="card h-full flex flex-col bg-slate-50 border-0 overflow-hidden">
            <div className="p-4 bg-white border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Live Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                            {msg.user}
                        </span>
                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.type === 'system' ? 'bg-slate-200 text-slate-600 italic text-center w-full py-1 rounded-lg' :
                                msg.type === 'bot' ? 'bg-primary-light text-primary font-bold border border-primary/20' :
                                    msg.user === 'You' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button type="submit" className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ChatBox;

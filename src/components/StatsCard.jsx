import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue }) => {
    const isPositive = trend === 'up';

    return (
        <div className="card p-6 flex items-center gap-4">
            <div className="bg-primary-light p-3 rounded-xl border border-primary/10">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-2xl font-black text-slate-900">{value}</h4>
                    {trend && (
                        <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? '+' : '-'}{trendValue}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;

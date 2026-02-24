import React, { useState, useEffect } from 'react';
import { Clock, Radio } from 'lucide-react';

const CountdownTimer = ({ auctionDate, status }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(auctionDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { started: true };
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [auctionDate]);

    // If auction is live
    if (status === 'live' || (timeLeft.started && status !== 'completed')) {
        return (
            <div className="flex items-center gap-1.5 text-white font-bold text-sm bg-primary px-3 py-1.5 rounded-lg animate-pulse">
                <Radio className="w-4 h-4" />
                <span>LIVE NOW</span>
            </div>
        );
    }

    // If auction is completed
    if (status === 'completed') {
        return (
            <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm bg-slate-100 px-2 py-1 rounded">
                <Clock className="w-4 h-4" />
                <span>Completed</span>
            </div>
        );
    }

    // If auction is scheduled (countdown to start)
    return (
        <div className="flex items-center gap-1.5 text-primary font-bold text-sm bg-primary-light px-2 py-1 rounded">
            <Clock className="w-4 h-4" />
            <span>
                Starts in: {timeLeft.days > 0 && `${timeLeft.days}d `}
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

export default CountdownTimer;

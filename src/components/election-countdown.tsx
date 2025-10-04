
'use client';

import { useState, useEffect } from 'react';

interface ElectionCountdownProps {
    country: string;
    electionDate: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const calculateTimeLeft = (electionDate: string): TimeLeft | null => {
    const difference = +new Date(electionDate) - +new Date();
    
    if (difference > 0) {
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }
    
    return null;
};

const TimeValue = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
            {value.toString().padStart(2, '0')}
        </span>
        <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
        </span>
    </div>
);

export function ElectionCountdown({ country, electionDate }: ElectionCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        // Set initial value
        setTimeLeft(calculateTimeLeft(electionDate));

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(electionDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [electionDate]);

    if (!timeLeft) {
        return (
            <div className="bg-secondary text-secondary-foreground text-center p-4 rounded-lg">
                <h3 className="text-xl font-bold font-headline">The {country} election has passed.</h3>
                <p>Stay tuned for results and analysis.</p>
            </div>
        );
    }

    return (
        <div className="bg-secondary/50 border rounded-lg p-6 w-full text-center">
            <h3 className="text-lg md:text-xl font-bold font-headline mb-1">
                {country} General Election Countdown
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
                Time until polls open on {new Date(electionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex justify-center gap-4 md:gap-8">
                <TimeValue value={timeLeft.days} label="Days" />
                <TimeValue value={timeLeft.hours} label="Hours" />
                <TimeValue value={timeLeft.minutes} label="Minutes" />
                <TimeValue value={timeLeft.seconds} label="Seconds" />
            </div>
        </div>
    );
}

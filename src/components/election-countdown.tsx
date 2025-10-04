
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ElectionCountdownProps {
    country: string;
    electionDate: string;
    isHeroOverlay?: boolean;
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

const TimeValue = ({ value, label, isHeroOverlay }: { value: number; label: string; isHeroOverlay?: boolean }) => (
    <div className="flex flex-col items-center">
        <span className={cn(
            "font-bold tabular-nums",
            isHeroOverlay ? "text-2xl md:text-3xl text-white" : "text-3xl md:text-5xl text-primary"
        )}>
            {value.toString().padStart(2, '0')}
        </span>
        <span className={cn(
            "text-xs font-medium uppercase tracking-wider",
            isHeroOverlay ? "text-white/80" : "text-muted-foreground"
        )}>
            {label}
        </span>
    </div>
);

export function ElectionCountdown({ country, electionDate, isHeroOverlay = false }: ElectionCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        setTimeLeft(calculateTimeLeft(electionDate));

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(electionDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [electionDate]);

    if (!timeLeft) {
        if (isHeroOverlay) {
            return (
                <div className="text-center text-white">
                    <h3 className="text-lg font-bold font-headline">The {country} election has passed.</h3>
                </div>
            );
        }
        return (
            <div className="bg-secondary text-secondary-foreground text-center p-4 rounded-lg">
                <h3 className="text-xl font-bold font-headline">The {country} election has passed.</h3>
                <p>Stay tuned for results and analysis.</p>
            </div>
        );
    }
    
    if (isHeroOverlay) {
        return (
             <div className="w-full text-center">
                <h3 className="text-base md:text-lg font-bold font-headline mb-2 text-white">
                    {country} General Election Countdown
                </h3>
                <div className="flex justify-center gap-4 md:gap-6">
                    <TimeValue value={timeLeft.days} label="Days" isHeroOverlay />
                    <TimeValue value={timeLeft.hours} label="Hours" isHeroOverlay />
                    <TimeValue value={timeLeft.minutes} label="Minutes" isHeroOverlay />
                    <TimeValue value={timeLeft.seconds} label="Seconds" isHeroOverlay />
                </div>
            </div>
        )
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

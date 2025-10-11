import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface CounterProps {
  endValue: string;
  description: string;
  icon: React.ReactNode;
}

const Counter: React.FC<CounterProps> = ({ endValue, description, icon }) => {
    const [count, setCount] = useState(0);
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

    useEffect(() => {
        if (isIntersecting) {
            let start = 0;
            const end = parseInt(endValue.replace(/[^0-9]/g, ''));
            if (start === end) return;

            const duration = 1500;
            const frameRate = 60;
            const totalFrames = Math.round(duration / (1000 / frameRate));
            const increment = end / totalFrames;

            const timer = () => {
              start += increment;
              if (start >= end) {
                setCount(end);
              } else {
                setCount(Math.ceil(start));
                requestAnimationFrame(timer);
              }
            };
            requestAnimationFrame(timer);
        }
    }, [isIntersecting, endValue]);

    const formatValue = (value: number) => {
        if (endValue.includes('%')) return `${value}%`;
        return `${value.toString()}${endValue.includes('+') ? '+' : ''}`;
    };

    return (
        <div ref={ref} className="glass-card p-4 rounded-2xl text-center transition-transform duration-300 hover:-translate-y-1">
            <div className="text-accent-color w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-lg">
              {icon}
            </div>
            <p className="text-4xl font-bold text-primary-text font-display">{formatValue(count)}</p>
            <p className="text-xs text-secondary-text mt-1 uppercase tracking-wider">{description}</p>
        </div>
    );
};

export default Counter;

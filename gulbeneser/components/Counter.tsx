import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Counter = ({ endValue, description }: { endValue: string, description: string }) => {
    const [count, setCount] = useState(0);
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

    useEffect(() => {
        if (isIntersecting) {
            let start = 0;
            const end = parseInt(endValue.replace(/[^0-9]/g, ''));
            if (start === end) {
                setCount(end);
                return;
            };

            const duration = 2000;
            const frameRate = 60;
            const totalFrames = Math.round(duration / (1000 / frameRate));
            const increment = end / totalFrames;

            const counter = () => {
                start += increment;
                if (start < end) {
                    setCount(start);
                    requestAnimationFrame(counter);
                } else {
                    setCount(end);
                }
            };
            requestAnimationFrame(counter);
        }
    }, [isIntersecting, endValue]);

    const formatValue = (value: number) => {
        const suffix = endValue.replace(/[0-9]/g, '');
        const num = Math.floor(value);
        if (suffix.toLowerCase().includes('k')) {
            return `${num}K+`;
        }
        return `${num}${suffix}`;
    };

    return (
        <div 
            ref={ref as React.Ref<HTMLDivElement>} 
            className="bg-white/60 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
        >
            <p className="text-3xl lg:text-4xl font-bold text-pink-600">{formatValue(count)}</p>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
    );
};

export default Counter;

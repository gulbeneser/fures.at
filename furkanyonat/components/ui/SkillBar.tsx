import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface SkillBarProps {
  name: string;
  level: string;
  percentage: number;
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level, percentage }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (isIntersecting) {
      setTimeout(() => setWidth(percentage), 100); // Small delay to ensure animation plays
    }
  }, [isIntersecting, percentage]);

  return (
    <div ref={ref} className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-primary-text">{name}</span>
        <span className="text-xs font-medium text-secondary-text">{level}</span>
      </div>
      <div className="w-full bg-[var(--card-border)] rounded-full h-2.5 overflow-hidden">
        <div 
          className="relative bg-gradient-to-r from-purple-500 to-sky-500 h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${width}%` }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-shimmer"></div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(100%) skewX(-15deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default SkillBar;

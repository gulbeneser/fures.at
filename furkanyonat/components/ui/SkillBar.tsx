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
      setTimeout(() => setWidth(percentage), 100);
    }
  }, [isIntersecting, percentage]);

  return (
    <div ref={ref} className="w-full">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium text-primary-text">{name}</span>
        <span className="text-xs font-medium text-secondary-text">{level}</span>
      </div>
      <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden border border-white/10">
        <div 
          className="bg-[var(--accent-gradient)] h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export default SkillBar;
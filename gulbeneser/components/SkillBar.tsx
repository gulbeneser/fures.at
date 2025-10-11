import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const SkillBar = ({ name, level, percentage }: { name: string; level: string; percentage: number }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (isIntersecting) {
      setTimeout(() => setWidth(percentage), 100);
    }
  }, [isIntersecting, percentage]);

  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-slate-800">{name}</span>
        <span className="text-sm font-medium text-slate-500">{level}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-pink-500 to-rose-500 h-2.5 rounded-full transition-all duration-1500 ease-out" 
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SkillBar;

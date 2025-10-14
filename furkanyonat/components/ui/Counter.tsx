import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
    return (
        <div className="glass-card p-6 rounded-2xl h-full transition-transform duration-300 hover:-translate-y-1">
            <div className="text-primary-text w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-white/5">
              {icon}
            </div>
            <h3 className="text-lg font-bold text-primary-text font-display">{title}</h3>
            <p className="text-sm text-secondary-text mt-2">{description}</p>
        </div>
    );
};

export default FeatureCard;
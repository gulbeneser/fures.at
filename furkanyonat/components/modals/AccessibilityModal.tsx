import React from 'react';

interface AccessibilityModalProps {
  onClose: () => void;
  lang: any;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ onClose, lang }) => (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
      <div className="glass-card rounded-t-2xl md:rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all duration-300 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary-text hover:text-primary-text" aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-xl font-bold text-primary-text font-display">{lang.title}</h3>
        <div className="mt-4 border-t pt-4 border-card-border">
          <p className="text-secondary-text text-sm leading-relaxed">{lang.statement}</p>
        </div>
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(100%); } to { translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         @media (min-width: 768px) {
          @keyframes slide-up { from { transform: translateY(20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        }
      `}</style>
    </div>
);

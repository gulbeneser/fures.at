import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ToastProps {
  message: string;
  type: 'error' | 'info';
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  const bgColor = type === 'error' 
    ? 'bg-red-500' 
    : 'bg-blue-500';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative w-full p-4 rounded-md shadow-lg text-white ${bgColor}`}
    >
      <p>{message}</p>
      <button 
        onClick={onDismiss} 
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-white/20"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default Toast;

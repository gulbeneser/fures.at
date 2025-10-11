import React from 'react';

const ChatbotAvatar = ({ size = 'w-8 h-8' }: { size?: string }) => {
  return (
    <div className={`${size} flex-shrink-0`}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="avatarGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(18) rotate(90) scale(18)">
            <stop stopColor="#EC4899" /> 
            <stop offset="1" stopColor="#1E40AF" /> 
          </radialGradient>
        </defs>
        <circle cx="18" cy="18" r="18" fill="url(#avatarGradient)" />
        <path d="M12.5 21C12.5 21 14.5 23 18 23C21.5 23 23.5 21 23.5 21" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="16" r="1.5" fill="white" className="animate-eye-blink" />
        <circle cx="22" cy="16" r="1.5" fill="white" className="animate-eye-blink" />
        <circle cx="18" cy="18" r="14" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1" className="animate-pulse-glow" />
      </svg>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            stroke-opacity: 0.3;
            transform: scale(1);
          }
          50% {
            stroke-opacity: 0.7;
            transform: scale(1.02);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 5s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes eye-blink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }
        .animate-eye-blink {
          animation: eye-blink 7s infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
};

export default ChatbotAvatar;

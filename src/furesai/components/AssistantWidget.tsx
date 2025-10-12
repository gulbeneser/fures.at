import React from 'react';
import { ChatBubbleIcon, CloseIcon } from './icons';

interface AssistantWidgetProps {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}

const AssistantWidget: React.FC<AssistantWidgetProps> = ({ isChatOpen, setIsChatOpen }) => {
  return (
    <button
      onClick={() => setIsChatOpen(!isChatOpen)}
      className="fixed bottom-8 right-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 z-50"
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
    >
      {isChatOpen ? <CloseIcon className="w-8 h-8" /> : <ChatBubbleIcon className="w-8 h-8" />}
    </button>
  );
};

export default AssistantWidget;

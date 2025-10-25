import React, { useState } from 'react';
import { SendIcon, MicIcon, StopIcon, ImageIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onGenerateImage: (prompt: string) => Promise<void>;
  onMicClick: () => void;
  isLoading: boolean;
  isListening: boolean;
  isGeneratingImage: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onGenerateImage, onMicClick, isLoading, isListening, isGeneratingImage }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed && !isLoading && !isGeneratingImage) {
      onSendMessage(trimmed);
      setText('');
    }
  };

  const handleGenerateImage = async () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || isListening || isGeneratingImage) {
      return;
    }
    try {
      await onGenerateImage(trimmed);
    } finally {
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-700 flex items-center gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder={isGeneratingImage ? "Generating image..." : isListening ? "Listening..." : "Ask FuresAI..."}
        className="flex-grow bg-gray-700 text-white rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        rows={1}
        disabled={isLoading || isListening || isGeneratingImage}
      />
      {text ? (
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || isGeneratingImage}
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={isLoading || isGeneratingImage}
            className="p-2 rounded-full bg-teal-600 text-white hover:bg-teal-500 disabled:bg-teal-900 disabled:cursor-not-allowed transition-colors"
            aria-label="Generate image"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <button
            type="button"
            onClick={onMicClick}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
        >
            {isListening ? <StopIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
        </button>
      )}
    </form>
  );
};

export default ChatInput;

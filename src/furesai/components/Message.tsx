import React from 'react';
import { Role } from '../types';
import { FuresAIIcon } from './icons';

interface MessageProps {
  role: Role;
  text: string;
}

const Message: React.FC<MessageProps> = ({ role, text }) => {
  const isAI = role === Role.AI;

  return (
    <div className={`flex items-start gap-3 my-4 ${isAI ? '' : 'flex-row-reverse'}`}>
      {isAI && <FuresAIIcon className="w-8 h-8 flex-shrink-0" />}
      <div
        className={`px-4 py-3 rounded-2xl max-w-sm md:max-w-md break-words ${
          isAI
            ? 'bg-gray-700 text-white rounded-tl-none'
            : 'bg-indigo-600 text-white rounded-tr-none'
        }`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

export default Message;

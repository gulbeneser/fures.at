import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tone } from '../types';
import Spinner from './Spinner';

interface HumanizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (tone: Tone) => void;
  isLoading: boolean;
  translations: any;
}

const HumanizeModal: React.FC<HumanizeModalProps> = ({ isOpen, onClose, onApply, isLoading, translations }) => {
  const [selectedTone, setSelectedTone] = useState<Tone>(Tone.AIDetectorProof);

  const handleApply = () => {
    onApply(selectedTone);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{translations.humanizeTitle}</h3>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-600">{translations.tone}</p>
                {Object.values(Tone).map((tone) => (
                  <label key={tone} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tone"
                      value={tone}
                      checked={selectedTone === tone}
                      onChange={() => setSelectedTone(tone)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{translations.tones[tone]}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <span className="font-bold">{translations.noteTitle}:</span> {translations.noteText}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {translations.cancel}
              </button>
              <button
                onClick={handleApply}
                disabled={isLoading}
                className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isLoading ? <Spinner /> : translations.apply}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HumanizeModal;
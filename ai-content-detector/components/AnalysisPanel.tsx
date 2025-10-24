import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult } from '../types';
import Spinner from './Spinner';
import { CheckCircleIcon, WritingIcon, InfoIcon } from './icons';

interface AnalysisPanelProps {
  result: { before: AnalysisResult; after?: AnalysisResult } | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onHumanize: () => void;
  wordCount: number;
  charCount: number;
  isInputEmpty: boolean;
  translations: any;
  textType: string;
  setTextType: (type: string) => void;
}

const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const p = Math.max(0, Math.min(100, percentage));

  let strokeColor = 'stroke-green-500';
  if (p > 40 && p <= 70) {
    strokeColor = 'stroke-yellow-500';
  } else if (p > 70) {
    strokeColor = 'stroke-red-500';
  }

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 120 120">
        <circle className="text-gray-200 dark:text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
        <motion.circle
          className={strokeColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (p / 100) * circumference }}
          transition={{ duration: 1, ease: "circOut" }}
        />
      </svg>
      <span className="absolute text-3xl font-bold text-gray-700 dark:text-gray-200">{Math.round(p)}%</span>
    </div>
  );
};

const ResultCard: React.FC<{ result: AnalysisResult, title: string, translations: any }> = ({ result, title, translations }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full"
    >
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{title}</h3>
        <div className="flex justify-center mb-4">
            <CircularProgress percentage={result.probability} />
        </div>
        <div className="text-center mb-4">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{result.summary}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{`${translations.confidence}: ±${result.confidence}%`}</p>
        </div>
        
        {result.marginOfErrorWarning && result.marginOfErrorWarning.toLowerCase() !== 'null' && (
            <div className="my-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg flex items-start space-x-2">
                <InfoIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    {result.marginOfErrorWarning}
                </p>
            </div>
        )}

        <div className="space-y-3 text-sm mt-4">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300">{translations.reasoning}</h4>
            {result.reasoning.map(item => (
                <div key={item.factor}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 dark:text-gray-400">{item.factor}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{item.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                            className="bg-indigo-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </div>
            ))}
        </div>
         <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">{translations.modelVersion}: {result.model_version}</p>
    </motion.div>
);


const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, isLoading, onAnalyze, onHumanize, wordCount, charCount, isInputEmpty, translations, textType, setTextType }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg h-full p-6 flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.scanMenu}</h2>
      
      <div className="mb-4">
          <label htmlFor="text-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{translations.textType}</label>
          <select 
            id="text-type"
            value={textType}
            onChange={(e) => setTextType(e.target.value)}
            disabled={isLoading}
            className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          >
              {Object.entries(translations.textTypes).map(([key, value]) => (
                  <option key={key} value={key}>{value as string}</option>
              ))}
          </select>
      </div>

      <div className="flex-grow flex flex-col justify-center min-h-[400px]">
        <AnimatePresence mode="wait">
          {!result && !isLoading && (
            <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4 inline-block">
                    <CheckCircleIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-semibold">{translations.readyTitle}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">{translations.readySubtitle}</p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col justify-center items-center">
              <Spinner className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">{translations.analyzing}</p>
            </motion.div>
          )}

          {result && !isLoading && (
            <motion.div key="result" className="flex-grow flex items-center justify-center space-x-4">
                 <ResultCard result={result.before} title={result.after ? translations.before : translations.analysisResult} translations={translations} />
                {result.after && (
                     <ResultCard result={result.after} title={translations.after} translations={translations} />
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onHumanize} disabled={isLoading || isInputEmpty} className="w-full mb-4 flex items-center justify-center px-4 py-3 text-sm font-semibold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 border border-transparent rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <WritingIcon className="w-5 h-5 mr-2" />
            {translations.humanize}
        </motion.button>
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-4 text-center">
          {charCount} / 10,000 {translations.characters}, {wordCount} {translations.words}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onAnalyze} disabled={isLoading || isInputEmpty} className="w-full inline-flex justify-center items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed">
          {isLoading ? <Spinner /> : translations.analyze}
        </motion.button>
      </div>
    </div>
  );
};

export default AnalysisPanel;
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnalysisPanel from './components/AnalysisPanel';
import HumanizeModal from './components/HumanizeModal';
import Footer from './components/Footer';
import Header from './components/Header';
import Toast from './components/Toast';
import { UploadIcon, SparklesIcon, MagicWandIcon, DownloadIcon } from './components/icons';
import { analyzeText, analyzeImage, humanizeText, enhanceImageRealism } from './services/geminiService';
import type { AnalysisResult } from './types';
import { Tone } from './types';
import { useTranslations } from './hooks/useTranslations';
import { useTheme } from './hooks/useTheme';
import Spinner from './components/Spinner';

type InputMode = 'text' | 'image';
export type Language = 'en' | 'tr' | 'ru' | 'de';
type ToastMessage = { id: number; message: string; type: 'error' | 'info' };

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File, previewUrl: string } | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{ before: AnalysisResult; after?: AnalysisResult } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHumanizing, setIsHumanizing] = useState<boolean>(false);
  const [showHumanizeModal, setShowHumanizeModal] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [language, setLanguage] = useState<Language>('en');
  const [textType, setTextType] = useState<string>('general');
  const [theme, setTheme] = useTheme();

  const t = useTranslations(language);

  const showToast = useCallback((message: string, type: 'error' | 'info' = 'error') => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(currentToasts => currentToasts.filter(toast => toast.id !== newToast.id));
    }, 5000);
  }, []);

  const { wordCount, charCount } = useMemo(() => {
    if (!inputText) return { wordCount: 0, charCount: 0 };
    const words = inputText.trim().split(/\s+/).filter(Boolean);
    return {
      wordCount: inputText.trim() === '' ? 0 : words.length,
      charCount: inputText.length,
    };
  }, [inputText]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = useCallback(async (textToAnalyze = inputText) => {
    if (inputMode === 'text' && textToAnalyze.trim().length < 50) {
      showToast(t.errorTooShort, 'info');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let result;
      if (inputMode === 'text' && textToAnalyze) {
        result = await analyzeText(textToAnalyze, textType, language);
      } else if (inputMode === 'image' && uploadedImage) {
        const base64Image = await fileToBase64(uploadedImage.file);
        const imageResult = await analyzeImage(base64Image, uploadedImage.file.type, language);
        result = { ...imageResult, marginOfErrorWarning: null };
      }
      
      if (result) {
        if (analysisResult?.before && !analysisResult.after) {
             setAnalysisResult(prev => prev ? { ...prev, after: result } : null);
        } else {
            setAnalysisResult({ before: result });
        }
      }
    } catch (err) {
      showToast(t.errorAnalysis);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, inputMode, uploadedImage, t, textType, analysisResult, showToast, language]);

  const handleHumanize = useCallback(async (tone: Tone) => {
    if (!inputText) return;
    setIsHumanizing(true);
    try {
      const humanized = await humanizeText(inputText, tone.toString());
      setInputText(humanized);
      await handleAnalyze(humanized);
    } catch (err) {
      showToast(t.errorHumanize);
      console.error(err);
    } finally {
      setIsHumanizing(false);
      setShowHumanizeModal(false);
    }
  }, [inputText, t, handleAnalyze, showToast]);

  const handleEnhanceImage = useCallback(async () => {
    if (!uploadedImage) return;
    setIsEnhancing(true);
    setEnhancedImage(null);
    try {
        const base64Image = await fileToBase64(uploadedImage.file);
        const enhanced = await enhanceImageRealism(base64Image, uploadedImage.file.type);
        setEnhancedImage(enhanced);
    } catch (err) {
        showToast(t.errorEnhance);
        console.error(err);
    } finally {
        setIsEnhancing(false);
    }
  }, [uploadedImage, showToast, t]);
  
  const handleDownloadImage = () => {
    if (!enhancedImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${enhancedImage}`;
    link.download = 'enhanced-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isInputEmpty = useMemo(() => {
    if (inputMode === 'text') return inputText.trim() === '';
    if (inputMode === 'image') return !uploadedImage;
    return true;
  }, [inputMode, inputText, uploadedImage]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          if (!isInputEmpty) {
              handleAnalyze();
          }
      }
  }, [handleAnalyze, isInputEmpty]);

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      };
  }, [handleKeyDown]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage({ file, previewUrl: URL.createObjectURL(file) });
      setEnhancedImage(null);
      setInputText(''); 
      setAnalysisResult(null);
    }
  };
  
  const handleInputModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setAnalysisResult(null);
    setEnhancedImage(null);
  }
  
  const handleTryExample = () => {
      setInputMode('text');
      setInputText(t.exampleText);
      setAnalysisResult(null);
      setEnhancedImage(null);
  }

  return (
    <div className="font-sans">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col transition-colors duration-300">
        <Header currentLang={language} setLang={setLanguage} translations={t.header} theme={theme} toggleTheme={setTheme} />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {t.mainTitle1} <span className="text-indigo-600 dark:text-indigo-400">{t.mainTitle2}</span>
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                  {t.mainSubtitle}
              </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
               <div className="p-2 flex border-b border-gray-200 dark:border-gray-700 items-center">
                  <button onClick={() => handleInputModeChange('text')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${inputMode === 'text' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t.text}</button>
                  <button onClick={() => handleInputModeChange('image')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${inputMode === 'image' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t.image}</button>
                  <div className="flex-grow"></div>
                  <button onClick={handleTryExample} className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 flex items-center space-x-1.5 mr-2">
                    <SparklesIcon className="w-4 h-4" />
                    <span>{t.tryExample}</span>
                  </button>
               </div>
              <div className="flex-grow p-2 flex flex-col">
                <AnimatePresence mode="wait">
                  {inputMode === 'text' ? (
                    <motion.textarea key="textarea" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={t.placeholder} className="w-full h-full min-h-[50vh] resize-none border-none focus:ring-0 p-4 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent" />
                  ) : (
                    <motion.div key="image-uploader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center p-4">
                      {uploadedImage ? (
                         <div className="flex flex-col items-center space-y-4 w-full">
                            <div className="flex flex-wrap justify-center items-start gap-4">
                               <div className="flex flex-col items-center">
                                   <p className="font-semibold mb-2">{t.originalImage}</p>
                                   <div className="relative group">
                                      <img src={uploadedImage.previewUrl} alt="Upload preview" className="max-h-[40vh] rounded-lg shadow-md" />
                                       <button onClick={() => { setUploadedImage(null); setEnhancedImage(null); }} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                  </div>
                               </div>
                               {isEnhancing && (
                                    <div className="flex flex-col items-center justify-center h-full w-64">
                                        <Spinner className="h-10 w-10 text-indigo-600" />
                                        <p className="mt-2 text-sm animate-pulse">{t.enhancingImage}</p>
                                    </div>
                               )}
                               {enhancedImage && (
                                   <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="font-semibold">{t.enhancedImage}</p>
                                            <button onClick={handleDownloadImage} title={t.downloadImage} className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-full transition-colors">
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                       <img src={`data:image/png;base64,${enhancedImage}`} alt="Enhanced" className="max-h-[40vh] rounded-lg shadow-md" />
                                   </div>
                               )}
                            </div>
                            {!enhancedImage && (
                               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleEnhanceImage} disabled={isEnhancing} className="mt-4 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 border border-transparent rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50">
                                   {isEnhancing ? <Spinner className="w-5 h-5 mr-2" /> : <MagicWandIcon className="w-5 h-5 mr-2" />}
                                   {t.enhanceRealismButton}
                               </motion.button>
                            )}
                        </div>
                      ) : (
                         <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors w-full h-full">
                            <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2"/>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.uploadClick}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{t.uploadDrag}</span>
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-1 h-full">
              <AnalysisPanel result={analysisResult} isLoading={isLoading} onAnalyze={() => handleAnalyze()} onHumanize={() => setShowHumanizeModal(true)} wordCount={wordCount} charCount={charCount} isInputEmpty={isInputEmpty} translations={t.analysisPanel} textType={textType} setTextType={setTextType}/>
            </motion.div>
          </div>

        </main>
        <Footer />
        <HumanizeModal isOpen={showHumanizeModal} onClose={() => setShowHumanizeModal(false)} onApply={handleHumanize} isLoading={isHumanizing} translations={t.humanizeModal} />
        
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs space-y-2">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onDismiss={() => setToasts(current => current.filter(t => t.id !== toast.id))} />
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;
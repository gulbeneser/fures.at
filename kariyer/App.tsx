import React, { useState, createContext, useMemo, useEffect } from 'react';
import { CVData } from './types';
import CVEditor from './components/CVEditor';
import CVPreview from './components/CVPreview';
import ExportModal from './components/ExportModal';
import ApplicationAssistantModal from './components/ApplicationAssistantModal';
import InterviewSimulatorModal from './components/InterviewSimulatorModal';
import { translations, TranslationKey, Language } from './translations';
import * as geminiService from './services/geminiService';
import FileUploader from './components/FileUploader';

export type View = 'upload' | 'editor' | 'preview';
export type Tool = 'coverLetter' | 'jobFit' | 'interview' | 'language' | 'career';
export type Voice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';


export const initialCVData: CVData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: '',
    profilePhoto: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

interface LanguageContextType {
    language: Language;
    languageName: string;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey, ...args: any[]) => string;
}

export const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

interface PhotoEnhancerModalProps {
    originalPhoto: string;
    onClose: () => void;
    onConfirm: (newPhoto: string) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const PhotoEnhancerModal: React.FC<PhotoEnhancerModalProps> = ({ originalPhoto, onClose, onConfirm, setIsLoading, setError }) => {
    const { t } = React.useContext(LanguageContext);
    const [enhancedPhoto, setEnhancedPhoto] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!originalPhoto) return null;

    const handleEnhance = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const mimeType = originalPhoto.substring(originalPhoto.indexOf(':') + 1, originalPhoto.indexOf(';'));
            const base64Data = originalPhoto.split(',')[1];
            
            const result = await geminiService.enhancePhoto(base64Data, mimeType);

            const newPhotoDataUrl = `data:${result.mimeType};base64,${result.base64Image}`;
            setEnhancedPhoto(newPhotoDataUrl);

        } catch (err: any) {
            setError(err.message || 'Failed to enhance photo.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">{t('photoEnhancerTitle')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="text-center">
                        <h4 className="font-semibold mb-2">{t('originalPhoto')}</h4>
                        <img src={originalPhoto} alt="Original" className="w-64 h-64 rounded-lg object-cover mx-auto border" />
                    </div>
                    <div className="text-center">
                        <h4 className="font-semibold mb-2">{t('generatedHeadshot')}</h4>
                        <div className="w-64 h-64 rounded-lg bg-gray-100 mx-auto border flex items-center justify-center">
                            {isGenerating && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>}
                            {enhancedPhoto && !isGenerating && <img src={enhancedPhoto} alt="Enhanced" className="w-full h-full rounded-lg object-cover" />}
                            {!enhancedPhoto && !isGenerating && <button onClick={handleEnhance} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">{t('photoEnhancerGenerate')}</button>}
                        </div>
                    </div>
                </div>
                 <div className="flex gap-4 w-full mt-6 pt-4 border-t">
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                    <button onClick={() => onConfirm(enhancedPhoto!)} disabled={!enhancedPhoto || isGenerating} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400">{t('useThisPhoto')}</button>
                </div>
            </div>
        </div>
    );
};


function App() {
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('upload');
  
  const [isExportVisible, setExportVisible] = useState(false);
  const [isPhotoEnhancerVisible, setPhotoEnhancerVisible] = useState(false);
  const [isAssistantVisible, setAssistantVisible] = useState(false);
  const [isInterviewVisible, setInterviewVisible] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const [interviewJobDesc, setInterviewJobDesc] = useState('');
  const [interviewVoice, setInterviewVoice] = useState<Voice>('Zephyr');


  const [language, setLanguage] = useState<Language>('en');

  const languageContextValue = useMemo(() => {
    const t = (key: TranslationKey, ...args: any[]): string => {
        const template = translations[language][key] || translations['en'][key];
        if (typeof template === 'function') {
            return (template as (...args: any[]) => string)(...args);
        }
        return template;
    };
    return {
        language,
        languageName: {
            'en': 'English',
            'tr': 'Turkish',
            'es': 'Spanish',
            'de': 'German'
        }[language] || 'English',
        setLanguage,
        t,
    };
  }, [language]);
  
  const handleToolSelection = (tool: Tool) => {
    setActiveTool(tool);
    // Depending on the tool, we might open a modal directly or after CV upload
    // For now, let's assume the flow is: select tool -> upload CV -> open modal
    // This is handled in FileUploader
  };
  
  const openModalForTool = (tool: Tool) => {
     if (tool === 'interview') {
        // The assistant modal is the pre-step for the interview
        setAssistantVisible(true);
     } else if (tool === 'coverLetter' || tool === 'jobFit') {
        setAssistantVisible(true);
     }
     // Add cases for language and career path modals here if they are created
  };


  const renderCurrentView = () => {
    switch(view) {
        case 'upload':
            return <FileUploader 
                        setCvData={setCvData}
                        setView={setView}
                        setIsLoading={setIsLoading}
                        setError={setError}
                        handleToolSelection={handleToolSelection}
                        openModalForTool={openModalForTool}
                    />
        case 'editor':
            return <CVEditor 
                        cvData={cvData}
                        setCvData={setCvData}
                        setView={setView}
                        openPhotoEnhancer={() => setPhotoEnhancerVisible(true)}
                    />
        case 'preview':
             return <CVPreview
                        cvData={cvData}
                        onEdit={() => setView('editor')}
                        onExport={() => setExportVisible(true)}
                        onOpenAssistant={() => { setActiveTool(null); setAssistantVisible(true); }}
                    />
        default:
            return <div>Error: Invalid view state.</div>
    }
  }
  
  return (
    <LanguageContext.Provider value={languageContextValue}>
      <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-8">
        <header className="max-w-5xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-800">{languageContextValue.t('mainTitle')}</h1>
              <p className="text-gray-600">{languageContextValue.t('mainSubtitle')}</p>
            </div>
            <div className="relative">
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                </select>
            </div>
          </div>
        </header>

        <main className="flex flex-col items-center gap-8">
            {renderCurrentView()}
        </main>
        
        <footer className="text-center mt-12 text-gray-500">
            <p>Powered by <a href="https://www.fures.at" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Fures</a></p>
        </footer>

        {isExportVisible && (
          <ExportModal 
            cvData={cvData}
            onClose={() => setExportVisible(false)}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        )}
        
        {isPhotoEnhancerVisible && (
            <PhotoEnhancerModal
                originalPhoto={cvData.personalInfo.profilePhoto}
                onClose={() => setPhotoEnhancerVisible(false)}
                onConfirm={(newPhoto) => {
                    setCvData(prev => ({...prev, personalInfo: {...prev.personalInfo, profilePhoto: newPhoto}}));
                    setPhotoEnhancerVisible(false);
                }}
                setIsLoading={setIsLoading}
                setError={setError}
            />
        )}
        
        {isAssistantVisible && (
            <ApplicationAssistantModal
                cvData={cvData}
                initialTool={activeTool}
                onClose={() => setAssistantVisible(false)}
                onStartInterview={(jobDesc, voice) => {
                    setInterviewJobDesc(jobDesc);
                    setInterviewVoice(voice as Voice);
                    setAssistantVisible(false);
                    setInterviewVisible(true);
                }}
                setIsLoading={setIsLoading}
                setError={setError}
            />
        )}

        {isInterviewVisible && (
            <InterviewSimulatorModal
                cvData={cvData}
                jobDescription={interviewJobDesc}
                voiceName={interviewVoice}
                onClose={() => setInterviewVisible(false)}
                setError={setError}
            />
        )}


        {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            </div>
        )}

        {error && (
            <div className="fixed bottom-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-lg z-[100] max-w-md">
                <div className="flex justify-between items-center">
                    <p className="font-bold">Error</p>
                    <button onClick={() => setError(null)} className="text-white text-2xl font-bold leading-none">&times;</button>
                </div>
                <p className="mt-1">{error}</p>
            </div>
        )}
      </div>
    </LanguageContext.Provider>
  );
}

export default App;
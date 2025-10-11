import React, { useState, useContext, useEffect } from 'react';
import { CVData } from '../types';
import * as geminiService from '../services/geminiService';
import { LanguageContext } from '../App';

type Tool = 'coverLetter' | 'jobFit' | 'interview' | 'language' | 'career';
type Voice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';


interface ApplicationAssistantModalProps {
    cvData: CVData;
    initialTool: Tool | null;
    onClose: () => void;
    onStartInterview: (jobDescription: string, voice: Voice) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}


const ApplicationAssistantModal: React.FC<ApplicationAssistantModalProps> = ({ cvData, initialTool, onClose, onStartInterview, setIsLoading, setError }) => {
    const { t } = useContext(LanguageContext);
    const [activeTool, setActiveTool] = useState<Tool | null>(initialTool);
    const [jobDescription, setJobDescription] = useState('');
    const [companyInfo, setCompanyInfo] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<Voice>('Zephyr');

     useEffect(() => {
        if (initialTool) {
            setActiveTool(initialTool);
        }
    }, [initialTool]);

    const handleGenerate = async () => {
        if (!activeTool || !jobDescription) {
            setError('Please select a tool and provide a job description.');
            return;
        }

        setIsGenerating(true);
        setGeneratedContent('');
        setError(null);
        try {
            let content = '';
            const detectedLanguage = await geminiService.detectLanguage(jobDescription);
            if (activeTool === 'coverLetter') {
                content = await geminiService.generateCoverLetter(cvData, jobDescription, companyInfo, detectedLanguage);
            } else if (activeTool === 'jobFit') {
                content = await geminiService.analyzeJobFit(cvData, jobDescription, detectedLanguage);
            }
            setGeneratedContent(content);
        } catch (err: any) {
            setError(err.message || `Failed to generate ${activeTool}.`);
        } finally {
            setIsGenerating(false);
        }
    };

    const renderToolUI = () => {
        if (!activeTool) {
            return <p className="text-center text-gray-500 mt-8">{t('selectTool')}</p>;
        }
        
        const isInterview = activeTool === 'interview';

        return (
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobDescription')}</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder={t('pasteJobDescription')}
                        className="w-full p-2 border rounded-md text-sm"
                        rows={isInterview ? 8 : 8}
                    />
                </div>
                {activeTool === 'coverLetter' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyInformation')}</label>
                        <textarea
                            value={companyInfo}
                            onChange={(e) => setCompanyInfo(e.target.value)}
                            placeholder={t('pasteCompanyInfo')}
                            className="w-full p-2 border rounded-md text-sm"
                            rows={4}
                        />
                    </div>
                )}
                 {isInterview && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('interviewerVoice')}</label>
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value as Voice)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="Zephyr">{t('Zephyr')}</option>
                            <option value="Puck">{t('Puck')}</option>
                            <option value="Charon">{t('Charon')}</option>
                            <option value="Kore">{t('Kore')}</option>
                            <option value="Fenrir">{t('Fenrir')}</option>
                        </select>
                    </div>
                )}
                 <button 
                    onClick={isInterview ? () => onStartInterview(jobDescription, selectedVoice) : handleGenerate} 
                    disabled={isGenerating || !jobDescription} 
                    className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                >
                    {isGenerating ? 'Generating...' : isInterview ? t('startInterview') : t('generate')}
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-2xl font-bold">{t('applicationAssistant')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                    {/* Controls */}
                    <div className="md:col-span-1 flex flex-col gap-4 bg-gray-50 p-4 rounded-lg overflow-y-auto">
                        <div className="flex flex-col gap-2">
                             <button onClick={() => setActiveTool('coverLetter')} className={`p-3 rounded-md text-left font-semibold ${activeTool === 'coverLetter' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-200'}`}>{t('coverLetter')}</button>
                             <button onClick={() => setActiveTool('jobFit')} className={`p-3 rounded-md text-left font-semibold ${activeTool === 'jobFit' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-200'}`}>{t('jobFitAnalysis')}</button>
                             <button onClick={() => setActiveTool('interview')} className={`p-3 rounded-md text-left font-semibold ${activeTool === 'interview' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-200'}`}>{t('interviewPractice')}</button>
                        </div>
                        {renderToolUI()}
                    </div>
                    {/* Output */}
                    <div className="md:col-span-2 bg-gray-100 rounded-lg overflow-y-auto p-4">
                        {isGenerating ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : generatedContent ? (
                            <div className="whitespace-pre-wrap text-gray-800 font-serif">{generatedContent}</div>
                        ) : (
                             <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">{activeTool === 'coverLetter' ? t('coverLetter') : (activeTool === 'jobFit' ? t('analysis') : '')} {activeTool !== 'interview' ? t('will appear here.') : ''}</p>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationAssistantModal;
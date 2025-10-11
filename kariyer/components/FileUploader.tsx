import React, { useState, useContext } from 'react';
import { CVData } from '../types';
import { fileToBase64, compressImageIfNeeded, extractTextFromPDF, extractTextFromHTML } from '../utils/fileUtils';
import * as geminiService from '../services/geminiService';
import { LanguageContext } from '../App';
import type { View, Tool } from '../App';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const CoverLetterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const JobFitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const InterviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;


interface FileUploaderProps {
    setCvData: React.Dispatch<React.SetStateAction<CVData>>;
    setView: (view: View) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    handleToolSelection: (tool: Tool) => void;
    openModalForTool: (tool: Tool) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ setCvData, setView, setIsLoading, setError, handleToolSelection, openModalForTool }) => {
    const [pastedText, setPastedText] = useState('');
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const { t, languageName } = useContext(LanguageContext);

    const processData = (extractedData: CVData) => {
        setCvData(extractedData);
        if (selectedTool) {
            openModalForTool(selectedTool);
        } else {
            setView('editor');
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const MAX_UPLOAD_MB = 10;
        if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
             setError(t('errorFileSize', MAX_UPLOAD_MB));
             return;
        }

        setIsLoading(true);
        setError(null);
        try {
            let extractedData;
            if (file.type === 'application/pdf') {
                const text = await extractTextFromPDF(file);
                extractedData = await geminiService.extractCVDataFromText(text, languageName);
            }
            else if (file.type === 'text/html') {
                const text = await extractTextFromHTML(file);
                extractedData = await geminiService.extractCVDataFromText(text, languageName);
            }
            else if (file.type === 'text/plain') {
                const text = await file.text();
                extractedData = await geminiService.extractCVDataFromText(text, languageName);
            } 
            else if (file.type.startsWith('image/')) {
                const processedFile = await compressImageIfNeeded(file);
                if (processedFile.size > 4 * 1024 * 1024) {
                     throw new Error(t('errorTooLargeForAI'));
                }
                const base64Image = await fileToBase64(processedFile);
                extractedData = await geminiService.extractCVDataFromImage(base64Image, processedFile.type, languageName);
            } 
            else {
                throw new Error(t('unsupportedFileError'));
            }
            processData(extractedData);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextSubmit = async () => {
        if (!pastedText.trim()) {
            setError(t('pasteTextError'));
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const extractedData = await geminiService.extractCVDataFromText(pastedText, languageName);
            processData(extractedData);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getSubtitle = () => {
        if (!selectedTool) return t('createCVSubtitle');
        switch(selectedTool) {
            case 'coverLetter': return t('quickToolPrompt_coverLetter');
            case 'jobFit': return t('quickToolPrompt_jobFit');
            case 'interview': return t('quickToolPrompt_interview');
            case 'language': return t('quickToolPrompt_language');
            case 'career': return t('quickToolPrompt_career');
            default: return t('createCVSubtitle');
        }
    };
    
    const onToolClick = (tool: Tool) => {
        setSelectedTool(tool);
        handleToolSelection(tool);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('createCVTitle')}</h2>
                <p className="text-center text-gray-500 mb-6">{getSubtitle()}</p>
                
                {selectedTool && (
                    <div className="text-center mb-6">
                        <button onClick={() => setSelectedTool(null)} className="text-sm text-gray-500 hover:text-gray-700 underline">
                            {t('cancelSelection')}
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Upload Box */}
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors h-full flex flex-col justify-center">
                         <div className="flex flex-col items-center">
                            <UploadIcon />
                            <p className="mt-4 text-sm text-gray-600">
                                <span className="font-semibold text-indigo-600">{t('clickToUpload')}</span> {t('dragAndDrop')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{t('uploadHelpText')}</p>
                        </div>
                        <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.html,.txt,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Paste Text Box */}
                    <div className="flex flex-col h-full">
                        <textarea
                            className="w-full flex-grow p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                            placeholder={t('pasteTextPlaceholder')}
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                        />
                        <button 
                            onClick={handleTextSubmit}
                            className="mt-3 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {t('generateFromText')}
                        </button>
                    </div>
                </div>

                 {!selectedTool && (
                    <div className="mt-8 text-center">
                        <button onClick={() => { setView('editor'); }} className="text-indigo-600 hover:text-indigo-800 font-medium">
                            {t('startFromScratch')}
                        </button>
                    </div>
                 )}
            </div>

             <div className="text-center">
                 <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('quickTools')}</h3>
                 <p className="text-gray-500 mb-8">Or, select a tool below. You'll be asked to provide your CV first.</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tool Cards */}
                    <div onClick={() => onToolClick('coverLetter')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform cursor-pointer">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><CoverLetterIcon /></div>
                        <h4 className="font-bold text-lg">{t('quickCoverLetter')}</h4>
                        <p className="text-sm text-gray-600 mt-2">{t('quickCoverLetterDesc')}</p>
                    </div>
                     <div onClick={() => onToolClick('jobFit')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform cursor-pointer">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><JobFitIcon /></div>
                        <h4 className="font-bold text-lg">{t('quickJobFit')}</h4>
                        <p className="text-sm text-gray-600 mt-2">{t('quickJobFitDesc')}</p>
                    </div>
                     <div onClick={() => onToolClick('interview')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform cursor-pointer">
                        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"><InterviewIcon /></div>
                        <h4 className="font-bold text-lg">{t('quickInterview')}</h4>
                        <p className="text-sm text-gray-600 mt-2">{t('quickInterviewDesc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUploader;

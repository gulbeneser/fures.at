import React, { useState, useEffect, useContext } from 'react';
import { CVData, DesignOptions } from '../types';
import * as geminiService from '../services/geminiService';
import { downloadHTML, downloadPDF } from '../utils/exportUtils';
import { LanguageContext } from '../App';

interface ExportModalProps {
    cvData: CVData;
    onClose: () => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
const PreviewSpinner = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>;

const ExportModal: React.FC<ExportModalProps> = ({ cvData, onClose, setIsLoading, setError }) => {
    const [designOptions, setDesignOptions] = useState<DesignOptions>({
        colorScheme: 'Professional Blue',
        fontStyle: 'Sans Serif',
    });
    const [htmlContent, setHtmlContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [feedback, setFeedback] = useState('');
    const { t, languageName } = useContext(LanguageContext);

    const generateHtml = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const generatedHtml = await geminiService.generateCVTemplateHTML(cvData, designOptions, feedback, languageName);
            setHtmlContent(generatedHtml);
            setFeedback(''); // Clear feedback after regeneration
        } catch (err: any) {
            setError(err.message || 'Failed to generate design.');
            setHtmlContent(''); // Clear content on error
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        generateHtml();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designOptions]); // Regenerate only when options change, not on feedback change

    const handleDownloadPDF = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await downloadPDF(htmlContent);
        } catch (err: any) {
            setError(err.message || 'Failed to download PDF.');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-2xl font-bold">{t('exportTitle')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    {/* Controls */}
                    <div className="lg:col-span-1 flex flex-col gap-6 bg-gray-50 p-4 rounded-lg overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('colorScheme')}</label>
                            <select
                                value={designOptions.colorScheme}
                                onChange={(e) => setDesignOptions(prev => ({ ...prev, colorScheme: e.target.value as DesignOptions['colorScheme'] }))}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="Professional Blue">{t('Professional Blue')}</option>
                                <option value="Modern Dark">{t('Modern Dark')}</option>
                                <option value="Elegant Green">{t('Elegant Green')}</option>
                                <option value="Minimalist Gray">{t('Minimalist Gray')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fontStyle')}</label>
                            <select
                                value={designOptions.fontStyle}
                                onChange={(e) => setDesignOptions(prev => ({ ...prev, fontStyle: e.target.value as DesignOptions['fontStyle'] }))}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="Sans Serif">{t('Sans Serif')}</option>
                                <option value="Serif">{t('Serif')}</option>
                                <option value="Modern">{t('Modern')}</option>
                            </select>
                        </div>
                        <div className="border-t pt-4">
                             <h4 className="text-md font-semibold mb-2">{t('refineDesign')}</h4>
                             <p className="text-xs text-gray-500 mb-2">{t('refineDesignHint')}</p>
                             <textarea 
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={t('refinePlaceholder')}
                                className="w-full p-2 border rounded-md text-sm"
                                rows={3}
                             />
                             <button onClick={generateHtml} disabled={isGenerating || !feedback} className="mt-2 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 flex items-center justify-center h-10">
                                {isGenerating && !htmlContent ? <Spinner /> : t('regenerate')}
                            </button>
                        </div>
                        <div className="mt-auto flex flex-col gap-3 pt-4 border-t">
                            <button 
                                onClick={() => downloadHTML(htmlContent)} 
                                disabled={isGenerating || !htmlContent}
                                className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {t('downloadHTML')}
                            </button>
                            <button 
                                onClick={handleDownloadPDF} 
                                disabled={isGenerating || !htmlContent}
                                className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {t('downloadPDF')}
                            </button>
                        </div>
                    </div>
                    {/* Preview */}
                    <div className="lg:col-span-2 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        {isGenerating ? (
                            <div className="text-center">
                                <PreviewSpinner />
                                <p className="mt-2 text-gray-600">{t('generatingPreview')}</p>
                            </div>
                        ) : htmlContent ? (
                            <iframe
                                srcDoc={htmlContent}
                                title="CV Preview"
                                className="w-full h-full border-0"
                            />
                        ) : (
                             <div className="text-center p-4">
                                <p className="text-gray-600">{t('previewFailed')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
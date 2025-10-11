import React, { useState, useMemo } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { translations } from '../../data/translations';

const GEMINI_KEY = (process.env.API_KEY ||
  (process.env as Record<string, string | undefined>).apikey ||
  process.env.GEMINI_API_KEY) as string | undefined;

const CoverLetterModal = ({ onClose, t }: { onClose: () => void, t: any }) => {
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const ai = useMemo(() => (GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null), []);

    const handleGenerate = async () => {
        if (!companyName.trim() || !jobTitle.trim() || !ai) return;

        setIsLoading(true);
        setGeneratedLetter('');
        setCopySuccess('');

        try {
            const tEN = translations.en;
            const cvData = JSON.stringify({
              name: tEN.name,
              title: tEN.title,
              vision: tEN.vision,
              experience: Object.values(tEN.experience).filter(e => typeof e === 'object' && 'role' in e),
              skills: tEN.skills,
            });

            const prompt = `
                As Gülben Eser, write a concise, professional, and enthusiastic cover letter for the position of "${jobTitle}" at "${companyName}".
                Use the following CV data to highlight the most relevant skills and experiences for this specific role: ${cvData}.
                Keep the tone confident and forward-looking. The letter should be around 200-250 words.
                Address it to the "Hiring Manager" at the company.
                Do not invent any information not present in the CV data.
                The response should be only the cover letter text, without any introductory phrases like "Here is the cover letter:".
            `;

            const response: GenerateContentResponse = await ai.models.generateContent({
// FIX: Updated the model name from 'gemini-flash-lite-latest' to the recommended 'gemini-2.5-flash'.
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            setGeneratedLetter(response.text);

        } catch (error) {
            console.error("Error generating cover letter:", error);
            setGeneratedLetter(t.coverLetterGenerator.error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedLetter).then(() => {
            setCopySuccess(t.coverLetterGenerator.copySuccess);
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Failed to copy text: ', err);
            setCopySuccess(t.coverLetterGenerator.copyError);
             setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl relative transform transition-all duration-300 scale-95 animate-scale-in flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-slate-800">{t.coverLetterGenerator.modalTitle}</h3>
                <p className="text-sm text-slate-500 mt-1">{t.coverLetterGenerator.modalDescription}</p>
                
                {!generatedLetter && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">{t.coverLetterGenerator.companyLabel}</label>
                            <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" placeholder="e.g., Google" />
                        </div>
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700">{t.coverLetterGenerator.jobTitleLabel}</label>
                            <input type="text" id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" placeholder="e.g., Frontend Developer" />
                        </div>
                        <div className="pt-2">
                             <button onClick={handleGenerate} disabled={isLoading || !companyName.trim() || !jobTitle.trim()} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-950 disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                {isLoading ? t.coverLetterGenerator.generatingText : t.coverLetterGenerator.generateButton}
                            </button>
                        </div>
                    </div>
                )}

                {generatedLetter && (
                    <div className="mt-4 pt-4 border-t flex-1 flex flex-col min-h-0">
                        <div className="bg-slate-50 p-4 rounded-lg overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 flex-1">
                            {generatedLetter}
                        </div>
                         <div className="mt-4 flex items-center justify-between">
                            <button onClick={handleCopyToClipboard} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors">
                                {t.coverLetterGenerator.copyButton}
                            </button>
                             {copySuccess && <span className="text-sm text-green-600">{copySuccess}</span>}
                        </div>
                    </div>
                )}

            </div>
            <style>{`
                @keyframes scale-in {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CoverLetterModal;

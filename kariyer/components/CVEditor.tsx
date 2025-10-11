import React, { useState, ChangeEvent, useContext, FocusEvent } from 'react';
import { CVData, Experience, Education } from '../types';
import * as geminiService from '../services/geminiService';
import { LanguageContext } from '../App';

const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>;

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2l4.493 1.248a1 1 0 01.557 1.706l-3.23 3.148 1.033 4.84a1 1 0 01-1.482 1.06L12 16.593l-4.017 2.955a1 1 0 01-1.482-1.06l1.033-4.84-3.23-3.148a1 1 0 01.557-1.706l4.493-1.248L11.033 2.744A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


interface CVEditorProps {
    cvData: CVData;
    setCvData: React.Dispatch<React.SetStateAction<CVData>>;
    setView: (view: 'upload' | 'editor' | 'preview') => void;
    openPhotoEnhancer: () => void;
}

const CVEditor: React.FC<CVEditorProps> = ({ cvData, setCvData, setView, openPhotoEnhancer }) => {
    const { t, languageName } = useContext(LanguageContext);
    const [enhancing, setEnhancing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); // Local error state for this component
    const [isLoading, setIsLoading] = useState(false); // Local loading state
    
    const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        try {
             const reader = new FileReader();
             reader.onloadend = () => {
                setCvData(prev => ({...prev, personalInfo: {...prev.personalInfo, profilePhoto: reader.result as string}}));
             }
             reader.readAsDataURL(file);
        } catch (error: any) {
            setError(error.message || 'Failed to upload photo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUrlBlur = (e: FocusEvent<HTMLInputElement>) => {
        let url = e.target.value;
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            handleInputChange(e, url);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, overrideValue?: string) => {
        const { name, value } = e.target;
        const finalValue = overrideValue !== undefined ? overrideValue : value;
        const [section, field] = name.split('.');
        
        if (section === 'personalInfo') {
            setCvData(prev => ({...prev, personalInfo: {...prev.personalInfo, [field]: finalValue}}));
        } else if (section === 'summary') {
            setCvData(prev => ({...prev, summary: finalValue}));
        }
    };

    const handleListChange = <T extends {id: string}>(section: 'experience' | 'education', id: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCvData(prev => ({
            ...prev,
            [section]: prev[section].map(item => item.id === id ? { ...item, [name]: value } : item) as any
        }));
    };
    
    const addListItem = (section: 'experience' | 'education') => {
        const newItem: Experience | Education = section === 'experience' 
            ? { id: crypto.randomUUID(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' } 
            : { id: crypto.randomUUID(), degree: '', school: '', location: '', gradDate: '' };
        
        setCvData(prev => ({
            ...prev,
            [section]: [...prev[section], newItem] as any
        }));
    }
    
     const removeListItem = (section: 'experience' | 'education', id: string) => {
        setCvData(prev => ({
            ...prev,
            [section]: prev[section].filter(item => item.id !== id)
        }));
    }

    const handleSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCvData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }));
    };
    
    const handleEnhance = async (uniqueId: string, context: string, textGetter: () => string, textSetter: (newText: string) => void) => {
        setEnhancing(uniqueId);
        setError(null);
        try {
            const originalText = textGetter();
            if (!originalText) return;
            const enhancedText = await geminiService.enhanceText(originalText, context, languageName);
            textSetter(enhancedText);
        } catch (err: any) {
            setError(err.message || 'Failed to enhance text.');
        } finally {
            setEnhancing(null);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('reviewEditTitle')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); setView('preview'); }} className="space-y-8">
                
                 {/* Personal Info & Photo */}
                <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">{t('personalInformation')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" name="personalInfo.name" value={cvData.personalInfo.name} onChange={handleInputChange} placeholder={t('fullName')} className="p-2 border rounded-md" />
                            <input type="email" name="personalInfo.email" value={cvData.personalInfo.email} onChange={handleInputChange} placeholder={t('email')} className="p-2 border rounded-md" />
                            <input type="tel" name="personalInfo.phone" value={cvData.personalInfo.phone} onChange={handleInputChange} placeholder={t('phone')} className="p-2 border rounded-md" />
                            <input type="text" name="personalInfo.address" value={cvData.personalInfo.address} onChange={handleInputChange} placeholder={t('address')} className="p-2 border rounded-md" />
                            <input type="text" name="personalInfo.linkedin" value={cvData.personalInfo.linkedin} onBlur={handleUrlBlur} onChange={handleInputChange} placeholder={t('linkedinProfile')} className="p-2 border rounded-md" />
                            <input type="text" name="personalInfo.website" value={cvData.personalInfo.website} onBlur={handleUrlBlur} onChange={handleInputChange} placeholder={t('website')} className="p-2 border rounded-md" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <label className="font-medium text-sm text-gray-700">{t('profilePhoto')}</label>
                            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mb-2">
                                {cvData.personalInfo.profilePhoto ? <img src={cvData.personalInfo.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500">{t('preview')}</span>}
                            </div>
                            <input type="file" id="photo-upload" accept="image/*" onChange={handleProfilePhotoChange} className="hidden"/>
                            <label htmlFor="photo-upload" className="text-sm text-center cursor-pointer bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300">{t('upload')}</label>
                            <button type="button" onClick={openPhotoEnhancer} disabled={!cvData.personalInfo.profilePhoto} className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition disabled:bg-gray-100 disabled:text-gray-400">
                                <SparklesIcon /> {t('enhanceWithAI')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{t('professionalSummary')}</h3>
                         <button
                            type="button"
                            onClick={() => handleEnhance(
                                'summary',
                                'Professional Summary',
                                () => cvData.summary,
                                (newText) => setCvData(prev => ({ ...prev, summary: newText }))
                            )}
                            disabled={enhancing === 'summary'}
                            className="flex items-center justify-center gap-1 text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition w-32"
                        >
                            {enhancing === 'summary' ? <Spinner /> : <><SparklesIcon /> {t('enhanceWithAI')}</>}
                        </button>
                    </div>
                    <textarea name="summary" value={cvData.summary} onChange={handleInputChange} placeholder={t('summaryPlaceholder')} className="w-full p-2 border rounded-md" rows={4}></textarea>
                </div>

                {/* Experience */}
                <div className="p-6 border border-gray-200 rounded-lg">
                     <h3 className="text-xl font-semibold mb-4">{t('workExperience')}</h3>
                     {cvData.experience.map((exp) => (
                         <div key={exp.id} className="space-y-3 mb-4 p-4 border rounded-md bg-gray-50 relative">
                             <button type="button" onClick={() => removeListItem('experience', exp.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors" aria-label={t('remove')}>
                                 <TrashIcon />
                            </button>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="jobTitle" value={exp.jobTitle} onChange={(e) => handleListChange('experience', exp.id, e)} placeholder={t('jobTitle')} className="p-2 border rounded-md"/>
                                <input type="text" name="company" value={exp.company} onChange={(e) => handleListChange('experience', exp.id, e)} placeholder={t('company')} className="p-2 border rounded-md"/>
                                <input type="text" name="location" value={exp.location} onChange={(e) => handleListChange('experience', exp.id, e)} placeholder={t('location')} className="p-2 border rounded-md"/>
                                <input type="text" name="startDate" value={exp.startDate} onChange={(e) => handleListChange('experience', exp.id, e)} placeholder={t('startDate')} className="p-2 border rounded-md"/>
                                <input type="text" name="endDate" value={exp.endDate} onChange={(e) => handleListChange('experience', exp.id, e)} placeholder={t('endDate')} className="p-2 border rounded-md"/>
                             </div>
                             <div className="flex justify-end items-center mb-1">
                                <button
                                    type="button"
                                    onClick={() => handleEnhance(
                                        `exp-${exp.id}`,
                                        'Experience Description',
                                        () => exp.description,
                                        (newText) => setCvData(prev => ({
                                            ...prev,
                                            experience: prev.experience.map(e => e.id === exp.id ? { ...e, description: newText } : e)
                                        }))
                                    )}
                                    disabled={enhancing === `exp-${exp.id}`}
                                    className="flex items-center justify-center gap-1 text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition w-40"
                                >
                                    {enhancing === `exp-${exp.id}` ? <Spinner /> : <><SparklesIcon /> {t('enhanceDescription')}</>}
                                </button>
                            </div>
                             <textarea name="description" value={exp.description} onChange={(e) => handleListChange('experience', exp.id, e)} placeholder={t('descriptionPlaceholder')} className="w-full p-2 border rounded-md" rows={4}></textarea>
                         </div>
                     ))}
                     <button type="button" onClick={() => addListItem('experience')} className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium">{t('addExperience')}</button>
                </div>
                
                {/* Education */}
                 <div className="p-6 border border-gray-200 rounded-lg">
                     <h3 className="text-xl font-semibold mb-4">{t('education')}</h3>
                     {cvData.education.map((edu) => (
                         <div key={edu.id} className="space-y-3 mb-4 p-4 border rounded-md bg-gray-50 relative">
                            <button type="button" onClick={() => removeListItem('education', edu.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors" aria-label={t('remove')}>
                                <TrashIcon />
                            </button>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="degree" value={edu.degree} onChange={(e) => handleListChange('education', edu.id, e)} placeholder={t('degree')} className="p-2 border rounded-md"/>
                                <input type="text" name="school" value={edu.school} onChange={(e) => handleListChange('education', edu.id, e)} placeholder={t('school')} className="p-2 border rounded-md"/>
                                <input type="text" name="location" value={edu.location} onChange={(e) => handleListChange('education', edu.id, e)} placeholder={t('location')} className="p-2 border rounded-md"/>
                                <input type="text" name="gradDate" value={edu.gradDate} onChange={(e) => handleListChange('education', edu.id, e)} placeholder={t('gradDate')} className="p-2 border rounded-md"/>
                            </div>
                         </div>
                     ))}
                     <button type="button" onClick={() => addListItem('education')} className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium">{t('addEducation')}</button>
                </div>

                {/* Skills */}
                <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">{t('skills')}</h3>
                    <input type="text" value={cvData.skills.join(', ')} onChange={handleSkillsChange} placeholder={t('skillsPlaceholder')} className="w-full p-2 border rounded-md" />
                </div>
                
                <div className="flex justify-between items-center pt-6">
                     <button type="button" onClick={() => setView('upload')} className="text-gray-600 hover:text-gray-800 font-medium">
                        &larr; Back to Upload
                    </button>
                     <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                        {t('saveAndPreview')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CVEditor;
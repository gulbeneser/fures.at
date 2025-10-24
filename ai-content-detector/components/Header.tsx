import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeIcon, SunIcon, MoonIcon } from './icons';
import type { Language } from '../App';

interface HeaderProps {
    currentLang: Language;
    setLang: (lang: Language) => void;
    translations: any;
    theme: 'light' | 'dark';
    toggleTheme: (theme: 'light' | 'dark') => void;
}

const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const Header: React.FC<HeaderProps> = ({ currentLang, setLang, translations, theme, toggleTheme }) => {
    const [isLangOpen, setIsLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (lang: Language) => {
        setLang(lang);
        setIsLangOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const selectedLanguage = languages.find(l => l.code === currentLang);

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                        <span className="text-indigo-600 dark:text-indigo-400">AI</span>-Detector
                    </div>
                    <div className="flex items-center space-x-4">
                         <button
                            onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5 text-gray-600" /> : <SunIcon className="w-5 h-5 text-yellow-400" />}
                        </button>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center space-x-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <GlobeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedLanguage?.flag} {selectedLanguage?.code.toUpperCase()}</span>
                            </button>
                            <AnimatePresence>
                                {isLangOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
                                    >
                                        <ul className="py-1">
                                            {languages.map((lang) => (
                                                <li key={lang.code}>
                                                    <button
                                                        onClick={() => handleLanguageChange(lang.code)}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${currentLang === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                    >
                                                    <span>{lang.flag}</span>
                                                    <span>{lang.name}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

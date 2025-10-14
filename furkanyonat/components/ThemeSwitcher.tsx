import React from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
    t: any;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ t, theme, setTheme }) => {
    const options: { value: Theme; label: string; icon: React.ReactElement }[] = [
        { 
            value: 'light', 
            label: t.theme.light,
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" /></svg>
        },
        { 
            value: 'dark', 
            label: t.theme.dark,
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
        },
        { 
            value: 'system', 
            label: t.theme.system,
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.492a.75.75 0 01-.73 1.008H6.827a.75.75 0 01-.73-1.008L6.22 15H4a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg>
        },
    ];

    return (
        <div className="hidden md:flex p-1 rounded-full glass-card bg-transparent border-none shadow-none">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                        theme === option.value
                            ? 'active-pill-button'
                            : 'text-secondary-text hover:text-primary-text'
                    }`}
                    aria-pressed={theme === option.value}
                    title={option.label}
                >
                    {option.icon}
                </button>
            ))}
        </div>
    );
};

export default ThemeSwitcher;
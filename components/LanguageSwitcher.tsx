import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon } from './icons/GlobeIcon';

const languages = {
    en: { nativeName: 'English' },
    es: { nativeName: 'Español' },
};

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 text-brand-text-secondary hover:bg-brand-secondary hover:text-white"
            >
                <GlobeIcon />
                <span className="font-semibold uppercase text-sm">{i18n.language}</span>
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-32 bg-brand-secondary rounded-lg shadow-lg border border-brand-primary py-1 z-50"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {Object.keys(languages).map((lng) => (
                        <button
                            key={lng}
                            style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }}
                            type="submit"
                            onClick={() => changeLanguage(lng)}
                            className={`block w-full text-left px-4 py-2 text-sm ${i18n.resolvedLanguage === lng ? 'text-brand-accent' : 'text-white'} hover:bg-brand-primary`}
                        >
                            {languages[lng as keyof typeof languages].nativeName}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;

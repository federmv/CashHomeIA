
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from './icons/CloseIcon';
import { ShareIOSIcon } from './icons/ShareIOSIcon';
import { MenuDotsIcon } from './icons/MenuDotsIcon';
import { InstallIcon } from './icons/InstallIcon';
import { AppLogo } from './icons/AppLogo';

interface InstallGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Simple detection for iOS devices
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);
    }, []);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex justify-center items-center p-6"
            onClick={onClose}
        >
            <div 
                className="bg-brand-secondary w-full max-w-sm rounded-3xl border border-brand-accent/50 shadow-2xl relative animate-fade-in-down overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-accent/20 to-transparent"></div>

                <div className="relative p-8 flex flex-col items-center text-center">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-brand-text-secondary hover:text-white bg-black/20 rounded-full p-1"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>

                    <div className="bg-brand-surface p-4 rounded-2xl shadow-glow mb-6 border border-white/10">
                        <AppLogo className="h-16 w-16" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">{t('installGuide.title')}</h2>
                    
                    <div className="space-y-6 mt-4 w-full">
                        {isIOS ? (
                            <div className="bg-brand-primary/50 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-center mb-3 text-brand-accent">
                                    <ShareIOSIcon />
                                </div>
                                <p className="text-sm text-brand-text-secondary leading-relaxed">
                                    {t('installGuide.iosInstruction')}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-brand-primary/50 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-center mb-3 text-brand-accent">
                                    <MenuDotsIcon />
                                </div>
                                <p className="text-sm text-brand-text-secondary leading-relaxed">
                                    {t('installGuide.androidInstruction')}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-8 w-full py-3 bg-brand-accent text-white rounded-xl font-bold shadow-glow hover:bg-brand-accent-dark transition-colors"
                    >
                        {t('installGuide.dismiss')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallGuideModal;

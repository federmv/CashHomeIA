
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import { ChartIcon } from './icons/ChartIcon';
import { InvoicesIcon } from './icons/InvoicesIcon';
import { IncomeIcon } from './icons/IncomeIcon';
import { InstallIcon } from './icons/InstallIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { signOut, getAuth } from 'firebase/auth';
import { LogoutIcon } from './icons/LogoutIcon';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Check if event was captured before component mounted
        if ((window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
        }

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
    };

    const NavButton = ({ view, icon, text }: { view: View, icon: React.ReactElement, text: string }) => (
        <button
            onClick={() => setCurrentView(view)}
            // Responsive padding: smaller on mobile, larger on desktop
            className={`flex items-center space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-300 ${
                currentView === view ? 'bg-brand-accent text-white shadow-glow' : 'text-brand-text-secondary hover:bg-brand-secondary hover:text-white'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{text}</span>
        </button>
    );

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth);
    };

    if (!user) return null;

    return (
        <header className="bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-50">
            {/* Reduced horizontal padding for the smallest screens to create more space */}
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* LEFT GROUP: Contains logo and main navigation, grouped for stability */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Logo, prevented from shrinking */}
                        <div className="text-2xl font-black tracking-tighter text-white flex-shrink-0">
                           Cash<span className="text-brand-accent">Home</span>
                        </div>
                        {/* Navigation with responsive padding */}
                        <nav className="flex items-center space-x-1 bg-brand-primary p-1 sm:p-2 rounded-xl">
                           <NavButton view={View.DASHBOARD} icon={<ChartIcon />} text={t('header.dashboard')} />
                           <NavButton view={View.INVOICES} icon={<InvoicesIcon />} text={t('header.invoices')} />
                           <NavButton view={View.INCOME} icon={<IncomeIcon />} text={t('header.income')} />
                        </nav>
                    </div>

                    {/* RIGHT GROUP: Contains language switcher and user actions. Won't shrink. */}
                    <div className="flex items-center flex-shrink-0 gap-2 sm:gap-3">
                        {deferredPrompt && (
                             <button
                                onClick={handleInstallClick}
                                className="bg-brand-accent text-white rounded-lg transition hover:bg-opacity-80 flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 flex-shrink-0 shadow-glow"
                                title={t('header.installApp')}
                            >
                                <div className="sm:hidden"><InstallIcon /></div>
                                <span className="hidden sm:flex items-center gap-2">
                                    <InstallIcon />
                                    <span>{t('header.installApp')}</span>
                                </span>
                            </button>
                        )}
                        <LanguageSwitcher />
                        <div className="text-right hidden sm:block max-w-[100px] md:max-w-40">
                           <p className="text-sm text-white font-semibold truncate" title={user.displayName || user.email || ''}>{user.displayName || user.email}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="bg-brand-secondary border border-brand-secondary/50 text-white rounded-lg transition hover:bg-red-500/50 flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 flex-shrink-0"
                            title={t('header.logout')}
                        >
                            <span className="hidden sm:inline text-sm">{t('header.logout')}</span>
                            <div className="sm:hidden">
                                <LogoutIcon />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

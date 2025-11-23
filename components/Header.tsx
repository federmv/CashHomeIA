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
import { useData } from '../contexts/DataContext';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { isPrivacyMode, togglePrivacyMode } = useData();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        if ((window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
        }

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
    };

    const NavButton = ({ view, icon, text }: { view: View, icon: React.ReactElement, text: string }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`relative flex items-center space-x-2 px-3 sm:px-5 py-2 rounded-full transition-all duration-300 group overflow-hidden ${
                currentView === view 
                    ? 'bg-brand-accent text-white shadow-glow' 
                    : 'text-brand-text-secondary hover:text-white hover:bg-white/5'
            }`}
        >
            <span className="relative z-10 flex items-center gap-2">
                {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" })}
                <span className="hidden sm:inline text-sm font-medium">{text}</span>
            </span>
        </button>
    );

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth);
    };

    if (!user) return null;

    return (
        <header className={`sticky top-4 z-50 mx-4 lg:mx-auto max-w-7xl transition-all duration-500 ${scrolled ? 'translate-y-0' : 'translate-y-0'}`}>
             <div className="bg-brand-surface backdrop-blur-xl border border-brand-border rounded-2xl shadow-glass px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo & Nav */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        <div id="header-logo" className="text-xl sm:text-2xl font-black tracking-tighter text-white flex-shrink-0 flex items-center cursor-pointer" onClick={() => setCurrentView(View.DASHBOARD)}>
                           <span className="text-gradient">CashHome</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-1 bg-black/20 p-1 rounded-full border border-white/5">
                           <NavButton view={View.DASHBOARD} icon={<ChartIcon />} text={t('header.dashboard')} />
                           <NavButton view={View.INVOICES} icon={<InvoicesIcon />} text={t('header.invoices')} />
                           <NavButton view={View.INCOME} icon={<IncomeIcon />} text={t('header.income')} />
                        </nav>
                    </div>
                    
                    {/* Mobile Nav (Icon Only) - Visible only on small screens */}
                    <nav className="flex md:hidden items-center space-x-1 bg-black/20 p-1 rounded-full border border-white/5">
                        <button onClick={() => setCurrentView(View.DASHBOARD)} className={`p-2 rounded-full ${currentView === View.DASHBOARD ? 'bg-brand-accent text-white' : 'text-brand-text-secondary'}`}><ChartIcon /></button>
                        <button onClick={() => setCurrentView(View.INVOICES)} className={`p-2 rounded-full ${currentView === View.INVOICES ? 'bg-brand-accent text-white' : 'text-brand-text-secondary'}`}><InvoicesIcon /></button>
                        <button onClick={() => setCurrentView(View.INCOME)} className={`p-2 rounded-full ${currentView === View.INCOME ? 'bg-brand-accent text-white' : 'text-brand-text-secondary'}`}><IncomeIcon /></button>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {deferredPrompt && (
                             <button
                                onClick={handleInstallClick}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-2 sm:px-4 sm:py-2 shadow-glow hover:opacity-90 transition-all"
                                title={t('header.installApp')}
                            >
                                <div className="sm:hidden"><InstallIcon /></div>
                                <span className="hidden sm:flex items-center gap-2 text-sm font-semibold">
                                    <InstallIcon />
                                    <span>{t('header.installApp')}</span>
                                </span>
                            </button>
                        )}
                        
                        {/* Privacy Toggle */}
                        <button
                            id="tour-privacy"
                            onClick={togglePrivacyMode}
                            className={`p-2 rounded-full transition-colors ${isPrivacyMode ? 'text-brand-accent bg-brand-accent/10' : 'text-brand-text-secondary hover:text-white hover:bg-white/5'}`}
                            title="Toggle Privacy Mode"
                        >
                            {isPrivacyMode ? <EyeOffIcon /> : <EyeIcon />}
                        </button>

                        <LanguageSwitcher />
                        <div className="hidden lg:block h-8 w-px bg-white/10 mx-2"></div>
                        <div className="text-right hidden lg:block">
                           <p className="text-xs text-brand-text-secondary font-medium uppercase tracking-wider">Welcome</p>
                           <p className="text-sm text-white font-semibold truncate max-w-[120px]">{user.displayName || 'User'}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-brand-text-secondary hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
                            title={t('header.logout')}
                        >
                            <LogoutIcon />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
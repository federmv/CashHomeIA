import React from 'react';
import { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import { ChartIcon } from './icons/ChartIcon';
import { InvoicesIcon } from './icons/InvoicesIcon';
import { IncomeIcon } from './icons/IncomeIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { signOut, getAuth } from 'firebase/auth';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
    user: User;
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentView, setCurrentView }) => {
    const { t } = useTranslation();

    const NavButton = ({ view, icon, text }: { view: View, icon: React.ReactElement, text: string }) => (
        <button
            onClick={() => setCurrentView(view)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
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

    return (
        <header className="bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-black tracking-tighter text-white">
                           Cash<span className="text-brand-accent">Home</span>
                        </div>
                    </div>
                    <nav className="flex items-center space-x-1 sm:space-x-2 bg-brand-primary p-2 rounded-xl">
                       <NavButton view={View.DASHBOARD} icon={<ChartIcon />} text={t('header.dashboard')} />
                       <NavButton view={View.INVOICES} icon={<InvoicesIcon />} text={t('header.invoices')} />
                       <NavButton view={View.INCOME} icon={<IncomeIcon />} text={t('header.income')} />
                    </nav>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <LanguageSwitcher />
                        <div className="text-right hidden sm:block max-w-40">
                           <p className="text-sm text-white font-semibold truncate" title={user.displayName || user.email || ''}>{user.displayName || user.email}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="bg-brand-secondary border border-brand-secondary/50 text-white rounded-lg transition hover:bg-red-500/50 flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4"
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
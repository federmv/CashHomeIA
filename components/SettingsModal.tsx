
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useData } from '../contexts/DataContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { 
        customExpenseCategories, 
        customIncomeCategories, 
        addCustomCategory, 
        removeCustomCategory,
        expenseCategories, // Full list for display if needed, but we only delete custom
        incomeCategories
    } = useData();

    const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        
        await addCustomCategory(activeTab === 'expenses' ? 'expense' : 'income', newCategory);
        setNewCategory('');
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-brand-secondary w-full max-w-md rounded-2xl border border-brand-accent/30 shadow-glow flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 flex justify-between items-center border-b border-brand-primary flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
                    <button 
                        onClick={onClose}
                        className="text-brand-text-secondary hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>

                <div className="p-4 border-b border-brand-primary flex gap-2">
                    <button 
                        onClick={() => setActiveTab('expenses')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                            activeTab === 'expenses' 
                            ? 'bg-brand-accent text-white' 
                            : 'bg-brand-primary text-brand-text-secondary hover:text-white'
                        }`}
                    >
                        {t('settings.expenseCategories')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('income')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                            activeTab === 'income' 
                            ? 'bg-brand-accent text-white' 
                            : 'bg-brand-primary text-brand-text-secondary hover:text-white'
                        }`}
                    >
                        {t('settings.incomeCategories')}
                    </button>
                </div>

                <main className="p-6 flex-grow overflow-y-auto">
                    <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder={t('settings.addPlaceholder')}
                            className="flex-grow bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition"
                        />
                        <button 
                            type="submit" 
                            disabled={!newCategory.trim()}
                            className="bg-brand-accent text-white p-2 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon />
                        </button>
                    </form>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-3">{t('settings.custom')}</h3>
                        {(activeTab === 'expenses' ? customExpenseCategories : customIncomeCategories).length === 0 ? (
                            <p className="text-sm text-brand-text-secondary italic">{t('settings.noCustomCategories')}</p>
                        ) : (
                            (activeTab === 'expenses' ? customExpenseCategories : customIncomeCategories).map(cat => (
                                <div key={cat} className="flex justify-between items-center bg-brand-primary p-3 rounded-lg border border-brand-text-secondary/20">
                                    <span className="text-white">{cat}</span>
                                    <button 
                                        onClick={() => removeCustomCategory(activeTab === 'expenses' ? 'expense' : 'income', cat)}
                                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))
                        )}

                        <div className="my-4 border-t border-brand-text-secondary/20"></div>

                        <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-3">{t('settings.defaults')}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {(activeTab === 'expenses' ? expenseCategories : incomeCategories)
                                .filter(c => !(activeTab === 'expenses' ? customExpenseCategories : customIncomeCategories).includes(c))
                                .map(cat => (
                                    <div key={cat} className="text-sm text-brand-text-secondary bg-brand-primary/50 px-3 py-2 rounded border border-transparent">
                                        {cat}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsModal;

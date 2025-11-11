import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Income } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { toast } from 'react-hot-toast';

interface ManualIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddIncome: (income: Omit<Income, 'id'>) => Promise<void>;
    onUpdateIncome: (id: string, income: Omit<Income, 'id'>) => Promise<void>;
    incomeToEdit: Income | null;
}

const ManualIncomeModal: React.FC<ManualIncomeModalProps> = ({ isOpen, onClose, onAddIncome, onUpdateIncome, incomeToEdit }) => {
    const { t } = useTranslation();
    const isEditMode = !!incomeToEdit;

    const INCOME_CATEGORIES = useMemo(() => [
        t('incomeCategories.salary'), t('incomeCategories.sales'), t('incomeCategories.freelance'),
        t('incomeCategories.investment'), t('incomeCategories.rental'), t('incomeCategories.other')
    ], [t]);

    const [source, setSource] = useState('');
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
    const [isSaving, setIsSaving] = useState(false);

    const resetForm = () => {
        setSource('');
        setDate(new Date().toISOString().split('T')[0]);
        setAmount('');
        setDescription('');
        setCategory(INCOME_CATEGORIES[0]);
    };

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setSource(incomeToEdit.source);
                setDate(incomeToEdit.date);
                setAmount(incomeToEdit.amount);
                setDescription(incomeToEdit.description);
                setCategory(incomeToEdit.category || INCOME_CATEGORIES[0]);
            } else {
                resetForm();
            }
        }
    }, [isOpen, isEditMode, incomeToEdit, INCOME_CATEGORIES]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!source.trim() || !amount || amount <= 0) {
            toast.error(t('notifications.fillSourceAndAmount'));
            return;
        }

        setIsSaving(true);
        const newIncome: Omit<Income, 'id'> = {
            source,
            date,
            amount: Number(amount),
            description,
            category
        };

        try {
            if (isEditMode) {
                await onUpdateIncome(incomeToEdit.id, newIncome);
            } else {
                await onAddIncome(newIncome);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save income:", error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-brand-secondary w-full max-w-lg rounded-2xl border border-brand-accent/30 shadow-glow"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <header className="p-6 flex justify-between items-center border-b border-brand-primary">
                        <h2 className="text-2xl font-bold text-white">{isEditMode ? t('modals.editIncome') : t('modals.newIncome')}</h2>
                        <button type="button" onClick={onClose} className="text-brand-text-secondary hover:text-white p-1 rounded-full hover:bg-white/10" aria-label="Close">
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </header>
                    
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="source" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('modals.incomeSource')}</label>
                            <input type="text" id="source" value={source} onChange={e => setSource(e.target.value)} required className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="income-date" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('modals.date')}</label>
                                <input type="date" id="income-date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white" style={{ colorScheme: 'dark' }} />
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('modals.amount')}</label>
                                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')} required min="0" step="any" className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="income-category" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('modals.category')}</label>
                            <select id="income-category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white focus:ring-brand-accent focus:border-brand-accent transition">
                                {INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('modals.descriptionOptional')}</label>
                            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white" />
                        </div>
                    </main>

                    <footer className="p-6 border-t border-brand-primary flex justify-end">
                        <button type="submit" className="px-6 py-2 w-36 bg-brand-accent text-white rounded-lg font-semibold hover:bg-opacity-80 transition shadow-glow disabled:opacity-50 flex justify-center items-center" disabled={isSaving || !source.trim() || !amount || amount <= 0}>
                            {isSaving ? <SpinnerIcon /> : t('modals.saveIncome')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ManualIncomeModal;
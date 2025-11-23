
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Income } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import ManualIncomeModal from './ManualIncomeModal';
import ConfirmationModal from './ConfirmationModal';
import { useData } from '../contexts/DataContext';

const IncomeList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { income, deleteIncome, addIncome, updateIncome } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatCurrency = useMemo(() => (num: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    }, [i18n.language]);

    const formatDate = useMemo(() => (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }, [i18n.language]);

    const filteredIncome = useMemo(() => {
        const now = new Date();
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return income.filter(inc => {
            const incomeDate = new Date(inc.date);
            if (dateFilter !== 'all') {
                let startDate = new Date();
                if (dateFilter === 'this_month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                else if (dateFilter === 'last_30_days') startDate.setDate(now.getDate() - 30);
                else if (dateFilter === 'last_7_days') startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                if (incomeDate < startDate) return false;
            }

            if (lowerCaseSearchTerm) {
                const matchesSource = inc.source.toLowerCase().includes(lowerCaseSearchTerm);
                const matchesDescription = inc.description.toLowerCase().includes(lowerCaseSearchTerm);
                return matchesSource || matchesDescription;
            }

            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [income, searchTerm, dateFilter]);

    const handleOpenEditModal = (income: Income) => {
        setIncomeToEdit(income);
        setIsModalOpen(true);
    };

    const handleOpenNewModal = () => {
        setIncomeToEdit(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIncomeToEdit(null);
    };
    
    const handleOpenDeleteConfirm = (incomeEntry: Income) => {
        setIncomeToDelete(incomeEntry);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!incomeToDelete) return;
        setIsDeleting(true);
        try {
            await deleteIncome(incomeToDelete.id);
        } finally {
            setIsDeleting(false);
            setIsConfirmModalOpen(false);
            setIncomeToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-brand-surface backdrop-blur-md border border-brand-border p-4 rounded-2xl shadow-sm">
                 <h2 className="text-xl font-bold text-white pl-2 border-l-4 border-emerald-500">{t('income.title')}</h2>
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                   <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="w-full sm:w-auto bg-brand-secondary/50 border border-brand-border rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="all">{t('dateFilters.all')}</option>
                        <option value="this_month">{t('dateFilters.month')}</option>
                        <option value="last_30_days">{t('dateFilters.last30')}</option>
                        <option value="last_7_days">{t('dateFilters.last7')}</option>
                    </select>
                   <input
                        type="text"
                        placeholder={t('income.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 bg-brand-secondary/50 border border-brand-border rounded-xl px-4 py-2.5 text-white placeholder-brand-text-secondary text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                        onClick={handleOpenNewModal}
                        type="button"
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition duration-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        <PlusIcon />
                        {t('income.newIncome')}
                    </button>
                </div>
            </div>
            
            {filteredIncome.length === 0 ? (
                <div className="text-center py-16 bg-brand-surface border border-brand-border rounded-2xl backdrop-blur-md">
                    <div className="w-16 h-16 bg-brand-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PlusIcon />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('income.noIncome')}</h3>
                    <p className="text-sm text-brand-text-secondary max-w-xs mx-auto mt-2 mb-6">{t('income.noIncomeDescription')}</p>
                    <button
                        onClick={handleOpenNewModal}
                        type="button"
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition duration-300 shadow-glow flex items-center justify-center gap-2 mx-auto"
                    >
                        <PlusIcon /> {t('income.addNewIncome')}
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                     <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-brand-text-secondary text-xs uppercase tracking-wider">
                                <th className="px-4 pb-2 text-left">{t('income.source')}</th>
                                <th className="px-4 pb-2 text-left hidden lg:table-cell">{t('income.category')}</th>
                                <th className="px-4 pb-2 text-left hidden md:table-cell">{t('income.description')}</th>
                                <th className="px-4 pb-2 text-left hidden sm:table-cell">{t('income.date')}</th>
                                <th className="px-4 pb-2 text-right">{t('income.amount')}</th>
                                <th className="px-4 pb-2 text-center">{t('income.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncome.map(inc => (
                                <tr key={inc.id} className="bg-brand-surface backdrop-blur-md hover:bg-brand-secondary/80 transition-all duration-200 shadow-sm hover:shadow-md group">
                                    <td className="p-4 rounded-l-xl border-y border-l border-brand-border group-hover:border-emerald-500/30 font-bold text-white">
                                        <div className="flex flex-col">
                                            <span>{inc.source}</span>
                                            <span className="text-xs text-brand-text-secondary font-normal sm:hidden">{formatDate(inc.date)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-y border-brand-border group-hover:border-emerald-500/30 hidden lg:table-cell">
                                         <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-brand-text-secondary border border-white/10">
                                            {inc.category}
                                        </span>
                                    </td>
                                    <td className="p-4 border-y border-brand-border group-hover:border-emerald-500/30 text-brand-text-secondary text-sm hidden md:table-cell">{inc.description}</td>
                                    <td className="p-4 border-y border-brand-border group-hover:border-emerald-500/30 text-brand-text-secondary text-sm hidden sm:table-cell">{formatDate(inc.date)}</td>
                                    <td className="p-4 border-y border-brand-border group-hover:border-emerald-500/30 text-emerald-400 font-mono font-bold text-right">{formatCurrency(inc.amount)}</td>
                                    <td className="p-4 rounded-r-xl border-y border-r border-brand-border group-hover:border-emerald-500/30 text-center">
                                        <div className="flex justify-center items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenEditModal(inc)}
                                                className="text-emerald-400 hover:text-white p-2 rounded-lg hover:bg-emerald-500"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenDeleteConfirm(inc)} 
                                                className="text-red-400 hover:text-white p-2 rounded-lg hover:bg-red-500"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ManualIncomeModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAddIncome={addIncome}
                onUpdateIncome={updateIncome}
                incomeToEdit={incomeToEdit}
            />
             <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('modals.confirmation.deleteTitle')}
                message={t('modals.confirmation.deleteIncomeMessage')}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default IncomeList;

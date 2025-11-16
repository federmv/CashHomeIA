
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
            month: 'long',
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
        <div className="bg-brand-secondary p-4 sm:p-6 rounded-xl border border-brand-accent/20 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">{t('income.title')}</h1>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                   <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="w-full sm:w-auto bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white"
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
                        className="w-full sm:w-48 bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white"
                    />
                    <button
                        onClick={handleOpenNewModal}
                        type="button"
                        className="w-full sm:w-auto px-4 py-2 bg-brand-accent text-white rounded-lg font-semibold hover:bg-opacity-80 transition duration-300 shadow-glow flex items-center justify-center gap-2"
                    >
                        <PlusIcon />
                        {t('income.newIncome')}
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-brand-text-secondary/20">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary">{t('income.source')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary hidden lg:table-cell">{t('income.category')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary hidden md:table-cell">{t('income.description')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary hidden sm:table-cell">{t('income.date')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary text-right">{t('income.amount')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary text-center">{t('income.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIncome.map(inc => (
                            <tr key={inc.id} className="border-b border-brand-primary hover:bg-brand-primary/50">
                                <td className="p-3 font-medium text-white">{inc.source}</td>
                                <td className="p-3 text-brand-text-secondary hidden lg:table-cell">{inc.category}</td>
                                <td className="p-3 text-brand-text-secondary hidden md:table-cell">{inc.description}</td>
                                <td className="p-3 text-brand-text-secondary hidden sm:table-cell">{formatDate(inc.date)}</td>
                                <td className="p-3 text-white font-semibold text-right">{formatCurrency(inc.amount)}</td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEditModal(inc)}
                                            className="text-brand-accent hover:text-opacity-80 p-1 rounded-full hover:bg-brand-accent/10"
                                            aria-label={`Edit income from ${inc.source}`}
                                        >
                                            <EditIcon />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenDeleteConfirm(inc)} 
                                            className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-500/10"
                                            aria-label={`Delete income from ${inc.source}`}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredIncome.length === 0 && (
                     <div className="text-center py-12 text-brand-text-secondary">
                        <h3 className="text-lg font-semibold">{t('income.noIncome')}</h3>
                        <p className="text-sm max-w-md mx-auto my-2">{t('income.noIncomeDescription')}</p>
                        <button
                            onClick={handleOpenNewModal}
                            type="button"
                            className="mt-4 px-4 py-2 bg-brand-accent text-white rounded-lg font-semibold hover:bg-opacity-80 transition duration-300 shadow-glow flex items-center justify-center gap-2 mx-auto"
                        >
                            <PlusIcon /> {t('income.addNewIncome')}
                        </button>
                    </div>
                )}
            </div>
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
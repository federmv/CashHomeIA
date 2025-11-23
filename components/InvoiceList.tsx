
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import InvoiceDetailModal from './InvoiceDetailModal';
import ManualInvoiceModal from './ManualInvoiceModal';
import { PlusIcon } from './icons/PlusIcon';
import { RepeatIcon } from './icons/RepeatIcon';
import ConfirmationModal from './ConfirmationModal';
import { useData } from '../contexts/DataContext';

const InvoiceList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { invoices, deleteInvoice, addInvoice, updateInvoice } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
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
    
    const filteredInvoices = useMemo(() => {
        const now = new Date();
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            if (dateFilter !== 'all') {
                let startDate = new Date();
                if (dateFilter === 'this_month') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (dateFilter === 'last_30_days') {
                    startDate.setDate(now.getDate() - 30);
                } else if (dateFilter === 'last_7_days') {
                    startDate.setDate(now.getDate() - 7);
                }
                
                startDate.setHours(0, 0, 0, 0);

                if (invoiceDate < startDate) {
                    return false;
                }
            }

            if (lowerCaseSearchTerm) {
                const matchesProvider = invoice.provider.toLowerCase().includes(lowerCaseSearchTerm);
                const matchesFileName = invoice.fileName.toLowerCase().includes(lowerCaseSearchTerm);
                const matchesItem = invoice.items.some(item => 
                    item.description.toLowerCase().includes(lowerCaseSearchTerm)
                );
                return matchesProvider || matchesFileName || matchesItem;
            }

            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, searchTerm, dateFilter]);
    
    const handleOpenEditModal = (invoice: Invoice) => {
        setInvoiceToEdit(invoice);
        setIsManualModalOpen(true);
    };

    const handleOpenNewModal = () => {
        setInvoiceToEdit(null);
        setIsManualModalOpen(true);
    };

    const handleCloseManualModal = () => {
        setIsManualModalOpen(false);
        setInvoiceToEdit(null);
    };

    const handleOpenDeleteConfirm = (invoice: Invoice) => {
        setInvoiceToDelete(invoice);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!invoiceToDelete) return;
        setIsDeleting(true);
        try {
            await deleteInvoice(invoiceToDelete.id);
        } finally {
            setIsDeleting(false);
            setIsConfirmModalOpen(false);
            setInvoiceToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-brand-surface backdrop-blur-md border border-brand-border p-4 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold text-white pl-2 border-l-4 border-brand-accent">{t('invoices.title')}</h2>
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                   <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="w-full sm:w-auto bg-brand-secondary/50 border border-brand-border rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-brand-accent outline-none"
                    >
                        <option value="all">{t('dateFilters.all')}</option>
                        <option value="this_month">{t('dateFilters.month')}</option>
                        <option value="last_30_days">{t('dateFilters.last30')}</option>
                        <option value="last_7_days">{t('dateFilters.last7')}</option>
                    </select>
                   <input
                        type="text"
                        placeholder={t('invoices.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 bg-brand-secondary/50 border border-brand-border rounded-xl px-4 py-2.5 text-white placeholder-brand-text-secondary text-sm focus:ring-2 focus:ring-brand-accent outline-none"
                    />
                </div>
            </div>

            {filteredInvoices.length === 0 ? (
                <div className="text-center py-16 bg-brand-surface border border-brand-border rounded-2xl backdrop-blur-md">
                    <div className="w-16 h-16 bg-brand-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PlusIcon />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('invoices.noInvoices')}</h3>
                    <p className="text-sm text-brand-text-secondary max-w-xs mx-auto mt-2 mb-6">{t('invoices.noInvoicesDescription')}</p>
                    <button
                        onClick={handleOpenNewModal}
                        type="button"
                        className="px-6 py-2.5 bg-brand-accent hover:bg-brand-accent-dark text-white rounded-xl font-semibold transition duration-300 shadow-glow flex items-center justify-center gap-2 mx-auto"
                    >
                        <PlusIcon /> {t('invoices.addNewInvoice')}
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-brand-text-secondary text-xs uppercase tracking-wider">
                                <th className="px-4 pb-2 text-left">{t('invoices.provider')}</th>
                                <th className="px-4 pb-2 text-left hidden md:table-cell">{t('invoices.category')}</th>
                                <th className="px-4 pb-2 text-left hidden sm:table-cell">{t('invoices.date')}</th>
                                <th className="px-4 pb-2 text-right">{t('invoices.total')}</th>
                                <th className="px-4 pb-2 text-center">{t('invoices.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map(invoice => (
                                <tr 
                                    key={invoice.id} 
                                    className="bg-brand-surface backdrop-blur-md hover:bg-brand-secondary/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group"
                                    onClick={() => setSelectedInvoice(invoice)}
                                >
                                    <td className="p-4 rounded-l-xl border-y border-l border-brand-border group-hover:border-brand-accent/30">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-sm sm:text-base">{invoice.provider}</span>
                                                {invoice.isRecurring && (
                                                    <div className="text-brand-accent" title={t('invoices.recurringInfo', { frequency: t(`modals.${invoice.recurringFrequency}`) })}>
                                                        <RepeatIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-brand-text-secondary sm:hidden">{formatDate(invoice.date)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-y border-brand-border group-hover:border-brand-accent/30 hidden md:table-cell">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-brand-text-secondary border border-white/10">
                                            {invoice.category}
                                        </span>
                                    </td>
                                    <td className="p-4 border-y border-brand-border group-hover:border-brand-accent/30 text-sm text-brand-text-secondary hidden sm:table-cell">
                                        {formatDate(invoice.date)}
                                    </td>
                                    <td className="p-4 border-y border-brand-border group-hover:border-brand-accent/30 text-right">
                                        <span className="font-mono font-bold text-white">{formatCurrency(invoice.total)}</span>
                                    </td>
                                    <td className="p-4 rounded-r-xl border-y border-r border-brand-border group-hover:border-brand-accent/30 text-center">
                                        <div className="flex justify-center items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenEditModal(invoice);
                                                }}
                                                className="text-brand-accent-light hover:text-white p-2 rounded-lg hover:bg-brand-accent"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDeleteConfirm(invoice);
                                                }} 
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
            
            <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
            <ManualInvoiceModal 
                isOpen={isManualModalOpen}
                onClose={handleCloseManualModal}
                onAddInvoice={addInvoice}
                onUpdateInvoice={updateInvoice}
                invoiceToEdit={invoiceToEdit}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('modals.confirmation.deleteTitle')}
                message={t('modals.confirmation.deleteInvoiceMessage')}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default InvoiceList;

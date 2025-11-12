import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import InvoiceDetailModal from './InvoiceDetailModal';
import ManualInvoiceModal from './ManualInvoiceModal';
import { PlusIcon } from './icons/PlusIcon';

interface InvoiceListProps {
    invoices: Invoice[];
    deleteInvoice: (id: string) => Promise<void>;
    addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
    updateInvoice: (id: string, invoice: Omit<Invoice, 'id'>) => Promise<void>;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, deleteInvoice, addInvoice, updateInvoice }) => {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);

    const formatCurrency = useMemo(() => (num: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    }, [i18n.language]);

    const formatDate = useMemo(() => (dateString: string) => {
        // FIX: Corrected typo from toLocaleDateDateString to toLocaleDateString.
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'long',
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

    return (
        <div className="bg-brand-secondary p-4 sm:p-6 rounded-xl border border-brand-accent/20">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-white">{t('invoices.title')}</h2>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                   <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="w-full sm:w-auto bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition"
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
                        className="w-full sm:w-48 bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition"
                    />
                    <button
                        onClick={handleOpenNewModal}
                        type="button"
                        className="px-4 py-2 bg-brand-accent text-white rounded-lg font-semibold hover:bg-opacity-80 transition duration-300 shadow-glow flex items-center justify-center gap-2"
                    >
                        <PlusIcon />
                        <span className="hidden sm:inline">{t('invoices.newInvoice')}</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto touch-pan-y">
                <table className="w-full text-left">
                    <thead className="border-b border-brand-text-secondary/20">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary">{t('invoices.provider')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary hidden md:table-cell">{t('invoices.category')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary hidden sm:table-cell">{t('invoices.date')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary text-right">{t('invoices.total')}</th>
                            <th className="p-3 text-sm font-semibold text-brand-text-secondary text-center">{t('invoices.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(invoice => (
                            <tr 
                                key={invoice.id} 
                                className="border-b border-brand-primary hover:bg-brand-primary/50 cursor-pointer"
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <td className="p-3 font-medium text-white">{invoice.provider}</td>
                                <td className="p-3 text-brand-text-secondary hidden md:table-cell">{invoice.category}</td>
                                <td className="p-3 text-brand-text-secondary hidden sm:table-cell">{formatDate(invoice.date)}</td>
                                <td className="p-3 text-white font-semibold text-right">{formatCurrency(invoice.total)}</td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEditModal(invoice);
                                            }}
                                            className="text-brand-accent hover:text-opacity-80 p-1 rounded-full hover:bg-brand-accent/10"
                                            aria-label={`Edit invoice from ${invoice.provider}`}
                                        >
                                            <EditIcon />
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteInvoice(invoice.id);
                                            }} 
                                            className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-500/10"
                                            aria-label={`Delete invoice from ${invoice.provider}`}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredInvoices.length === 0 && (
                    <div className="text-center py-12 text-brand-text-secondary">
                        <h3 className="text-lg font-semibold">{t('invoices.noInvoices')}</h3>
                        <p className="text-sm max-w-md mx-auto my-2">{t('invoices.noInvoicesDescription')}</p>
                        <button
                            onClick={handleOpenNewModal}
                            type="button"
                            className="mt-4 px-4 py-2 bg-brand-accent text-white rounded-lg font-semibold hover:bg-opacity-80 transition duration-300 shadow-glow flex items-center justify-center gap-2 mx-auto"
                        >
                            <PlusIcon /> {t('invoices.addNewInvoice')}
                        </button>
                    </div>
                )}
            </div>
            <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
            <ManualInvoiceModal 
                isOpen={isManualModalOpen}
                onClose={handleCloseManualModal}
                onAddInvoice={addInvoice}
                onUpdateInvoice={updateInvoice}
                invoiceToEdit={invoiceToEdit}
            />
        </div>
    );
};

export default InvoiceList;
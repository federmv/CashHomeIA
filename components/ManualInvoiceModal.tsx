import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, InvoiceItem } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { toast } from 'react-hot-toast';

interface ManualInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
    onUpdateInvoice: (id: string, invoice: Omit<Invoice, 'id'>) => Promise<void>;
    invoiceToEdit: Invoice | null;
}

const emptyItem: InvoiceItem = { description: '', quantity: 1, unitPrice: 0, total: 0 };

const ManualInvoiceModal: React.FC<ManualInvoiceModalProps> = ({ isOpen, onClose, onAddInvoice, onUpdateInvoice, invoiceToEdit }) => {
    const { t, i18n } = useTranslation();
    const isEditMode = !!invoiceToEdit;
    
    const EXPENSE_CATEGORIES = useMemo(() => [
        t('expenseCategories.software'), t('expenseCategories.utilities'), t('expenseCategories.office'),
        t('expenseCategories.marketing'), t('expenseCategories.travel'), t('expenseCategories.meals'),
        t('expenseCategories.services'), t('expenseCategories.rent'), t('expenseCategories.payroll'),
        t('expenseCategories.inventory'), t('expenseCategories.other')
    ], [t]);

    const [provider, setProvider] = useState('');
    const [date, setDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }]);
    const [tax, setTax] = useState(0);
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [isSaving, setIsSaving] = useState(false);

    const formatCurrency = useMemo(() => (num: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    }, [i18n.language]);

    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }, [items]);

    const total = useMemo(() => subtotal + tax, [subtotal, tax]);

    const resetForm = () => {
        setProvider('');
        setDate(new Date().toISOString().split('T')[0]);
        setItems([{ ...emptyItem }]);
        setTax(0);
        setCategory(EXPENSE_CATEGORIES[0]);
    };

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setProvider(invoiceToEdit.provider);
                setDate(invoiceToEdit.date);
                setItems(invoiceToEdit.items.length > 0 ? invoiceToEdit.items : [{...emptyItem}]);
                setTax(invoiceToEdit.tax);
                setCategory(invoiceToEdit.category || EXPENSE_CATEGORIES[0]);
            } else {
                resetForm();
            }
        }
    }, [isOpen, isEditMode, invoiceToEdit, EXPENSE_CATEGORIES]);

    const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'total'>, value: string | number) => {
        const newItems = [...items];
        const itemToUpdate = { ...newItems[index] };
        
        if (field === 'description') {
            itemToUpdate.description = String(value);
        } else {
            const numValue = parseFloat(String(value));
            if (!isNaN(numValue) && numValue >= 0) {
                 if (field === 'quantity') itemToUpdate.quantity = numValue;
                 if (field === 'unitPrice') itemToUpdate.unitPrice = numValue;
            }
        }

        itemToUpdate.total = itemToUpdate.quantity * itemToUpdate.unitPrice;
        newItems[index] = itemToUpdate;
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, { ...emptyItem }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!provider.trim() || items.some(item => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
            toast.error(t('notifications.fillProviderAndItems'));
            return;
        }

        setIsSaving(true);
        const invoiceData: Omit<Invoice, 'id'> = {
            provider,
            date,
            amount: subtotal,
            tax,
            total,
            items: items.map(item => ({...item, total: item.quantity * item.unitPrice})),
            fileName: invoiceToEdit?.fileName || 'Manual Entry',
            category,
        };

        try {
            if (isEditMode) {
                await onUpdateInvoice(invoiceToEdit.id, invoiceData);
            } else {
                await onAddInvoice(invoiceData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save invoice:", error);
        } finally {
            setIsSaving(false);
        }
    };

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

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-brand-secondary w-full max-w-3xl rounded-2xl border border-brand-accent/30 shadow-glow relative max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 flex justify-between items-center border-b border-brand-primary flex-shrink-0">
                        <h2 className="text-2xl font-bold text-white">{isEditMode ? t('modals.editInvoice') : t('modals.newInvoice')}</h2>
                        <button 
                            type="button"
                            onClick={onClose}
                            className="text-brand-text-secondary hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                            aria-label={t('modals.close')}
                        >
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </header>
                    
                    <main className="p-6 overflow-y-auto space-y-6 flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="provider" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('modals.provider')}</label>
                                <input type="text" id="provider" value={provider} onChange={e => setProvider(e.target.value)} required className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition" />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('modals.date')}</label>
                                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition" style={{ colorScheme: 'dark' }} />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="category" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('modals.category')}</label>
                             <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white focus:ring-brand-accent focus:border-brand-accent transition">
                                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                             </select>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">{t('modals.items')}</h3>
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <input type="text" placeholder={t('modals.itemDescription')} value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} required className="col-span-12 sm:col-span-5 bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-3 py-2 text-sm text-white" />
                                        <input type="number" placeholder={t('modals.itemQty')} value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} required min="0" step="any" className="col-span-4 sm:col-span-2 bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-3 py-2 text-sm text-right text-white" />
                                        <input type="number" placeholder={t('modals.itemUnitPrice')} value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} required min="0" step="any" className="col-span-4 sm:col-span-2 bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-3 py-2 text-sm text-right text-white" />
                                        <p className="col-span-3 sm:col-span-2 text-right font-mono text-sm pr-2 text-white">{formatCurrency(item.quantity * item.unitPrice)}</p>
                                        <button type="button" onClick={() => handleRemoveItem(index)} disabled={items.length <= 1} className="col-span-1 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"><TrashIcon /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={handleAddItem} className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-opacity-80 transition">
                               <PlusIcon /> {t('modals.addItem')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 items-end pt-4 border-t border-brand-primary">
                            <div className="md:col-start-2 space-y-2">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-brand-text-secondary">{t('modals.subtotal')}:</span>
                                    <span className="text-white font-mono">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg">
                                    <label htmlFor="tax" className="text-brand-text-secondary">{t('modals.tax')}:</label>
                                    <input type="number" id="tax" value={tax} onChange={e => setTax(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)} required min="0" step="any" className="w-28 bg-brand-primary border border-brand-text-secondary/50 rounded-lg py-1 px-2 text-white font-mono text-right" />
                                </div>
                                <div className="flex justify-between items-center text-2xl font-bold mt-2 pt-2 border-t border-brand-text-secondary/20">
                                    <span className="text-white">{t('modals.total')}:</span>
                                    <span className="text-brand-accent">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer className="p-6 border-t border-brand-primary flex justify-end flex-shrink-0">
                        <button
                            type="submit"
                            className="px-6 py-2 w-36 bg-brand-accent text-white rounded-lg font-semibold hover:bg-opacity-80 transition duration-300 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                            disabled={isSaving || !provider.trim() || items.some(i => !i.description.trim())}
                        >
                            {isSaving ? <SpinnerIcon /> : t('modals.saveInvoice')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ManualInvoiceModal;
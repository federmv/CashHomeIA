import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface InvoiceDetailModalProps {
    invoice: Invoice | null;
    onClose: () => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
    const { t, i18n } = useTranslation();

    const formatCurrency = useMemo(() => (num: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    }, [i18n.language]);

     const formatDate = useMemo(() => (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }, [i18n.language]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!invoice) return null;

    const animationStyle = `
        @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
        }
    `;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <style>{animationStyle}</style>
            <div 
                className="bg-brand-secondary w-full max-w-2xl p-6 rounded-2xl border border-brand-accent/30 shadow-glow relative animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-brand-text-secondary hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                    aria-label={t('modals.close')}
                >
                    <CloseIcon className="h-6 w-6" />
                </button>

                <div className="pr-8">
                    <h2 className="text-2xl font-bold text-white mb-1">{t('modals.invoiceDetailTitle', { provider: invoice.provider })}</h2>
                    <p className="text-sm text-brand-text-secondary font-mono break-all" title={invoice.fileName}>{invoice.fileName}</p>
                </div>
                
                <div className="mt-6 space-y-3 text-brand-text-secondary">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{t('modals.invoiceDate')}</span>
                        <span className="text-white font-medium">{formatDate(invoice.date)}</span>
                    </div>
                    {invoice.isRecurring && invoice.recurringStartDate && (
                        <div className="flex justify-between items-center bg-brand-primary/50 p-2 rounded-md">
                            <span className="font-semibold">{t('modals.recurringInfoTitle')}</span>
                            <span className="text-white font-medium text-right">
                                {t('modals.recurringInfoText', { 
                                    frequency: t(`modals.${invoice.recurringFrequency}`), 
                                    date: formatDate(invoice.recurringStartDate) 
                                })}
                            </span>
                        </div>
                    )}
                </div>

                <hr className="border-brand-primary my-4" />

                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">{t('modals.items')}</h3>
                    <div className="overflow-x-auto max-h-60 pr-2">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-brand-secondary">
                                <tr>
                                    <th className="p-2 text-sm font-semibold text-brand-text-secondary">{t('modals.itemDescription')}</th>
                                    <th className="p-2 text-sm font-semibold text-brand-text-secondary text-center">{t('modals.itemQty')}</th>
                                    <th className="p-2 text-sm font-semibold text-brand-text-secondary text-right">{t('modals.itemUnitPrice')}</th>
                                    <th className="p-2 text-sm font-semibold text-brand-text-secondary text-right">{t('modals.itemTotal')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-primary">
                                {invoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-2 text-white">{item.description}</td>
                                        <td className="p-2 text-brand-text-secondary text-center">{item.quantity}</td>
                                        <td className="p-2 text-brand-text-secondary font-mono text-right">{formatCurrency(item.unitPrice)}</td>
                                        <td className="p-2 text-white font-mono text-right">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {invoice.items.length === 0 && (
                            <p className="text-center py-4 text-brand-text-secondary text-sm">{t('modals.noItems')}</p>
                        )}
                    </div>
                </div>

                <hr className="border-brand-primary my-4" />
                
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span>{t('modals.subtotal')}:</span>
                        <span className="text-white font-mono text-lg">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>{t('modals.tax')}:</span>
                        <span className="text-white font-mono text-lg">{formatCurrency(invoice.tax)}</span>
                    </div>

                    <div className="!mt-4 bg-brand-primary p-4 rounded-lg flex justify-between items-center">
                        <span className="text-xl font-bold">{t('modals.total')}:</span>
                        <span className="text-2xl font-bold text-brand-accent">{formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailModal;
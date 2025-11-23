
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { analyzeInvoice } from '../services/geminiService';
import { fileToBase64, getMimeType } from '../utils/fileUtils';
import { Invoice } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { toast } from 'react-hot-toast';
import { useData } from '../contexts/DataContext';
import ManualInvoiceModal from './ManualInvoiceModal';

const InvoiceUploader: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { addInvoice, expenseCategories } = useData();
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [parsedInvoice, setParsedInvoice] = useState<Invoice | null>(null);

    const handleFileProcessing = useCallback(async (file: File) => {
        if (!file) return;
        setIsLoading(true);
        setFileName(file.name);
        setLoadingMessage(t('invoices.analyzingStep1'));

        try {
            const base64Data = await fileToBase64(file);
            setLoadingMessage(t('invoices.analyzingStep2'));
            const mimeType = getMimeType(file.name);
            
            const parsedData = await analyzeInvoice(
                { mimeType, data: base64Data }, 
                t, 
                i18n.language,
                expenseCategories 
            );
            
            setLoadingMessage(t('invoices.analyzingStep3'));

            const tempInvoice: any = {
                ...parsedData,
                id: 'temp',
                fileName: file.name
            };
            
            setParsedInvoice(tempInvoice);
            setReviewModalOpen(true);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
            setFileName(null);
            setLoadingMessage('');
        }
    }, [addInvoice, t, i18n.language, expenseCategories]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcessing(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileProcessing(e.target.files[0]);
        }
    };

    const handleConfirmInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
        await addInvoice(invoiceData);
        setReviewModalOpen(false);
        setParsedInvoice(null);
    };

    return (
        <div className="bg-brand-surface backdrop-blur-md p-1 rounded-2xl border border-brand-border shadow-lg overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/10 via-purple-500/10 to-brand-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="bg-brand-secondary/80 rounded-xl p-8 relative z-10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-brand-accent/20 rounded-lg text-brand-accent">
                         <UploadIcon />
                    </div>
                    {t('invoices.uploadTitle')}
                </h2>
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 group-hover:border-brand-accent/50 ${
                        isDragging 
                        ? 'border-brand-accent bg-brand-accent/10 scale-[1.02]' 
                        : 'border-brand-text-secondary/30 hover:bg-white/5'
                    }`}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        disabled={isLoading}
                    />
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4 relative z-10 pointer-events-none">
                        {isLoading ? (
                            <div className="flex flex-col items-center animate-pulse">
                               <div className="mb-4 p-4 bg-brand-accent/10 rounded-full">
                                    <SpinnerIcon />
                               </div>
                               <p className="text-brand-accent font-bold text-lg">{loadingMessage}</p>
                               <p className="text-sm text-brand-text-secondary">{t('invoices.thisMayTakeAMoment')}</p>
                            </div>
                        ) : (
                            <>
                                <div className={`p-4 rounded-full transition-all duration-500 ${isDragging ? 'bg-brand-accent text-white shadow-glow' : 'bg-brand-surface text-brand-text-secondary'}`}>
                                     <UploadIcon />
                                </div>
                                <div>
                                    <p className="text-lg text-white font-medium mb-1">
                                        {t('invoices.uploadCta')}
                                    </p>
                                    <p className="text-sm text-brand-text-secondary">
                                        {t('invoices.uploadOr')}
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {['PDF', 'JPG', 'PNG', 'XLS'].map(ext => (
                                        <span key={ext} className="text-[10px] font-bold bg-white/5 text-brand-text-secondary px-2 py-1 rounded border border-white/5">{ext}</span>
                                    ))}
                                </div>
                            </>
                        )}
                    </label>
                </div>
            </div>

            {reviewModalOpen && parsedInvoice && (
                <ManualInvoiceModal 
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    onAddInvoice={handleConfirmInvoice}
                    onUpdateInvoice={async () => {}} 
                    invoiceToEdit={parsedInvoice} 
                />
            )}
        </div>
    );
};

export default InvoiceUploader;

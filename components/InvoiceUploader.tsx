
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { analyzeInvoice } from '../services/geminiService';
import { fileToBase64, getMimeType } from '../utils/fileUtils';
import { Invoice } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { toast } from 'react-hot-toast';
import { useData } from '../contexts/DataContext';

const InvoiceUploader: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { addInvoice } = useData();
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileProcessing = useCallback(async (file: File) => {
        if (!file) return;
        setIsLoading(true);
        setFileName(file.name);

        try {
            const base64Data = await fileToBase64(file);
            const mimeType = getMimeType(file.name);
            const parsedData = await analyzeInvoice({ mimeType, data: base64Data }, t, i18n.language);

            await addInvoice({
                ...parsedData,
                fileName: file.name,
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
            setFileName(null);
        }
    }, [addInvoice, t, i18n.language]);

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

    return (
        <div className="bg-brand-secondary p-6 rounded-xl border border-brand-accent/20">
            <h2 className="text-xl font-bold text-white mb-4">{t('invoices.uploadTitle')}</h2>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 ${
                    isDragging ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-text-secondary/50'
                }`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    disabled={isLoading}
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4">
                    {isLoading ? (
                        <>
                           <SpinnerIcon />
                           <p className="text-brand-text-secondary">{t('invoices.analyzingFile', { fileName })}</p>
                           <p className="text-sm text-brand-text-secondary/70">{t('invoices.thisMayTakeAMoment')}</p>
                        </>
                    ) : (
                        <>
                            <UploadIcon />
                            <p className="text-brand-text-secondary">
                                <span className="font-semibold text-brand-accent">{t('invoices.uploadCta')}</span> {t('invoices.uploadOr')}
                            </p>
                            <p className="text-xs text-brand-text-secondary/70">{t('invoices.uploadHint')}</p>
                        </>
                    )}
                </label>
            </div>
        </div>
    );
};

export default InvoiceUploader;
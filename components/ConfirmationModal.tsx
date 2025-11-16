import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { WarningIcon } from './icons/WarningIcon';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
    const { t } = useTranslation();

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isDeleting) {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose, isDeleting]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={isDeleting ? undefined : onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-brand-secondary w-full max-w-md p-6 rounded-2xl border border-red-500/30 shadow-lg relative animate-fade-in-down"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
                        <WarningIcon />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-bold text-white" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-brand-text-secondary">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-wait"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <SpinnerIcon /> : t('modals.confirmation.confirm')}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-brand-text-secondary/50 shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        {t('modals.confirmation.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

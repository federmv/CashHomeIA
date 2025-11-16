
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Invoice, Income, View } from '../types';
import * as firestoreService from '../services/firestoreService';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface DataContextType {
    invoices: Invoice[];
    income: Income[];
    addInvoice: (newInvoice: Omit<Invoice, 'id'>) => Promise<void>;
    updateInvoice: (id: string, updatedInvoice: Omit<Invoice, 'id'>) => Promise<void>;
    deleteInvoice: (id: string) => Promise<void>;
    addIncome: (newIncome: Omit<Income, 'id'>) => Promise<void>;
    updateIncome: (id: string, updatedIncome: Omit<Income, 'id'>) => Promise<void>;
    deleteIncome: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode; onViewChange: (view: View) => void }> = ({ children, onViewChange }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [income, setIncome] = useState<Income[]>([]);

    useEffect(() => {
        if (user) {
            const unsubscribeInvoices = firestoreService.getInvoices(user.uid, setInvoices);
            const unsubscribeIncome = firestoreService.getIncome(user.uid, setIncome);
            return () => {
                unsubscribeInvoices();
                unsubscribeIncome();
            };
        } else {
            setInvoices([]);
            setIncome([]);
        }
    }, [user]);

    const addInvoice = useCallback(async (newInvoice: Omit<Invoice, 'id'>) => {
        if (!user) throw new Error("User not authenticated");
        await toast.promise(
            firestoreService.addInvoice(user.uid, newInvoice),
            {
                loading: t('notifications.savingInvoice'),
                success: t('notifications.invoiceSaved'),
                error: t('notifications.invoiceSaveError'),
            }
        );
        onViewChange(View.INVOICES);
    }, [user, t, onViewChange]);

    const updateInvoice = useCallback(async (id: string, updatedInvoice: Omit<Invoice, 'id'>) => {
        if (!user) throw new Error("User not authenticated");
        await toast.promise(
            firestoreService.updateInvoice(user.uid, id, updatedInvoice),
            {
                loading: t('notifications.updatingInvoice'),
                success: t('notifications.invoiceUpdated'),
                error: t('notifications.invoiceUpdateError'),
            }
        );
    }, [user, t]);

    const deleteInvoice = useCallback(async (id: string) => {
        if (!user) throw new Error("User not authenticated");
         toast.promise(
            firestoreService.deleteInvoice(user.uid, id),
            {
                loading: t('notifications.deletingInvoice'),
                success: t('notifications.invoiceDeleted'),
                error: t('notifications.invoiceDeleteError'),
            }
        );
    }, [user, t]);

    const addIncome = useCallback(async (newIncome: Omit<Income, 'id'>) => {
        if (!user) throw new Error("User not authenticated");
        await toast.promise(
            firestoreService.addIncome(user.uid, newIncome),
            {
                loading: t('notifications.savingIncome'),
                success: t('notifications.incomeSaved'),
                error: t('notifications.incomeSaveError'),
            }
        );
        onViewChange(View.INCOME);
    }, [user, t, onViewChange]);

     const updateIncome = useCallback(async (id: string, updatedIncome: Omit<Income, 'id'>) => {
        if (!user) throw new Error("User not authenticated");
        await toast.promise(
            firestoreService.updateIncome(user.uid, id, updatedIncome),
            {
                loading: t('notifications.updatingIncome'),
                success: t('notifications.incomeUpdated'),
                error: t('notifications.incomeUpdateError'),
            }
        );
    }, [user, t]);

    const deleteIncome = useCallback(async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        await toast.promise(
            firestoreService.deleteIncome(user.uid, id),
            {
                loading: t('notifications.deletingIncome'),
                success: t('notifications.incomeDeleted'),
                error: t('notifications.incomeDeleteError'),
            }
        );
    }, [user, t]);

    const value = {
        invoices,
        income,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addIncome,
        updateIncome,
        deleteIncome,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};


import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Invoice, Income, View } from '../types';
import * as firestoreService from '../services/firestoreService';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface DataContextType {
    invoices: Invoice[];
    income: Income[];
    exportData: () => void;
    
    // Categories
    expenseCategories: string[];
    incomeCategories: string[];
    customExpenseCategories: string[];
    customIncomeCategories: string[];
    addCustomCategory: (type: 'expense' | 'income', category: string) => Promise<void>;
    removeCustomCategory: (type: 'expense' | 'income', category: string) => Promise<void>;

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

    // Custom Categories State
    const [customExpenseCategories, setCustomExpenseCategories] = useState<string[]>([]);
    const [customIncomeCategories, setCustomIncomeCategories] = useState<string[]>([]);

    // Default Categories (Memoized to prevent re-renders on every translation check)
    const defaultExpenseCategories = useMemo(() => [
        t('expenseCategories.software'), t('expenseCategories.utilities'), t('expenseCategories.office'),
        t('expenseCategories.marketing'), t('expenseCategories.travel'), t('expenseCategories.meals'),
        t('expenseCategories.services'), t('expenseCategories.rent'), t('expenseCategories.payroll'),
        t('expenseCategories.inventory'), t('expenseCategories.other')
    ], [t]);

    const defaultIncomeCategories = useMemo(() => [
        t('incomeCategories.salary'), t('incomeCategories.sales'), t('incomeCategories.freelance'),
        t('incomeCategories.investment'), t('incomeCategories.rental'), t('incomeCategories.other')
    ], [t]);

    // Combined Categories
    const expenseCategories = useMemo(() => [...customExpenseCategories, ...defaultExpenseCategories], [customExpenseCategories, defaultExpenseCategories]);
    const incomeCategories = useMemo(() => [...customIncomeCategories, ...defaultIncomeCategories], [customIncomeCategories, defaultIncomeCategories]);

    useEffect(() => {
        if (user) {
            const unsubscribeInvoices = firestoreService.getInvoices(user.uid, setInvoices);
            const unsubscribeIncome = firestoreService.getIncome(user.uid, setIncome);
            
            // Load settings
            firestoreService.getUserSettings(user.uid).then(settings => {
                if (settings.customExpenseCategories) setCustomExpenseCategories(settings.customExpenseCategories);
                if (settings.customIncomeCategories) setCustomIncomeCategories(settings.customIncomeCategories);
            });

            // Process recurring invoices on load
            firestoreService.processRecurringInvoices(user.uid).then(count => {
                if (count > 0) {
                    toast.success(t('notifications.recurringProcessed', { count }));
                }
            });

            return () => {
                unsubscribeInvoices();
                unsubscribeIncome();
            };
        } else {
            setInvoices([]);
            setIncome([]);
            setCustomExpenseCategories([]);
            setCustomIncomeCategories([]);
        }
    }, [user, t]);

    // Category Management Functions
    const addCustomCategory = useCallback(async (type: 'expense' | 'income', category: string) => {
        if (!user) return;
        const newCategory = category.trim();
        if (!newCategory) return;

        // Check if already exists in defaults or custom
        const existing = type === 'expense' ? expenseCategories : incomeCategories;
        if (existing.some(c => c.toLowerCase() === newCategory.toLowerCase())) {
            toast.error(t('settings.categoryExists'));
            return;
        }

        let updatedList: string[];
        if (type === 'expense') {
            updatedList = [...customExpenseCategories, newCategory];
            setCustomExpenseCategories(updatedList);
            await firestoreService.updateUserSettings(user.uid, { customExpenseCategories: updatedList });
        } else {
            updatedList = [...customIncomeCategories, newCategory];
            setCustomIncomeCategories(updatedList);
            await firestoreService.updateUserSettings(user.uid, { customIncomeCategories: updatedList });
        }
        toast.success(t('settings.categoryAdded'));
    }, [user, customExpenseCategories, customIncomeCategories, expenseCategories, incomeCategories, t]);

    const removeCustomCategory = useCallback(async (type: 'expense' | 'income', category: string) => {
        if (!user) return;

        let updatedList: string[];
        if (type === 'expense') {
            updatedList = customExpenseCategories.filter(c => c !== category);
            setCustomExpenseCategories(updatedList);
            await firestoreService.updateUserSettings(user.uid, { customExpenseCategories: updatedList });
        } else {
            updatedList = customIncomeCategories.filter(c => c !== category);
            setCustomIncomeCategories(updatedList);
            await firestoreService.updateUserSettings(user.uid, { customIncomeCategories: updatedList });
        }
        toast.success(t('settings.categoryRemoved'));
    }, [user, customExpenseCategories, customIncomeCategories, t]);


    // CRUD Operations
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

    const exportData = useCallback(() => {
        const csvContent = [
            ['Type', 'Date', 'Provider/Source', 'Category', 'Amount', 'Tax', 'Total', 'Description'],
            ...invoices.map(inv => ['Invoice', inv.date, `"${inv.provider}"`, `"${inv.category}"`, inv.amount, inv.tax, inv.total, '']),
            ...income.map(inc => ['Income', inc.date, `"${inc.source}"`, `"${inc.category}"`, inc.amount, 0, inc.amount, `"${inc.description}"`])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `financial_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data exported successfully!');
    }, [invoices, income]);

    const value = {
        invoices,
        income,
        expenseCategories,
        incomeCategories,
        customExpenseCategories,
        customIncomeCategories,
        addCustomCategory,
        removeCustomCategory,
        exportData,
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

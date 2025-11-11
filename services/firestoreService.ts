import { 
    getFirestore, 
    collection, 
    addDoc, 
    deleteDoc, 
    doc,
    onSnapshot,
    query,
    orderBy,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Invoice, Income } from '../types';

// === INVOICE FUNCTIONS ===

export const getInvoices = (userId: string, callback: (invoices: Invoice[]) => void): (() => void) => {
    const invoicesCol = collection(db, 'users', userId, 'invoices');
    const q = query(invoicesCol, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
        const invoices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Invoice));
        callback(invoices);
    });
};

export const addInvoice = (userId: string, invoice: Omit<Invoice, 'id'>): Promise<void> => {
    const invoicesCol = collection(db, 'users', userId, 'invoices');
    return addDoc(invoicesCol, invoice).then(() => {});
};

export const updateInvoice = (userId: string, invoiceId: string, invoiceData: Omit<Invoice, 'id'>): Promise<void> => {
    const invoiceDoc = doc(db, 'users', userId, 'invoices', invoiceId);
    return updateDoc(invoiceDoc, invoiceData);
};

export const deleteInvoice = (userId: string, invoiceId: string): Promise<void> => {
    const invoiceDoc = doc(db, 'users', userId, 'invoices', invoiceId);
    return deleteDoc(invoiceDoc);
};

// === INCOME FUNCTIONS ===

export const getIncome = (userId: string, callback: (income: Income[]) => void): (() => void) => {
    const incomeCol = collection(db, 'users', userId, 'income');
    const q = query(incomeCol, orderBy('date', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const income = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Income));
        callback(income);
    });
};

export const addIncome = (userId: string, income: Omit<Income, 'id'>): Promise<void> => {
    const incomeCol = collection(db, 'users', userId, 'income');
    return addDoc(incomeCol, income).then(() => {});
};

export const updateIncome = (userId: string, incomeId: string, incomeData: Omit<Income, 'id'>): Promise<void> => {
    const incomeDoc = doc(db, 'users', userId, 'income', incomeId);
    return updateDoc(incomeDoc, incomeData);
};

export const deleteIncome = (userId: string, incomeId: string): Promise<void> => {
    const incomeDoc = doc(db, 'users', userId, 'income', incomeId);
    return deleteDoc(incomeDoc);
};
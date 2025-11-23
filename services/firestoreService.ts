
import { 
    getFirestore, 
    collection, 
    addDoc, 
    deleteDoc, 
    doc,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    getDocs,
    where,
    writeBatch,
    setDoc,
    getDoc,
    limit,
    startAfter,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Invoice, Income, UserSettings } from '../types';

// === INVOICE FUNCTIONS ===

// Modified for Pagination
export const getPaginatedInvoices = async (
    userId: string, 
    lastVisible: QueryDocumentSnapshot<DocumentData> | null, 
    pageSize: number = 20
): Promise<{ invoices: Invoice[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
    const invoicesCol = collection(db, 'users', userId, 'invoices');
    
    let q = query(invoicesCol, orderBy('date', 'desc'), limit(pageSize));
    
    if (lastVisible) {
        q = query(q, startAfter(lastVisible));
    }
    
    const snapshot = await getDocs(q);
    const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Invoice));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { invoices, lastDoc };
};

export const addInvoice = (userId: string, invoice: Omit<Invoice, 'id'>): Promise<string> => {
    const invoicesCol = collection(db, 'users', userId, 'invoices');
    return addDoc(invoicesCol, invoice).then(docRef => docRef.id);
};

export const updateInvoice = (userId: string, invoiceId: string, invoiceData: Omit<Invoice, 'id'>): Promise<void> => {
    const invoiceDoc = doc(db, 'users', userId, 'invoices', invoiceId);
    return updateDoc(invoiceDoc, invoiceData);
};

export const deleteInvoice = (userId: string, invoiceId: string): Promise<void> => {
    const invoiceDoc = doc(db, 'users', userId, 'invoices', invoiceId);
    return deleteDoc(invoiceDoc);
};

// === RECURRING INVOICE LOGIC ===

export const processRecurringInvoices = async (userId: string): Promise<number> => {
    const invoicesCol = collection(db, 'users', userId, 'invoices');
    const q = query(invoicesCol, where('isRecurring', '==', true));
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    let processedCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    snapshot.docs.forEach(docSnap => {
        const invoice = docSnap.data() as Invoice;
        // If it doesn't have a start date, skip
        if (!invoice.recurringStartDate) return;

        // Determine the date to calculate from. 
        // If lastProcessedDate exists, use it. Otherwise use the recurringStartDate (or invoice date as fallback)
        const lastDateStr = invoice.lastProcessedDate || invoice.recurringStartDate || invoice.date;
        const lastDate = new Date(lastDateStr);
        lastDate.setHours(0, 0, 0, 0);
        
        let nextDate = new Date(lastDate);

        // Calculate next occurrence
        if (invoice.recurringFrequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (invoice.recurringFrequency === 'yearly') {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        // If the next date is today or has passed, generate the new invoice
        if (nextDate <= today) {
            const newInvoiceRef = doc(invoicesCol); // Auto-generated ID
            const nextDateStr = nextDate.toISOString().split('T')[0];

            // Create new invoice data (copy of original but with new date)
            const newInvoiceData = {
                ...invoice,
                date: nextDateStr,
                fileName: 'Auto-generated (Recurring)',
                // New invoice is NOT recurring (to prevent infinite cloning loops from the children)
                isRecurring: false, 
                recurringFrequency: undefined,
                recurringStartDate: undefined,
                lastProcessedDate: undefined
            };
            
            // Ensure ID is not copied into the data field if it existed there
            delete (newInvoiceData as any).id;

            batch.set(newInvoiceRef, newInvoiceData);

            // Update the "mother" invoice with the lastProcessedDate
            const originalInvoiceRef = doc(db, 'users', userId, 'invoices', docSnap.id);
            batch.update(originalInvoiceRef, { lastProcessedDate: nextDateStr });

            processedCount++;
        }
    });

    if (processedCount > 0) {
        await batch.commit();
    }
    
    return processedCount;
};

// === INCOME FUNCTIONS ===

// Modified for Pagination
export const getPaginatedIncome = async (
    userId: string, 
    lastVisible: QueryDocumentSnapshot<DocumentData> | null, 
    pageSize: number = 20
): Promise<{ income: Income[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
    const incomeCol = collection(db, 'users', userId, 'income');
    let q = query(incomeCol, orderBy('date', 'desc'), limit(pageSize));
    
    if (lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    const income = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Income));
    
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { income, lastDoc };
};

export const addIncome = (userId: string, income: Omit<Income, 'id'>): Promise<string> => {
    const incomeCol = collection(db, 'users', userId, 'income');
    return addDoc(incomeCol, income).then(docRef => docRef.id);
};

export const updateIncome = (userId: string, incomeId: string, incomeData: Omit<Income, 'id'>): Promise<void> => {
    const incomeDoc = doc(db, 'users', userId, 'income', incomeId);
    return updateDoc(incomeDoc, incomeData);
};

export const deleteIncome = (userId: string, incomeId: string): Promise<void> => {
    const incomeDoc = doc(db, 'users', userId, 'income', incomeId);
    return deleteDoc(incomeDoc);
};

// === SETTINGS FUNCTIONS ===

export const getUserSettings = async (userId: string): Promise<UserSettings> => {
    const settingsDoc = doc(db, 'users', userId, 'settings', 'general');
    const snap = await getDoc(settingsDoc);
    if (snap.exists()) {
        return snap.data() as UserSettings;
    }
    return {};
};

export const updateUserSettings = async (userId: string, settings: UserSettings): Promise<void> => {
    const settingsDoc = doc(db, 'users', userId, 'settings', 'general');
    // Use set with merge to create if not exists or update if exists
    return setDoc(settingsDoc, settings, { merge: true });
};

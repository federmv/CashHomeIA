import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from './firebaseConfig';
import * as firestoreService from './services/firestoreService';
import { Toaster, toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Invoice, View, Income } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import IncomeList from './components/IncomeList';
import InvoiceUploader from './components/InvoiceUploader';
import ChatAssistant from './components/ChatAssistant';
import Login from './components/Login';
import FullScreenLoader from './components/FullScreenLoader';

const auth = getAuth(app);

function App() {
    const { t } = useTranslation();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

    // For swipe navigation
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const [animationClass, setAnimationClass] = useState('');
    const viewOrder = [View.DASHBOARD, View.INVOICES, View.INCOME];
    const minSwipeDistance = 50;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
        setCurrentView(View.INVOICES);
    }, [user, t]);

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
        setCurrentView(View.INCOME);
    }, [user, t]);

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

    // Swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = 0;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === 0 || touchEndX.current === 0) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = viewOrder.indexOf(currentView);
            if (isLeftSwipe) { // Swiped left, go to next view
                const nextIndex = (currentIndex + 1) % viewOrder.length;
                setCurrentView(viewOrder[nextIndex]);
                setAnimationClass('animate-slide-in-right');
            } else { // Swiped right, go to previous view
                const prevIndex = (currentIndex - 1 + viewOrder.length) % viewOrder.length;
                setCurrentView(viewOrder[prevIndex]);
                setAnimationClass('animate-slide-in-left');
            }
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    useEffect(() => {
        if (animationClass) {
            const timer = setTimeout(() => setAnimationClass(''), 400); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [animationClass]);

    const handleHeaderNavigation = (view: View) => {
        if (view !== currentView) {
            setAnimationClass('');
            setCurrentView(view);
        }
    };

    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (!user) {
        return <Login />;
    }

    return (
        <div className="min-h-screen bg-brand-primary font-sans overflow-hidden">
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: '#1E1E3F',
                    color: '#FFFFFF',
                    border: '1px solid #3E7BFA',
                },
            }} />
            <Header
                user={user}
                currentView={currentView}
                setCurrentView={handleHeaderNavigation}
            />
            <main
                className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto ${animationClass}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {currentView === View.DASHBOARD && <Dashboard invoices={invoices} income={income} />}
                {currentView === View.INVOICES && (
                    <div className="space-y-8">
                        <InvoiceUploader onInvoiceUploaded={addInvoice} />
                        <InvoiceList 
                            invoices={invoices} 
                            deleteInvoice={deleteInvoice} 
                            addInvoice={addInvoice}
                            updateInvoice={updateInvoice}
                        />
                    </div>
                )}
                {currentView === View.INCOME && (
                    <IncomeList
                        income={income}
                        deleteIncome={deleteIncome}
                        addIncome={addIncome}
                        updateIncome={updateIncome}
                    />
                )}
            </main>
            <ChatAssistant invoices={invoices} income={income} />
        </div>
    );
}

export default App;
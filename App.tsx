
import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

import { View } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import IncomeList from './components/IncomeList';
import InvoiceUploader from './components/InvoiceUploader';
import ChatAssistant from './components/ChatAssistant';
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

function App() {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

    // For swipe navigation
    const touchStartPoint = useRef({ x: 0, y: 0 });
    const touchEndPoint = useRef({ x: 0, y: 0 });
    const [animationClass, setAnimationClass] = useState('');
    const viewOrder = [View.DASHBOARD, View.INVOICES, View.INCOME];
    const minSwipeDistance = 50;

    // Swipe handlers re-architected for robustness
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartPoint.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        touchEndPoint.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        // Update the end point continuously
        touchEndPoint.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        
        const distanceX = touchStartPoint.current.x - touchEndPoint.current.x;
        const distanceY = touchStartPoint.current.y - touchEndPoint.current.y;

        // If the swipe is primarily horizontal, prevent the browser's default vertical scroll.
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
            e.preventDefault();
        }
    };

    const handleTouchEnd = () => {
        const distanceX = touchStartPoint.current.x - touchEndPoint.current.x;
        const distanceY = touchStartPoint.current.y - touchEndPoint.current.y;

        // A valid swipe is longer than the minimum distance and primarily horizontal.
        if (Math.abs(distanceX) > minSwipeDistance && Math.abs(distanceX) > Math.abs(distanceY)) {
            const currentIndex = viewOrder.indexOf(currentView);
            
            if (distanceX > 0) { // Swiped left
                const nextIndex = (currentIndex + 1) % viewOrder.length;
                setCurrentView(viewOrder[nextIndex]);
                setAnimationClass('animate-slide-in-right');
            } else { // Swiped right
                const prevIndex = (currentIndex - 1 + viewOrder.length) % viewOrder.length;
                setCurrentView(viewOrder[prevIndex]);
                setAnimationClass('animate-slide-in-left');
            }
        }
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

    if (!user) {
        return <Login />;
    }

    return (
        <DataProvider onViewChange={setCurrentView}>
            <div className="min-h-screen bg-brand-primary font-sans overflow-hidden">
                <Toaster position="top-center" toastOptions={{
                    style: {
                        background: '#1E1E3F',
                        color: '#FFFFFF',
                        border: '1px solid #3E7BFA',
                    },
                }} />
                <Header
                    currentView={currentView}
                    setCurrentView={handleHeaderNavigation}
                />
                <main
                    className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto ${animationClass}`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {currentView === View.DASHBOARD && <Dashboard />}
                    {currentView === View.INVOICES && (
                        <div className="space-y-8">
                            <InvoiceUploader />
                            <InvoiceList />
                        </div>
                    )}
                    {currentView === View.INCOME && <IncomeList />}
                </main>
                <ChatAssistant />
            </div>
        </DataProvider>
    );
}

export default App;

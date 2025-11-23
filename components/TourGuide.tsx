import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface TourGuideProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

interface TourStep {
    targetId: string;
    translationKey: string;
    requiredView: View;
}

const steps: TourStep[] = [
    { targetId: 'header-logo', translationKey: 'tour.welcome', requiredView: View.DASHBOARD },
    { targetId: 'tour-new-invoice', translationKey: 'tour.newInvoice', requiredView: View.DASHBOARD },
    { targetId: 'tour-privacy', translationKey: 'tour.privacy', requiredView: View.DASHBOARD },
    { targetId: 'tour-chat', translationKey: 'tour.chat', requiredView: View.DASHBOARD },
];

const TourGuide: React.FC<TourGuideProps> = ({ currentView, setCurrentView }) => {
    const { t } = useTranslation();
    const [stepIndex, setStepIndex] = useState(-1);
    const [position, setPosition] = useState<{ top: number, left: number, width: number, height: number } | null>(null);

    useEffect(() => {
        const tourCompleted = localStorage.getItem('cashhome_tour_completed');
        if (!tourCompleted) {
            // Start tour after a short delay to allow animations to finish
            const timer = setTimeout(() => setStepIndex(0), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            const step = steps[stepIndex];

            // Force navigation if needed
            if (currentView !== step.requiredView) {
                setCurrentView(step.requiredView);
                // Give time for the view to render
                setTimeout(() => updatePosition(step.targetId), 500);
            } else {
                updatePosition(step.targetId);
            }
        }
    }, [stepIndex, currentView, setCurrentView]);

    const updatePosition = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            setPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
        } else {
            // Fallback center if element not found
            setPosition(null);
        }
    };

    // Update position on resize
    useEffect(() => {
        const handleResize = () => {
            if (stepIndex >= 0 && stepIndex < steps.length) {
                updatePosition(steps[stepIndex].targetId);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [stepIndex]);

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setStepIndex(-1);
        localStorage.setItem('cashhome_tour_completed', 'true');
    };

    if (stepIndex < 0) return null;

    const currentStep = steps[stepIndex];
    const isLastStep = stepIndex === steps.length - 1;

    return (
        <>
            {/* Dark Overlay */}
            <div className="fixed inset-0 bg-black/60 z-[60] transition-opacity duration-500" onClick={handleComplete}></div>

            {/* Spotlight Hole */}
            {position && (
                <div 
                    className="fixed z-[60] transition-all duration-500 ease-in-out pointer-events-none border-2 border-brand-accent rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] box-content"
                    style={{
                        top: position.top - 8,
                        left: position.left - 8,
                        width: position.width + 16,
                        height: position.height + 16,
                    }}
                />
            )}

            {/* Tooltip Card */}
            <div 
                className="fixed z-[70] transition-all duration-500"
                style={{
                    top: position ? Math.min(window.innerHeight - 200, Math.max(20, position.top + position.height + 24)) : '50%',
                    left: position ? Math.min(window.innerWidth - 320, Math.max(20, position.left)) : '50%',
                    transform: position ? 'none' : 'translate(-50%, -50%)'
                }}
            >
                <div className="bg-brand-secondary/95 backdrop-blur-xl border border-brand-accent/50 p-6 rounded-2xl shadow-2xl max-w-xs w-80 animate-fade-in-down">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-white">{t(`tour.stepTitle.${stepIndex + 1}`)}</h3>
                        <button onClick={handleComplete} className="text-brand-text-secondary hover:text-white">
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <p className="text-brand-text-secondary text-sm mb-6 leading-relaxed">
                        {t(currentStep.translationKey)}
                    </p>
                    <div className="flex justify-between items-center">
                         <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-brand-accent' : 'w-1.5 bg-brand-text-secondary/30'}`} />
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className="bg-brand-accent hover:bg-brand-accent-dark text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-glow"
                        >
                            {isLastStep ? t('tour.finish') : t('tour.next')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TourGuide;
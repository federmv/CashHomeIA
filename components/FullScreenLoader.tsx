import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

const FullScreenLoader: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-primary text-white">
            <SpinnerIcon />
            <p className="mt-4 text-brand-text-secondary">Loading your financial hub...</p>
        </div>
    );
};

export default FullScreenLoader;

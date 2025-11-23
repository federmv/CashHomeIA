
import React from 'react';

interface AppLogoProps {
    className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = "h-10 w-10" }) => (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="100" fill="#475569"/>
        <path d="M256 80L80 224V432H256" stroke="white" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M432 224L256 80" stroke="white" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M368 172V112H416V210" stroke="white" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="368" cy="368" r="110" fill="#475569"/>
        <circle cx="368" cy="368" r="100" stroke="white" strokeWidth="40"/>
        <path d="M368 308V428" stroke="white" strokeWidth="30" strokeLinecap="round"/>
        <path d="M340 338H380C400 338 400 358 380 358H356C336 358 336 378 356 378H396" stroke="white" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

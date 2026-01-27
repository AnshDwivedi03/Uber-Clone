import React from 'react';

export const Logo = ({ className = "w-16" }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FFD700" fontSize="70" fontWeight="bold" style={{ fontFamily: 'sans-serif' }}>
            Y
        </text>
        <circle cx="50" cy="50" r="45" stroke="#FFD700" strokeWidth="5" />
    </svg>
);

export const MotoIcon = ({ className = "w-12 h-12" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        {/* Placeholder for custom Moto Vector - can be replaced with RemixIcon later */}
        <text x="5" y="18" fontSize="10" fill="currentColor">Moto</text>
    </svg>
);

export const AutoIcon = ({ className = "w-12 h-12" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="15" fontSize="10" fill="currentColor">Auto</text>
    </svg>
);

export default { Logo, MotoIcon, AutoIcon };

import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {

    const baseStyle = "w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center";

    const variants = {
        primary: "bg-brand-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:shadow-[0_0_25px_rgba(204,255,0,0.6)]",
        secondary: "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700",
        danger: "bg-red-500 text-white hover:bg-red-600",
        outline: "bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;

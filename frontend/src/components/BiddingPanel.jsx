import React, { useState } from 'react';
import { Minus, Plus, Check, X } from 'lucide-react';
import Button from './ui/Button';

const BiddingPanel = ({ ride, userType, onAccept, onReject, onCounter }) => {
    const [bidAmount, setBidAmount] = useState(ride?.fare || 0);

    const adjustBid = (amount) => {
        setBidAmount(prev => Math.max(0, prev + amount));
    };

    return (
        <div className="bg-dark-card border-t border-zinc-800 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-slide-up">
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Negotiate Fare</h3>
                    <p className="text-zinc-500 text-sm">
                        {userType === 'captain' ? 'Offer your price' : 'Counter offer'}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-brand-primary">₹{bidAmount}</span>
                </div>
            </div>

            {/* Bidding Controls */}
            <div className="flex items-center justify-between bg-zinc-900 rounded-xl p-2 mb-8 border border-zinc-800">
                <button
                    onClick={() => adjustBid(-10)}
                    className="w-12 h-12 flex items-center justify-center rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition"
                >
                    <Minus size={20} />
                </button>

                <span className="text-zinc-400 font-mono text-sm">+/- 10 INR</span>

                <button
                    onClick={() => adjustBid(10)}
                    className="w-12 h-12 flex items-center justify-center rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" onClick={onReject}>
                    <X className="mr-2" size={18} /> Decline
                </Button>
                <Button
                    variant="primary"
                    onClick={() => userType === 'captain' ? onCounter(bidAmount) : onAccept(bidAmount)}
                >
                    <Check className="mr-2" size={18} /> {userType === 'captain' ? 'Send Offer' : 'Accept'}
                </Button>
            </div>
        </div>
    );
};

export default BiddingPanel;

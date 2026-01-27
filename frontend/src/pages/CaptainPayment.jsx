import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Wallet, TrendingUp, Download } from 'lucide-react'

const CaptainPayment = () => {
    return (
        <div className='h-screen bg-dark-bg text-white overflow-hidden flex flex-col'>
            <div className='p-4 py-6 border-b border-zinc-800 flex items-center gap-4'>
                <Link to='/captain-home' className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors'>
                    <ArrowLeft size={20} className="text-lime-400" />
                </Link>
                <h1 className='text-xl font-bold'>Earnings & Payouts</h1>
            </div>

            <div className='p-6'>
                {/* Balance Card */}
                <div className='bg-gradient-to-br from-black to-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-800 mb-8'>
                    <p className='font-bold text-zinc-400 mb-1'>Total Balance</p>
                    <h2 className='text-4xl font-black mb-4 text-white'>₹ 1,240.50</h2>
                    <button className='w-full bg-lime-500 text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-lime-400 transition-colors'>
                        <Wallet size={16} /> Withdraw
                    </button>
                </div>

                {/* Stats */}
                <div className='grid grid-cols-2 gap-4 mb-8'>
                    <div className='bg-zinc-900 p-4 rounded-xl border border-zinc-800'>
                        <p className='text-xs text-zinc-500 font-bold uppercase mb-1'>Today</p>
                        <p className='text-xl font-black text-lime-400'>₹ 540.00</p>
                    </div>
                    <div className='bg-zinc-900 p-4 rounded-xl border border-zinc-800'>
                        <p className='text-xs text-zinc-500 font-bold uppercase mb-1'>This Week</p>
                        <p className='text-xl font-black text-white'>₹ 3,250.00</p>
                    </div>
                </div>

                <div className='mb-6'>
                    <h3 className='font-bold text-lg mb-4 text-zinc-400'>Recent Payouts</h3>

                    <div className='flex flex-col gap-3'>
                        <div className='flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl'>
                            <div>
                                <p className='font-bold'>Weekly Payout</p>
                                <p className='text-xs text-zinc-500'>22 Jan, 2026</p>
                            </div>
                            <span className='font-bold text-white'>₹ 4,500.00</span>
                        </div>

                        <div className='flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl'>
                            <div>
                                <p className='font-bold'>Weekly Payout</p>
                                <p className='text-xs text-zinc-500'>15 Jan, 2026</p>
                            </div>
                            <span className='font-bold text-white'>₹ 5,120.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CaptainPayment

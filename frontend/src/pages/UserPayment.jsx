import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CreditCard, Wallet, Plus } from 'lucide-react'

const UserPayment = () => {
    return (
        <div className='h-screen bg-dark-bg text-white overflow-hidden flex flex-col'>
            <div className='p-4 py-6 border-b border-zinc-800 flex items-center gap-4'>
                <Link to='/home' className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors'>
                    <ArrowLeft size={20} className="text-lime-400" />
                </Link>
                <h1 className='text-xl font-bold'>Wallet & Payments</h1>
            </div>

            <div className='p-6'>
                {/* Balance Card */}
                <div className='bg-gradient-to-br from-lime-500 to-lime-600 p-6 rounded-2xl shadow-lg shadow-lime-500/20 mb-8 text-black'>
                    <p className='font-bold opacity-80 mb-1'>SKRRRT Cash</p>
                    <h2 className='text-4xl font-black mb-4'>₹ 420.00</h2>
                    <button className='bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2'>
                        <Plus size={16} /> Add Funds
                    </button>
                </div>

                <div className='mb-6'>
                    <h3 className='font-bold text-lg mb-4 text-zinc-400'>Payment Methods</h3>

                    <div className='flex flex-col gap-3'>
                        <div className='flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl'>
                            <div className='flex items-center gap-3'>
                                <CreditCard className="text-lime-400" />
                                <div>
                                    <p className='font-bold'>**** 4242</p>
                                    <p className='text-xs text-zinc-500'>Expires 12/28</p>
                                </div>
                            </div>
                            <span className='px-2 py-1 bg-lime-500/20 text-lime-400 text-xs font-bold rounded'>Default</span>
                        </div>

                        <div className='flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl opacity-60'>
                            <div className='flex items-center gap-3'>
                                <Wallet className="text-zinc-400" />
                                <div>
                                    <p className='font-bold'>UPI / Cash</p>
                                    <p className='text-xs text-zinc-500'>Pay on Ride</p>
                                </div>
                            </div>
                        </div>

                        <button className='flex items-center gap-3 bg-zinc-900/50 border border-dashed border-zinc-700 p-4 rounded-xl text-zinc-400 hover:text-white hover:border-lime-500 transition-colors'>
                            <Plus size={20} />
                            <span className='font-bold'>Add Payment Method</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserPayment

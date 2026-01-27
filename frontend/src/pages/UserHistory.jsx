import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'

const UserHistory = () => {
    // Mock Data
    const history = [
        {
            id: 1,
            date: 'Today, 10:23 AM',
            price: '₹142.50',
            pickup: '562/11-A, Jia Sarai',
            drop: 'Hauz Khas Metro Station',
            status: 'Completed'
        },
        {
            id: 2,
            date: 'Yesterday, 08:45 PM',
            price: '₹85.00',
            pickup: 'Select City Walk',
            drop: 'Malviya Nagar',
            status: 'Completed'
        }
    ]

    return (
        <div className='h-screen bg-dark-bg text-white overflow-hidden flex flex-col'>
            <div className='p-4 py-6 border-b border-zinc-800 flex items-center gap-4'>
                <Link to='/home' className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors'>
                    <ArrowLeft size={20} className="text-lime-400" />
                </Link>
                <h1 className='text-xl font-bold'>Past Rides</h1>
            </div>

            <div className='p-4 overflow-y-auto flex-1'>
                {history.map(ride => (
                    <div key={ride.id} className='mb-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl active:scale-95 transition-transform'>
                        <div className='flex justify-between items-center mb-4'>
                            <div className='flex items-center gap-2'>
                                <div className='bg-lime-500/20 p-1 rounded'>
                                    <Clock size={14} className="text-lime-400" />
                                </div>
                                <span className='text-xs font-medium text-zinc-400'>{ride.date}</span>
                            </div>
                            <span className='font-bold text-lg'>{ride.price}</span>
                        </div>

                        <div className='flex flex-col gap-4 relative pl-4 border-l border-zinc-800 ml-1'>
                            <div>
                                <h4 className='font-bold text-sm text-zinc-300'>Pickup</h4>
                                <p className='text-xs text-zinc-500 truncate'>{ride.pickup}</p>
                            </div>
                            <div>
                                <h4 className='font-bold text-sm text-zinc-300'>Drop-off</h4>
                                <p className='text-xs text-zinc-500 truncate'>{ride.drop}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UserHistory

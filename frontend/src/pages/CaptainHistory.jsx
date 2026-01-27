import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'

const CaptainHistory = () => {
    // Mock Data
    const history = [
        {
            id: 1,
            date: 'Today, 11:30 AM',
            earnings: '₹240.50',
            pickup: 'Cannaught Place',
            drop: 'Cyber Hub, Gurgaon',
            status: 'Completed'
        },
        {
            id: 2,
            date: 'Yesterday, 06:15 PM',
            earnings: '₹180.00',
            pickup: 'Vasant Kunj',
            drop: 'Saket Metro',
            status: 'Completed'
        },
        {
            id: 3,
            date: 'Yesterday, 04:00 PM',
            earnings: '₹95.00',
            pickup: 'JNU Main Gate',
            drop: 'Munirka',
            status: 'Completed'
        }
    ]

    return (
        <div className='h-screen bg-dark-bg text-white overflow-hidden flex flex-col'>
            <div className='p-4 py-6 border-b border-zinc-800 flex items-center gap-4'>
                <Link to='/captain-home' className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors'>
                    <ArrowLeft size={20} className="text-lime-400" />
                </Link>
                <h1 className='text-xl font-bold'>Ride History</h1>
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
                            <span className='font-bold text-lg text-lime-400'>{ride.earnings}</span>
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

export default CaptainHistory

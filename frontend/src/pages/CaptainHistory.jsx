import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import axios from 'axios'

const CaptainHistory = () => {
    const [history, setHistory] = useState([])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/captains/history`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then(response => {
            setHistory(response.data)
        }).catch(err => {
            console.error(err)
        })
    }, [])

    return (
        <div className='h-screen bg-dark-bg text-white overflow-hidden flex flex-col'>
            <div className='p-4 py-6 border-b border-zinc-800 flex items-center gap-4'>
                <Link to='/captain-home' className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors'>
                    <ArrowLeft size={20} className="text-lime-400" />
                </Link>
                <h1 className='text-xl font-bold'>Ride History</h1>
            </div>

            <div className='p-4 overflow-y-auto flex-1'>
                {history.length === 0 && <p className='text-center text-zinc-500 mt-10'>No ride history found</p>}
                {history.map(ride => (
                    <div key={ride._id} className='mb-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl active:scale-95 transition-transform'>
                        <div className='flex justify-between items-center mb-4'>
                            <div className='flex items-center gap-2'>
                                <div className='bg-lime-500/20 p-1 rounded'>
                                    <Clock size={14} className="text-lime-400" />
                                </div>
                                <span className='text-xs font-medium text-zinc-400'>{new Date(ride.createdAt).toLocaleString()}</span>
                            </div>
                            <span className='font-bold text-lg text-lime-400'>₹{ride.fare}</span>
                        </div>

                        <div className='flex flex-col gap-4 relative pl-4 border-l border-zinc-800 ml-1'>
                            <div>
                                <h4 className='font-bold text-sm text-zinc-300'>Pickup</h4>
                                <p className='text-xs text-zinc-500 truncate'>{ride.pickup}</p>
                            </div>
                            <div>
                                <h4 className='font-bold text-sm text-zinc-300'>Drop-off</h4>
                                <p className='text-xs text-zinc-500 truncate'>{ride.destination}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CaptainHistory

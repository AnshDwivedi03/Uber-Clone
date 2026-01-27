import React, { useContext } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Car, Shield, Star } from 'lucide-react'

const CaptainProfile = () => {
    const { captain } = useContext(CaptainDataContext)

    return (
        <div className='h-screen bg-dark-bg text-white overflow-hidden flex flex-col'>
            <div className='p-4 py-6 border-b border-zinc-800 flex items-center gap-4'>
                <Link to='/captain-home' className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors'>
                    <ArrowLeft size={20} className="text-lime-400" />
                </Link>
                <h1 className='text-xl font-bold'>Captain Profile</h1>
            </div>

            <div className='p-6 flex flex-col gap-6 overflow-y-auto'>
                {/* Avatar Section */}
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.3)]'>
                        <span className='text-4xl font-black text-lime-400 capitalize'>{captain?.fullname?.firstname[0]}</span>
                    </div>
                    <div>
                        <h2 className='text-2xl font-bold capitalize text-center'>{captain?.fullname?.firstname} {captain?.fullname?.lastname}</h2>
                        <div className='flex items-center justify-center gap-1 mt-1'>
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className='font-bold'>4.9</span>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className='bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4'>
                    <Mail className="text-lime-400" />
                    <div>
                        <p className='text-xs text-zinc-500 font-bold uppercase'>Email</p>
                        <p className='font-medium'>{captain?.email}</p>
                    </div>
                </div>

                <div className='bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4'>
                    <Car className="text-lime-400" />
                    <div>
                        <p className='text-xs text-zinc-500 font-bold uppercase'>Vehicle Details</p>
                        <p className='font-medium capitalize'>{captain?.vehicle?.color} {captain?.vehicle?.vehicleType} • {captain?.vehicle?.plate}</p>
                    </div>
                </div>

                <div className='bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4'>
                    <Shield className="text-lime-400" />
                    <div>
                        <p className='text-xs text-zinc-500 font-bold uppercase'>Status</p>
                        <p className='font-medium text-lime-400'>Pro Captain</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CaptainProfile

import React, { useContext } from 'react'
import { UserDataContext } from '../context/UserContext'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Shield } from 'lucide-react'

const UserProfile = () => {
    const { user } = useContext(UserDataContext)

    return (
        <div className='h-screen bg-dark-bg text-white overflow-hidden flex flex-col'>
            <div className='p-4 py-6 border-b border-zinc-800 flex items-center gap-4'>
                <Link to='/home' className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors'>
                    <ArrowLeft size={20} className="text-lime-400" />
                </Link>
                <h1 className='text-xl font-bold'>My Profile</h1>
            </div>

            <div className='p-6 flex flex-col gap-6 overflow-y-auto'>
                {/* Avatar Section */}
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.3)]'>
                        <span className='text-4xl font-black text-lime-400'>{user?.fullname?.firstname[0]}</span>
                    </div>
                    <h2 className='text-2xl font-bold capitalize'>{user?.fullname?.firstname} {user?.fullname?.lastname}</h2>
                </div>

                {/* Info Cards */}
                <div className='bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4'>
                    <Mail className="text-lime-400" />
                    <div>
                        <p className='text-xs text-zinc-500 font-bold uppercase'>Email</p>
                        <p className='font-medium'>{user?.email}</p>
                    </div>
                </div>

                <div className='bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4'>
                    <Phone className="text-lime-400" />
                    <div>
                        <p className='text-xs text-zinc-500 font-bold uppercase'>Phone</p>
                        <p className='font-medium'>+91 99999 99999</p>
                    </div>
                </div>

                <div className='bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4'>
                    <Shield className="text-lime-400" />
                    <div>
                        <p className='text-xs text-zinc-500 font-bold uppercase'>Account Status</p>
                        <p className='font-medium text-lime-400'>Verified Rider</p>
                    </div>
                </div>

                {/* Vibe Profile Display */}
                <div className='bg-zinc-900/50 p-4 rounded-xl border border-zinc-800'>
                    <p className='text-xs text-zinc-500 font-bold uppercase mb-3'>My Vibe</p>
                    <div className='flex gap-2 flex-wrap'>
                        <span className='px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold border border-zinc-700 text-lime-400'>Techno Lover</span>
                        <span className='px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold border border-zinc-700 text-lime-400'>Quiet Ride</span>
                        <span className='px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold border border-zinc-700 text-lime-400'>AC Max</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile

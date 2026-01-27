import React from 'react'
import { Link } from 'react-router-dom'
import LivingMap from '../components/LivingMap'

const Start = () => {
  return (
    <div className="relative z-10 h-screen flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-sm overflow-hidden text-white font-sans">
      <LivingMap active={true} />
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <div className="w-24 h-24 bg-lime-400 rounded-3xl rotate-3 flex items-center justify-center mb-8 shadow-2xl shadow-lime-400/40 transform hover:rotate-6 transition-transform duration-500">
          <span className="text-5xl font-black italic text-black -rotate-3">S</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-2 italic">SKRRRT.</h1>
        <p className="text-xl text-zinc-300 font-medium mb-12">Your Vibe. Your Ride.</p>

        <div className="w-full space-y-4">
          <Link to='/login' className="block w-full text-lg py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-[1.02]">
            I'm a Rider
          </Link>
          <Link to='/captain-login' className="block w-full text-lg py-4 border-2 border-zinc-600 text-zinc-200 font-bold rounded-2xl hover:bg-zinc-900 transition-all hover:border-zinc-500">
            I'm a Captain
          </Link>
        </div>
        <div className="mt-12 text-xs text-zinc-500 uppercase tracking-widest font-bold">
          Made for India 🇮🇳
        </div>
      </div>
    </div>
  )
}

export default Start
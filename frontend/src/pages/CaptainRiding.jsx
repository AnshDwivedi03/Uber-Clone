import React, { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import LivingMap from '../components/LivingMap'
import { LogOut, ChevronUp } from 'lucide-react'

const CaptainRiding = () => {

    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const finishRidePanelRef = useRef(null)
    const location = useLocation()
    const rideData = location.state?.ride

    useGSAP(function () {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [finishRidePanel])

    return (
        <div className='h-screen relative flex flex-col justify-end bg-dark-bg text-white overflow-hidden'>

            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-50 pointer-events-none'>
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center font-black italic text-xl text-black">S</div>
                    <span className="font-bold text-xl tracking-tighter text-white drop-shadow-md">SKRRRT</span>
                </div>
                <Link to='/captain-home' className='h-10 w-10 bg-zinc-800 flex items-center justify-center rounded-full pointer-events-auto shadow-lg border border-zinc-700 hover:border-red-500 transition-colors'>
                    <LogOut className="text-zinc-400 hover:text-red-500" size={18} />
                </Link>
            </div>

            <div className='h-4/5 w-screen fixed top-0 z-0'>
                <LivingMap active={true} />
            </div>

            <div
                className='h-1/5 relative z-10 bg-yellow-400 pt-8 px-6 pb-6 flex items-center justify-between rounded-t-3xl shadow-[0_-10px_40px_rgba(250,204,21,0.3)] cursor-pointer hover:h-[25%] transition-all duration-300'
                onClick={() => {
                    setFinishRidePanel(true)
                }}
            >
                <div className='absolute top-2 left-1/2 -translate-x-1/2 w-full flex justify-center pb-2'>
                    <ChevronUp className="text-black/50 animate-bounce" size={24} />
                </div>

                <div>
                    <h4 className='text-3xl font-black text-black'>4 KM away</h4>
                    <p className='text-black/70 font-bold text-sm'>Drop-off approaching</p>
                </div>

                <button className='bg-black text-white font-bold py-3 px-8 rounded-xl shadow-xl hover:bg-zinc-800 transition-colors'>
                    Complete Ride
                </button>
            </div>

            <div ref={finishRidePanelRef} className='fixed w-full z-[500] bottom-0 translate-y-full bg-dark-card border-t border-zinc-800 px-3 py-10 pt-12 shadow-2xl rounded-t-3xl'>
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel} />
            </div>

        </div>
    )
}

export default CaptainRiding
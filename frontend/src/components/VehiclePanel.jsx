import React, { useState, useEffect } from 'react'
import { MotoIcon, AutoIcon } from './BrandAssets'

const VehiclePanel = (props) => {

    // Determine a reference price for the bidding recommendation
    // Default to 'car' fare if available, otherwise just use a placeholder or logic
    const recommendedPrice = props.fare.car || props.fare.auto || props.fare.moto || 0;

    const [isBidding, setIsBidding] = useState(false);

    // Initial fill if bidding opens? Or just show underneath.
    // Let's auto-fill the input if it's empty when bidding starts
    useEffect(() => {
        if (isBidding && !props.bidFare && recommendedPrice > 0) {
            if (props.setBidFare) props.setBidFare(recommendedPrice);
        }
    }, [isBidding, recommendedPrice]);

    const onBidChange = (e) => {
        if (props.setBidFare) props.setBidFare(e.target.value);
    }

    return (
        <div className="text-white h-full flex flex-col">
            {/* Drag Handle */}
            <h5 className='p-1 text-center w-full absolute top-2 left-0' onClick={() => {
                props.setVehiclePanel(false)
            }}><div className="w-12 h-1 bg-gray-600 rounded-full mx-auto cursor-pointer"></div></h5>

            <h3 className='text-2xl font-bold mb-4 mt-6 px-1'>Choose your Ride</h3>



            {/* Vehicle List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {/* Car Option */}
                <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('car')
                }} className='group flex border border-gray-800 bg-dark-surface/40 active:border-brand-primary active:bg-brand-primary/10 hover:border-gray-600 hover:bg-dark-surface/80 rounded-2xl w-full p-4 items-center justify-between transition-all cursor-pointer relative overflow-hidden'>
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

                    <div className="flex items-center gap-4 z-10">
                        <img className='h-12 w-16 object-contain drop-shadow-lg' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Car" />
                        <div>
                            <h4 className='font-bold text-lg text-white'>Mini <span className="text-xs font-normal text-gray-400 ml-1"><i className="ri-user-3-fill"></i> 4</span></h4>
                            <p className='font-normal text-xs text-gray-400'>Comfy, economical cars</p>
                        </div>
                    </div>
                    <div className="text-right z-10">
                        <h2 className='text-xl font-bold text-white'>₹{props.fare.car}</h2>
                        <h5 className='font-medium text-xs text-brand-primary'>2 min</h5>
                    </div>
                </div>

                {/* Moto Option */}
                <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('moto')
                }} className='group flex border border-gray-800 bg-dark-surface/40 active:border-brand-primary active:bg-brand-primary/10 hover:border-gray-600 hover:bg-dark-surface/80 rounded-2xl w-full p-4 items-center justify-between transition-all cursor-pointer relative overflow-hidden'>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

                    <div className="flex items-center gap-4 z-10">
                        <MotoIcon className="w-16 h-12 text-gray-200 drop-shadow-md" />
                        <div>
                            <h4 className='font-bold text-lg text-white'>Moto <span className="text-xs font-normal text-gray-400 ml-1"><i className="ri-user-3-fill"></i> 1</span></h4>
                            <p className='font-normal text-xs text-gray-400'>Fastest delivery</p>
                        </div>
                    </div>
                    <div className="text-right z-10">
                        <h2 className='text-xl font-bold text-white'>₹{props.fare.moto}</h2>
                        <h5 className='font-medium text-xs text-brand-primary'>3 min</h5>
                    </div>
                </div>

                {/* Auto Option */}
                <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('auto')
                }} className='group flex border border-gray-800 bg-dark-surface/40 active:border-brand-primary active:bg-brand-primary/10 hover:border-gray-600 hover:bg-dark-surface/80 rounded-2xl w-full p-4 items-center justify-between transition-all cursor-pointer relative overflow-hidden'>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

                    <div className="flex items-center gap-4 z-10">
                        <AutoIcon className="w-16 h-12 text-gray-200 drop-shadow-md" />
                        <div>
                            <h4 className='font-bold text-lg text-white'>Auto <span className="text-xs font-normal text-gray-400 ml-1"><i className="ri-user-3-fill"></i> 3</span></h4>
                            <p className='font-normal text-xs text-gray-400'>Reliable & spacious</p>
                        </div>
                    </div>
                    <div className="text-right z-10">
                        <h2 className='text-xl font-bold text-white'>₹{props.fare.auto}</h2>
                        <h5 className='font-medium text-xs text-brand-primary'>3 min</h5>
                    </div>
                </div>
            </div>

            {/* Vibe Selection */}
            <div className="mt-4 px-1 pb-4">
                <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider text-gray-400">Ride Vibe</h4>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => props.setVibe(prev => ({ ...prev, techno: !prev.techno }))}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${props.vibe?.techno ? 'bg-brand-primary text-black border-brand-primary' : 'bg-dark-surface text-gray-400 border-zinc-700'}`}
                    >
                        Techno Lover
                    </button>
                    <button 
                         onClick={() => props.setVibe(prev => ({ ...prev, ac: !prev.ac }))}
                         className={`p-2 rounded-lg border text-xs font-bold transition-all ${props.vibe?.ac ? 'bg-brand-primary text-black border-brand-primary' : 'bg-dark-surface text-gray-400 border-zinc-700'}`}
                    >
                        AC Max
                    </button>
                    <button 
                         onClick={() => props.setVibe(prev => ({ ...prev, quiet: !prev.quiet }))}
                         className={`p-2 rounded-lg border text-xs font-bold transition-all ${props.vibe?.quiet ? 'bg-brand-primary text-black border-brand-primary' : 'bg-dark-surface text-gray-400 border-zinc-700'}`}
                    >
                        Quiet Ride
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VehiclePanel
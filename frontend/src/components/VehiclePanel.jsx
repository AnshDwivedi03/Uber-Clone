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

            {/* Bidding Section - Highlighted & Premium */}
            <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${isBidding ? 'border-brand-primary bg-gradient-to-br from-brand-primary/20 to-transparent shadow-[0_0_15px_rgba(255,215,0,0.1)]' : 'border-gray-700 bg-dark-surface/40'}`}>
                <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setIsBidding(!isBidding)}>
                    <div>
                        <h4 className="font-bold text-lg text-white">Bid Your Price</h4>
                        <p className="text-xs text-brand-primary">Save more by offering your own fare</p>
                    </div>

                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isBidding ? 'bg-brand-primary' : 'bg-gray-600'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isBidding ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                {isBidding && (
                    <div className="animate-fade-in mt-3 border-t border-gray-600/50 pt-3">
                        <div className="mb-2 flex justify-between items-center px-1">
                            <span className="text-sm text-gray-400">Your Offer</span>
                            <span className="text-xs text-gray-500">Recommended: ₹{recommendedPrice}</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={props.bidFare}
                                onChange={onBidChange}
                                className="bg-dark-bg/80 border border-gray-600 rounded-lg w-full py-3 pl-8 pr-3 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all font-bold text-lg"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 italic text-center">Average fares are around ₹{recommendedPrice}. Offers below ₹{Math.floor(recommendedPrice * 0.8)} may take longer to accept.</p>

                        <button
                            onClick={() => {
                                props.setConfirmRidePanel(true);
                                props.selectVehicle('car'); // Default to Mini/Car for custom bids
                            }}
                            className="w-full mt-3 bg-brand-primary text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-all shadow-lg text-lg flex justify-center items-center"
                        >
                            <span className="mr-2">Book Ride</span>
                            <i className="ri-arrow-right-line"></i>
                        </button>
                    </div>
                )}
            </div>

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
        </div>
    )
}

export default VehiclePanel
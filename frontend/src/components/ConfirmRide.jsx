import React, { useState, useEffect } from 'react'
import Button from './ui/Button'
import { Plus, Minus } from 'lucide-react'

const ConfirmRide = (props) => {
    // Initialize bidFare if it's empty
    useEffect(() => {
        if (!props.bidFare && props.fare[props.vehicleType]) {
            props.setBidFare(props.fare[props.vehicleType])
        }
    }, [props.fare, props.vehicleType, props.bidFare, props.setBidFare])

    const increaseFare = () => {
        const currentFare = parseFloat(props.bidFare) || parseFloat(props.fare[props.vehicleType])
        props.setBidFare((currentFare + 10).toFixed(0)) // Increment by 10
    }

    const decreaseFare = () => {
        const currentFare = parseFloat(props.bidFare) || parseFloat(props.fare[props.vehicleType])
        const baseFare = parseFloat(props.fare[props.vehicleType])
        
        // Don't allow going too low below base fare (e.g. 80%)
        if (currentFare - 10 >= baseFare * 0.8) {
            props.setBidFare((currentFare - 10).toFixed(0))
        }
    }

    return (
        <div className="text-white">
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setConfirmRidePanel(false)
                props.setBidFare('') // Reset bid when closing
            }}><i className="text-3xl text-gray-400 ri-arrow-down-wide-line cursor-pointer hover:text-white transition-colors"></i></h5>
            
            <h3 className='text-2xl font-bold mb-5'>Confirm your Ride</h3>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <img className='h-20' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b border-gray-700'>
                        <i className="ri-map-pin-user-fill text-brand-primary"></i>
                        <div>
                            <h3 className='text-lg font-medium text-white'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-400'>{props.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b border-gray-700'>
                        <i className="text-lg ri-map-pin-2-fill text-brand-primary"></i>
                        <div>
                            <h3 className='text-lg font-medium text-white'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-400'>{props.destination}</p>
                        </div>
                    </div>
                    
                    {/* Price Negotiation Section */}
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line text-brand-primary"></i>
                        <div className="w-full">
                            <h3 className='text-lg font-medium text-white flex justify-between items-center w-full'>
                                <span>Fair Price</span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={decreaseFare}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    
                                    <span className="text-xl font-bold text-white min-w-[3ch] text-center">
                                        ₹{props.bidFare || props.fare[props.vehicleType]}
                                    </span>
                                    
                                    <button 
                                        onClick={increaseFare}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </h3>
                            <p className='text-xs text-gray-400 mt-1'>
                                Recommended: ₹{props.fare[props.vehicleType]}
                            </p>
                        </div>
                    </div>
                </div>

                <Button onClick={() => {
                    props.setVehicleFound(true)
                    props.setConfirmRidePanel(false)
                    props.createRide()
                }} className='w-full mt-5 bg-brand-primary text-black font-bold p-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg'>
                    Confirm Ride
                </Button>
            </div>
        </div>
    )
}

export default ConfirmRide
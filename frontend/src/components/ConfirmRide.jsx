import React from 'react'

const ConfirmRide = (props) => {
    return (
        <div className="text-white">
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setConfirmRidePanel(false)
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
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line text-brand-primary"></i>
                        <div>
                            <h3 className='text-lg font-medium text-white'>
                                {props.bidFare ? (
                                    <span>
                                        ₹{props.bidFare} <span className="text-xs font-normal text-brand-primary">(Your Offer)</span>
                                    </span>
                                ) : (
                                    <span>₹{props.fare[props.vehicleType]}</span>
                                )}
                            </h3>
                            <p className='text-sm -mt-1 text-gray-400'>Cash Payment</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => {
                    props.setVehicleFound(true)
                    props.setConfirmRidePanel(false)
                    props.createRide()

                }} className='w-full mt-5 bg-brand-primary text-black font-bold p-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg'>Confirm</button>
            </div>
        </div>
    )
}

export default ConfirmRide
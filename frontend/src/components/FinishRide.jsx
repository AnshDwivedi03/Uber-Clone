import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


const FinishRide = (props) => {

    const navigate = useNavigate()

    async function endRide() {
        console.log('Ending ride with ID:', props.ride?._id);
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/end-ride`, {

            rideId: props.ride._id


        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (response.status === 200) {
            navigate('/captain-home')
        }

    }

    return (
        <div className="bg-dark-card rounded-t-3xl shadow-2xl p-6 h-auto">
            <div className="w-full flex justify-center mb-4" onClick={() => {
                props.setFinishRidePanel(false)
            }}>
                <div className="w-12 h-1.5 bg-zinc-700 rounded-full cursor-pointer hover:bg-zinc-600 transition-colors"></div>
            </div>
            
            <h3 className='text-2xl font-bold text-white mb-6 text-center'>Finish this Ride</h3>
            
            <div className='flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg'>
                <div className='flex items-center gap-4'>
                    <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-lime-500 overflow-hidden relative">
                         <img className='w-full h-full object-cover' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
                    </div>
                    <div>
                         <h2 className='text-xl font-bold text-white capitalize'>{props.ride?.user?.fullname?.firstname}</h2>
                         <p className="text-sm text-zinc-400 font-medium">Gold Member</p>
                    </div>
                </div>
                <h5 className='text-lg font-bold text-lime-400'>2.2 KM</h5>
            </div>
            
            <div className='flex gap-2 justify-between flex-col items-center mt-6'>
                <div className='w-full space-y-4'>
                    <div className='flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'>
                        <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0">
                            <i className="ri-map-pin-user-fill text-lime-400 text-lg"></i>
                        </div>
                        <div className="overflow-hidden">
                            <h3 className='text-base font-bold text-zinc-400 uppercase tracking-wide mb-1'>Pickup</h3>
                            <p className='text-lg text-white font-medium truncate leading-tight'>{props.ride?.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'>
                        <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0">
                            <i className="ri-map-pin-2-fill text-lime-500 text-lg"></i>
                        </div>
                        <div className="overflow-hidden">
                            <h3 className='text-base font-bold text-zinc-400 uppercase tracking-wide mb-1'>Destination</h3>
                            <p className='text-lg text-white font-medium truncate leading-tight'>{props.ride?.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'>
                         <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0">
                            <i className="ri-currency-line text-lime-400 text-lg"></i>
                        </div>
                        <div>
                            <h3 className='text-2xl font-bold text-white'>₹{props.ride?.fare} </h3>
                            <p className='text-sm text-zinc-400 font-medium'>Cash Payment</p>
                        </div>
                    </div>
                </div>

                <div className='w-full mt-8 mb-4'>
                    <button
                        onClick={endRide}
                        className='w-full flex items-center justify-center gap-3 bg-lime-500 hover:bg-lime-400 text-black font-black text-lg py-4 rounded-xl shadow-lg shadow-lime-500/20 transition-all transform active:scale-95'>
                        <span>Finish Ride</span>
                        <i className="ri-arrow-right-line"></i>
                    </button>
                    <p className="mt-4 text-xs text-center text-zinc-500 max-w-xs mx-auto">Clicking finish will complete the ride and process payment.</p>
                </div>
            </div>
        </div>
    )
}

export default FinishRide
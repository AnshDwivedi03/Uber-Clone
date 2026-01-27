import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ConfirmRidePopUp = (props) => {
    const [otp, setOtp] = useState('')
    const navigate = useNavigate()

    const submitHander = async (e) => {
        e.preventDefault()

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/start-ride`, {
            params: {
                rideId: props.ride._id,
                otp: otp
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (response.status === 200) {
            props.setConfirmRidePopupPanel(false)
            props.setRidePopupPanel(false)
            navigate('/captain-riding', { state: { ride: props.ride } })
        }


    }
    return (
        <div className="h-screen bg-dark-card rounded-t-3xl shadow-2xl p-6">
            <h5 className='p-1 text-center w-full absolute top-0' onClick={() => {
                props.setRidePopupPanel(false)
            }}><i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-bold text-white mb-5 text-center mt-2'>Confirm Code to Start</h3>
            
            <div className='flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 mt-4 shadow-lg'>
                <div className='flex items-center gap-4'>
                    <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-lime-500 overflow-hidden">
                         <img className='w-full h-full object-cover' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
                    </div>
                    <div>
                         <h2 className='text-xl font-bold text-white capitalize'>{props.ride?.user.fullname.firstname}</h2>
                         <p className="text-sm text-zinc-400 font-medium">Gold Member</p>
                    </div>
                </div>
                <h5 className='text-lg font-bold text-lime-400'>2.2 KM</h5>
            </div>
            
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5 space-y-4'>
                    <div className='flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'>
                        <i className="ri-map-pin-user-fill text-lime-400 text-xl"></i>
                        <div className="overflow-hidden">
                            <h3 className='text-lg font-bold text-white'>Pickup</h3>
                            <p className='text-sm text-zinc-400 truncate'>{props.ride?.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'>
                        <i className="text-xl ri-map-pin-2-fill text-lime-400"></i>
                        <div className="overflow-hidden">
                            <h3 className='text-lg font-bold text-white'>Destination</h3>
                            <p className='text-sm text-zinc-400 truncate'>{props.ride?.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'>
                        <i className="ri-currency-line text-lime-400 text-xl"></i>
                        <div>
                            <h3 className='text-lg font-bold text-white'>₹{props.ride?.fare} </h3>
                            <p className='text-sm text-zinc-400'>Cash Payment</p>
                        </div>
                    </div>
                </div>

                <div className='mt-6 w-full'>
                    <form onSubmit={submitHander}>
                        <div className="relative">
                            <input 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                type="text" 
                                className='bg-zinc-900 px-6 py-4 font-mono text-2xl font-bold rounded-xl w-full mt-3 text-center text-lime-400 border border-zinc-700 focus:border-lime-500 focus:outline-none tracking-[1em] placeholder:tracking-normal' 
                                placeholder='ENTER OTP' 
                                maxLength={6}
                            />
                        </div>

                        <button className='w-full mt-5 text-lg flex justify-center bg-lime-500 hover:bg-lime-400 text-black font-bold p-4 rounded-xl shadow-lg transition-all'>
                            Confirm & Start Ride
                        </button>
                        
                        <button onClick={() => {
                            props.setConfirmRidePopupPanel(false)
                            props.setRidePopupPanel(false)
                        }} className='w-full mt-3 bg-zinc-800 hover:bg-zinc-700 text-lg text-white font-bold p-4 rounded-xl border border-zinc-700 transition-all'>
                            Cancel
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConfirmRidePopUp
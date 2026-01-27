import React, { useEffect, useContext, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SocketContext } from '../context/SocketContext'
import { useNavigate } from 'react-router-dom'
import LiveTrackingMap from '../components/LiveTrackingMap'
import { Home, MapPin, Wallet, CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'

const Riding = () => {
    const location = useLocation()
    const { ride } = location.state || {}
    const { socket } = useContext(SocketContext)
    const navigate = useNavigate()
    const [captainLocation, setCaptainLocation] = useState(null)
    const [rideDistance, setRideDistance] = useState(null)
    const [rideTime, setRideTime] = useState(null)

    socket.on("ride-ended", () => {
        navigate('/home')
    })
    
    // Listen for captain location updates
    useEffect(() => {
        socket.on('captain-location-update', (data) => {
             // data: { lat, lng }
             setCaptainLocation({ lat: data.lat, lng: data.lng })
        })
    }, [socket])

    return (
        <div className='h-screen relative overflow-hidden bg-dark-bg'>
            <div className='fixed right-4 top-4 z-50'>
                <Link to='/home' className='h-12 w-12 bg-zinc-800 flex items-center justify-center rounded-full shadow-lg border border-zinc-700 hover:border-lime-500 transition-colors'>
                    <Home className="text-white" size={20} />
                </Link>
            </div>

            <div className='h-1/2 w-screen absolute top-0 z-0'>
                <LiveTrackingMap 
                    active={true}
                    captainLocation={captainLocation}
                    pickup={ride ? { 
                        lat: ride.pickupLocation ? ride.pickupLocation.lat : (ride.pickup.coordinates ? ride.pickup.coordinates[1] : 28.6139), 
                        lng: ride.pickupLocation ? ride.pickupLocation.lng : (ride.pickup.coordinates ? ride.pickup.coordinates[0] : 77.2090) 
                    } : null}
                    dropoff={ride ? { 
                        lat: ride.destinationLocation ? ride.destinationLocation.lat : (ride.drop.coordinates ? ride.drop.coordinates[1] : 28.7041), 
                        lng: ride.destinationLocation ? ride.destinationLocation.lng : (ride.drop.coordinates ? ride.drop.coordinates[0] : 77.1025) 
                    } : null}
                    updateTime={(data) => {
                        setRideDistance(data.distance);
                        setRideTime(data.time);
                    }}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dark-bg to-transparent pointer-events-none" />
            </div>

            <div className='h-1/2 absolute bottom-0 w-full p-6 flex flex-col justify-end z-10 bg-dark-card border-t border-zinc-800 rounded-t-3xl shadow-2xl'>
                <div className='flex items-center justify-between mb-6'>
                    <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.3)]">
                        <img className='w-full h-full object-cover' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Driver" />
                    </div>
                    <div className='text-right'>
                        <h2 className='text-xl font-bold text-white capitalize'>{ride?.captain.fullname.firstname} is driving</h2>
                        <h4 className='text-3xl font-black text-lime-400 -my-1 tracking-tighter'>{ride?.captain.vehicle.plate}</h4>
                        <p className='text-sm text-zinc-500 font-medium mt-1 capitalize'>
                            {ride?.captain.vehicle.model} ({ride?.captain.vehicle.vehicleType}) • {ride?.captain.vehicle.color}
                        </p>
                        
                        {/* Distance & Time Display */}
                        {rideDistance && (
                            <p className="text-white font-bold text-sm mt-1 bg-zinc-800 px-2 py-1 rounded-md inline-block">
                                { (rideDistance / 1000).toFixed(1) } KM • { Math.ceil(rideTime / 60) } min
                            </p>
                        )}

                        <div className='mt-2 bg-zinc-800 px-4 py-2 rounded-lg inline-block border border-lime-500/30'>
                            <span className="text-zinc-400 font-bold text-xs uppercase mr-2">OTP</span>
                            <span className="text-lime-400 text-2xl font-mono font-black tracking-widest">{ride?.otp}</span>
                        </div>
                    </div>
                </div>

                <div className='space-y-4 mb-6'>
                    <div className='flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'>
                        <MapPin className="text-lime-400 shrink-0" size={24} />
                        <div className="overflow-hidden">
                            <h3 className='text-lg font-bold text-white truncate'>562/11-A</h3>
                            <p className='text-sm text-zinc-400 truncate'>{ride?.destination || "Drop Location"}</p>
                        </div>
                    </div>

                    <div className='flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'>
                        <Wallet className="text-lime-400 shrink-0" size={24} />
                        <div>
                            <h3 className='text-lg font-bold text-white'>₹{ride?.fare} </h3>
                            <p className='text-sm text-zinc-400'>Cash Payment</p>
                        </div>
                    </div>
                </div>

                <Button className='w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-lime-500/20'>
                    <span className="flex items-center justify-center gap-2">
                        <CheckCircle size={20} /> Make a Payment
                    </span>
                </Button>
            </div>
        </div>
    )
}

export default Riding
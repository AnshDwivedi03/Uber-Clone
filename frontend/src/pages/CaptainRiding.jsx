import React, { useRef, useState, useEffect, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import LiveTrackingMap from '../components/LiveTrackingMap' // Changed from LivingMap
import { LogOut, ChevronUp } from 'lucide-react'
import { SocketContext } from '../context/SocketContext'

const CaptainRiding = () => {

    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const finishRidePanelRef = useRef(null)
    const location = useLocation()
    const rideData = location.state?.ride
    const { socket } = useContext(SocketContext)
    const [captainLocation, setCaptainLocation] = useState(null)
    const [rideDistance, setRideDistance] = useState(null)

    // Track Location
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.")
            return
        }

        const updateLocation = (position) => {
            const { latitude, longitude } = position.coords
            const newLocation = { lat: latitude, lng: longitude }
            setCaptainLocation(newLocation)

            // Emit location to server
            // We attach rideId and riderId so server knows who to notify
            socket.emit('update-location-captain', {
                userId: rideData.captain._id,
                location: { ltd: latitude, lng: longitude },
                rideId: rideData._id,
                riderId: rideData.user._id // Ensure this field exists in rideData
            })
        }

        const watchId = navigator.geolocation.watchPosition(
            updateLocation,
            (error) => console.error("Error watching position:", error),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [socket, rideData])

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
                {/* 
                   Construct pickup/dropoff objects from rideData
                   rideData.pickup.coordinates is [lng, lat] usually in Mongo GeoJSON
                   Leaflet needs [lat, lng]
                */}
                <LiveTrackingMap 
                    active={true}
                    captainLocation={captainLocation}
                    pickup={rideData ? { 
                        lat: rideData.pickupLocation ? rideData.pickupLocation.lat : (rideData.pickup.coordinates ? rideData.pickup.coordinates[1] : 28.6139), 
                        lng: rideData.pickupLocation ? rideData.pickupLocation.lng : (rideData.pickup.coordinates ? rideData.pickup.coordinates[0] : 77.2090) 
                    } : null}
                    dropoff={rideData ? { 
                        lat: rideData.destinationLocation ? rideData.destinationLocation.lat : (rideData.drop.coordinates ? rideData.drop.coordinates[1] : 28.7041), 
                        lng: rideData.destinationLocation ? rideData.destinationLocation.lng : (rideData.drop.coordinates ? rideData.drop.coordinates[0] : 77.1025) 
                    } : null}
                    updateTime={(data) => {
                        // data has distance (meters) and time (seconds)
                        console.log("Captain updated distance:", data.distance);
                        // You can store this in local state to display
                        setRideDistance(data.distance);
                    }}
                />
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
                     {/* Display dynamic distance if available, else static text */}
                    <h4 className='text-xl font-bold text-black'>
                        {rideDistance ? `${(rideDistance / 1000).toFixed(1)} KM away` : 'On way to drop'}
                    </h4>
                    <button className='bg-black text-white font-bold py-3 px-8 rounded-xl shadow-xl hover:bg-zinc-800 transition-colors mt-2'>
                        Complete Ride
                    </button>
                </div>
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
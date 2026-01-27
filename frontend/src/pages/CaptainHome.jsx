import React, { useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/SocketContext';
import { CaptainDataContext } from '../context/CaptainContext';
import { Link, useNavigate } from 'react-router-dom';
import LivingMap from '../components/LivingMap';
import Button from '../components/ui/Button';
import { Power, MapPin, DollarSign, Clock, Menu, User, CreditCard, LogOut, Car } from 'lucide-react';
import BiddingPanel from '../components/BiddingPanel';
import LiveTracking from '../components/LiveTracking';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';

const CaptainHome = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [rideRequest, setRideRequest] = useState(null);
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Fix: Ensure useSocket is called to get socket instance
    const { socket, joinIdentity } = useSocket();
    const { captain } = useContext(CaptainDataContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (captain && socket) {
            console.log("Captain emitting join for:", captain._id);
            joinIdentity(captain._id, 'captain');
        }
    }, [captain, socket]);

    // Mock Earnings
    const [earnings, setEarnings] = useState(1250); // Today's earnings

    const toggleOnline = () => {
        setIsOnline(!isOnline);
        if (socket) {
            socket.emit(isOnline ? 'go-offline' : 'go-online', { userId: captain?._id });
        }
    };

    // Location Updates when Online
    useEffect(() => {
        if (!isOnline || !socket || !captain) return;

        console.log("Captain coming online, starting watchPosition");

        const updateLocation = (position) => {
             const { latitude, longitude } = position.coords;
             console.log("Captain Location:", latitude, longitude);
             
             socket.emit('update-location-captain', {
                userId: captain._id,
                location: { ltd: latitude, lng: longitude }
            });
        };

        const errorLocation = (error) => {
            console.error("Geolocation Error:", error);
        };

        const watchId = navigator.geolocation.watchPosition(updateLocation, errorLocation, {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isOnline, socket, captain]);

    // Listen for Ride Requests & Confirmation
    useEffect(() => {
        if (!socket) return;

        socket.on('new-ride', (data) => {
            setRideRequest(data);
        });

        socket.on('ride-confirmed', (data) => {
             console.log("Ride Confirmed by User:", data);
             setRideRequest(null); // Hide request panel
             setRideRequest(data); // Ensure data availability for popup (though duplicate set, purely for clarity)
             setConfirmRidePopupPanel(true); // Show OTP Popup
        });

        return () => {
             socket.off('new-ride');
             socket.off('ride-confirmed');
        };
    }, [socket]);

    const acceptRide = () => {
        if (!socket || !rideRequest || !captain) return;

        const data = {
            rideId: rideRequest._id,
            riderId: rideRequest.user._id,
            captainId: captain._id
        };

        socket.emit('captain-accept-ride', data);
        console.log('Accepted Ride, emitting:', data);
    };

    const counterOffer = (amount) => {
        if (!socket || !rideRequest || !captain) return;

        const data = {
            rideId: rideRequest._id,
            riderId: rideRequest.user._id,
            captainId: captain._id,
            amount: amount,
            captainDetails: captain // Sending full profile for Rider UI
        };

        socket.emit('make-bid', data);
        console.log('Counter Bid, emitting:', data);
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg relative overflow-hidden">
            <div className='absolute inset-0 z-0'>
                <LiveTracking
                    driverLocation={isOnline ? { lat: captain?.location?.ltd || 28.6, lng: captain?.location?.lng || 77.2 } : null}
                />
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                {/* Sidebar Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="pointer-events-auto bg-zinc-800 p-2 rounded-full border border-zinc-700 shadow-lg text-white hover:border-lime-400 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <h1 className="pointer-events-auto text-2xl font-black text-lime-400 drop-shadow-md absolute left-1/2 transform -translate-x-1/2">
                    SKRRRT <span className="text-white text-xs font-normal border border-zinc-700 rounded px-1 align-middle">CAPTAIN</span>
                </h1>

                <div className="pointer-events-auto">
                    <button
                        onClick={toggleOnline}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${isOnline ? 'bg-lime-400 text-black animate-pulse-slow shadow-lime-500/50' : 'bg-zinc-800 text-zinc-500'}`}
                    >
                        <Power size={24} />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-zinc-900 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-zinc-800`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-white italic">SKRRRT</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400 hover:text-white">
                            Close
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="p-3 bg-zinc-800 rounded-xl mb-4 border border-zinc-700">
                            <p className="text-xs text-zinc-400 font-bold uppercase">Captain</p>
                            <p className="text-lg font-bold text-white truncate">{captain?.fullname?.firstname} {captain?.fullname?.lastname}</p>
                            <p className="text-xs text-lime-400 font-bold">{captain?.vehicle?.plate}</p>
                        </div>

                        <Link to="/captain/profile" className="flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-xl text-white transition-colors">
                            <User className="text-lime-400" size={20} />
                            <span className="font-bold">Profile</span>
                        </Link>
                        <Link to="/captain/history" className="flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-xl text-white transition-colors">
                            <Clock className="text-lime-400" size={20} />
                            <span className="font-bold">Ride History</span>
                        </Link>
                        <Link to="/captain/payment" className="flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-xl text-white transition-colors">
                            <DollarSign className="text-lime-400" size={20} />
                            <span className="font-bold">Earnings</span>
                        </Link>
                    </div>

                    <div className="mt-auto">
                        <Link to="/captain/logout" className="flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl text-red-500 transition-colors">
                            <LogOut size={20} />
                            <span className="font-bold">Sign Out</span>
                        </Link>
                    </div>
                </div>
            </div>
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />}


            {/* Map Area */}
            <div className="flex-1 relative z-0">
                <LiveTracking />
            </div>

            {/* Dashboard Panel */}
            <div className={`${rideRequest ? 'h-3/5' : 'h-2/5'} bg-dark-card border-t-2 ${isOnline ? 'border-lime-500' : 'border-zinc-800'} rounded-t-3xl p-6 relative z-10 transition-all duration-500 shadow-2xl`}>

                {!rideRequest ? (
                    <>
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Today's Earnings</p>
                                <h2 className="text-4xl font-black text-white flex items-center">
                                    <span className="text-2xl font-normal text-zinc-600 mr-1">₹</span>
                                    {earnings}
                                </h2>
                            </div>
                            <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isOnline ? 'bg-lime-500/10 text-lime-400 border-lime-500/50' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                                    {isOnline ? 'YOU ARE ONLINE' : 'OFFLINE'}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                                <div className="flex items-center gap-2 mb-1 text-zinc-400">
                                    <Clock size={16} />
                                    <span className="text-xs">Online Time</span>
                                </div>
                                <span className="text-xl font-bold text-white">4h 20m</span>
                            </div>
                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                                <div className="flex items-center gap-2 mb-1 text-zinc-400">
                                    <MapPin size={16} />
                                    <span className="text-xs">Trips</span>
                                </div>
                                <span className="text-xl font-bold text-white">8</span>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Ride Request Pop-Up with BiddingPanel */
                    <div className="absolute inset-0 bg-dark-card rounded-t-3xl border-t border-brand-primary z-50 p-6 animate-slide-up overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">New Ride Request</h3>
                            <span className="bg-lime-500 text-black text-xs font-bold px-2 py-1 rounded">
                                {rideRequest.vibe?.quiet ? 'QUIET RIDE' : 'NORMAL'}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-lime-500" />
                                <p className="text-sm text-zinc-300">{typeof rideRequest.pickup === 'string' ? rideRequest.pickup : rideRequest.pickup.address}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-white" />
                                <p className="text-sm text-zinc-300">{typeof rideRequest.drop === 'string' ? rideRequest.drop : rideRequest.drop.address}</p>
                            </div>
                        </div>

                        <BiddingPanel
                            ride={{ fare: rideRequest.fare }}
                            userType="captain"
                            onAccept={acceptRide}
                            onReject={() => setRideRequest(null)}
                            onCounter={counterOffer}
                        />
                    </div>
                )}
            </div>

            {/* Confirm Ride Pop-Up (OTP) */}
            {confirmRidePopupPanel && (
                <div className="fixed w-full z-50 bottom-0 translate-y-0 bg-dark-card border-t border-brand-primary p-6 rounded-t-3xl shadow-2xl transition-transform duration-300 h-screen">
                    <ConfirmRidePopUp
                        ride={rideRequest}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                        setRidePopupPanel={() => {}} // No-op since we handle panel via state
                    />
                </div>
            )}
        </div>
    );
};

export default CaptainHome;
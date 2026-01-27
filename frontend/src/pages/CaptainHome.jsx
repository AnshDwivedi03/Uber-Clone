import React, { useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/SocketContext';
import { CaptainDataContext } from '../context/CaptainContext';
import { Link } from 'react-router-dom';
import LivingMap from '../components/LivingMap';
import Button from '../components/ui/Button';
import { Power, MapPin, DollarSign, Clock, Menu, User, CreditCard, LogOut, Car } from 'lucide-react';
import BiddingPanel from '../components/BiddingPanel';
import LiveTracking from '../components/LiveTracking';

const CaptainHome = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [rideRequest, setRideRequest] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { socket } = useSocket();
    const { captain } = useContext(CaptainDataContext);

    // Mock Earnings
    const [earnings, setEarnings] = useState(1250); // Today's earnings

    const toggleOnline = () => {
        setIsOnline(!isOnline);
        if (socket) {
            socket.emit(isOnline ? 'go-offline' : 'go-online', { userId: captain?._id });
        }
    };

    // Mock Location Updates when Online
    useEffect(() => {
        if (!isOnline || !socket) return;

        const interval = setInterval(() => {
            // Simulate movement for demo
            const mockLat = 28.7041 + (Math.random() - 0.5) * 0.01;
            const mockLng = 77.1025 + (Math.random() - 0.5) * 0.01;

            socket.emit('update-location-captain', {
                userId: captain?._id,
                location: { ltd: mockLat, lng: mockLng }
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [isOnline, socket, captain]);

    // Listen for Ride Requests
    useEffect(() => {
        if (!socket) return;

        socket.on('new-ride', (data) => {
            setRideRequest(data);
        });

        return () => {
            socket.off('new-ride');
        };
    }, [socket]);

    const acceptRide = () => {
        // socket.emit('accept-ride', ...);
        console.log('Accepted Ride');
        setRideRequest(null);
        // Navigate or show ride in progress? 
        // For now, accept logic usually happens inside BiddingPanel or triggers a redirect
    };

    const counterOffer = (amount) => {
        // socket.emit('make-bid', ...);
        console.log('Counter Bid:', amount);
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg relative overflow-hidden">
            <div className='absolute inset-0 z-0'>
                <LiveTracking
                    driverLocation={isOnline ? { lat: captain?.location?.ltd || 28.6, lng: captain?.location?.lng || 77.2 } : null}
                />
            </div>

            {/* Header */}
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
                {/* Use LiveTracking for Captain too - shows current loc */}
                <LiveTracking />
            </div>

            {/* Dashboard Panel */}
            <div className={`h-2/5 bg-dark-card border-t-2 ${isOnline ? 'border-lime-500' : 'border-zinc-800'} rounded-t-3xl p-6 relative z-10 transition-colors duration-500 shadow-2xl`}>

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
                    /* Ride Request Pop-Up */
                    <div className="absolute inset-0 bg-dark-card rounded-t-3xl border-t border-brand-primary z-50 p-6 animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">New Ride Request</h3>
                            <span className="bg-lime-500 text-black text-xs font-bold px-2 py-1 rounded">
                                {rideRequest.vibe?.quiet ? 'QUIET RIDE' : 'NORMAL'}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-lime-500" />
                                <p className="text-sm text-zinc-300">{rideRequest.pickup.address || 'Pickup Location'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-white" />
                                <p className="text-sm text-zinc-300">{rideRequest.drop.address || 'Drop Location'}</p>
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
        </div>
    );
};

export default CaptainHome;
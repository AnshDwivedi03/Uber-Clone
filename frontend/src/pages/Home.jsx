import React, { useState, useRef, useContext, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import LivingMap from '../components/LivingMap';
import LiveTracking from '../components/LiveTracking';
import Button from '../components/ui/Button';
import BiddingPanel from '../components/BiddingPanel';
import { MapPin, Search, Music, Wind, VolumeX, LocateFixed, Menu, User, Clock, CreditCard, LogOut, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import axios from 'axios';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';

const Home = () => {
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [fare, setFare] = useState({});
    const [bidFare, setBidFare] = useState('');
    const [vehicleType, setVehicleType] = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [vehiclePanel, setVehiclePanel] = useState(false);
    const [confirmRidePanel, setConfirmRidePanel] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    const [activeBid, setActiveBid] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Map Selection State
    const [mapSelectionMode, setMapSelectionMode] = useState(null); // 'pickup' | 'drop' | null
    const [tempMapCoords, setTempMapCoords] = useState(null);

    const { socket } = useSocket();
    const { user } = useContext(UserDataContext);

    const panelRef = useRef(null);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropSuggestions, setDropSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);

    const submitHandler = (e) => {
        e.preventDefault();
        setPanelOpen(false);
        setVehiclePanel(true);
    };

    const confirmRide = async () => {
        setVehiclePanel(false);
        setConfirmRidePanel(false);
        setWaitingForDriver(true);

        const rideData = {
            pickup: pickup, // String address
            drop: drop,     // String address
            bid: Number(fare),
            vibe: user.vibeProfile,
            userId: user._id
        };

        if (socket) {
            socket.emit('ride-request', rideData);
        }
    };

    const findTrip = async () => {
        setVehiclePanel(true);
        setPanelOpen(false);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                params: { pickup, destination: drop },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setFare(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePickupChange = async (e) => {
        setPickup(e.target.value);
        if (e.target.value.length < 3) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPickupSuggestions(response.data);
            setActiveField('pickup');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDropChange = async (e) => {
        setDrop(e.target.value);
        if (e.target.value.length < 3) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDropSuggestions(response.data);
            setActiveField('drop');
        } catch (err) {
            console.error(err);
        }
    };

    const confirmMapSelection = async () => {
        if (!tempMapCoords) return;
        setMapSelectionMode(null);
        setPanelOpen(true);

        // Reverse Geo to get address
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-address`, {
                params: { lat: tempMapCoords.lat, lng: tempMapCoords.lng },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (mapSelectionMode === 'pickup') {
                setPickup(response.data.address);
            } else {
                setDrop(response.data.address);
            }
        } catch (error) {
            console.error("RevGeo Error", error);
            // Fallback to coords string if address fails
            if (mapSelectionMode === 'pickup') setPickup(`${tempMapCoords.lat}, ${tempMapCoords.lng}`);
            else setDrop(`${tempMapCoords.lat}, ${tempMapCoords.lng}`);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    // setPickup(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

                    try {
                        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-address`, {
                            params: { lat: latitude, lng: longitude },
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });
                        setPickup(response.data.address);
                    } catch (error) {
                        console.error("Auto-Location Error", error);
                        setPickup(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                },
                (error) => console.error('Error getting location:', error)
            );
        }
    }, []);

    // Listen for Bids
    useEffect(() => {
        if (!socket) return;
        socket.on('ride-bid-received', (data) => {
            setActiveBid(data);
            setWaitingForDriver(false);
        });

        socket.on('ride-confirmed', (data) => {
            // Navigation handled by RideConfirm logic or parent? 
            // Normally we navigate to /riding
            // But logic is currently here? Oh, ride-confirmed doesn't navigate automatically?
            // It should!
        });

        return () => {
            socket.off('ride-bid-received');
            socket.off('ride-confirmed');
        }
    }, [socket]);


    return (
        <div className="h-screen relative overflow-hidden bg-dark-bg">

            <div className='absolute inset-0 z-0'>
                <LiveTracking
                    pickup={pickup}
                    destination={drop}
                    isSelecting={!!mapSelectionMode}
                    onLocationSelect={setTempMapCoords}
                />
            </div>

            {/* Map Selection Confirmation Overlay */}
            {mapSelectionMode && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full px-4">
                    <Button
                        onClick={async () => {
                            if (!tempMapCoords) return;
                            try {
                                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-address`, {
                                    params: { lat: tempMapCoords.lat, lng: tempMapCoords.lng },
                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                });

                                if (mapSelectionMode === 'pickup') {
                                    setPickup(response.data.address);
                                } else {
                                    setDrop(response.data.address);
                                }
                            } catch (error) {
                                console.error("RevGeo Error", error);
                                const fallbackText = `${tempMapCoords.lat.toFixed(4)}, ${tempMapCoords.lng.toFixed(4)}`;
                                if (mapSelectionMode === 'pickup') setPickup(fallbackText);
                                else setDrop(fallbackText);
                            }
                            setMapSelectionMode(null);
                            setPanelOpen(true);
                        }}
                        variant="primary"
                        className="w-full shadow-2xl shadow-black/50"
                    >
                        Confirm Location
                    </Button>
                </div>
            )}

            {/* Header */}
            {/* Header */}
            <div className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-center pointer-events-none">
                {/* Sidebar Toggle */}
                <button
                    onClick={() => setPanelOpen(false) || setVehiclePanel(false) || setConfirmRidePanel(false) || setMapSelectionMode(null) || setIsSidebarOpen(true)}
                    className="pointer-events-auto bg-dark-card/90 backdrop-blur-md p-3 rounded-full border border-zinc-800 shadow-xl text-white hover:border-lime-400 transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Logo */}
                <h1 className="pointer-events-auto text-2xl font-black text-lime-400 drop-shadow-lg absolute left-1/2 transform -translate-x-1/2">
                    SKRRRT
                </h1>

                {/* Right Placeholder (to balance if needed, or just leave empty) */}
                <div className="w-12"></div>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-72 bg-zinc-900 z-[100] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-zinc-800`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-white italic">SKRRRT</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400 hover:text-white">
                            <ArrowRight className="rotate-180" size={24} />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-8 bg-zinc-800 p-4 rounded-xl border border-zinc-700">
                        <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                            {user?.fullname?.firstname[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{user?.fullname?.firstname} {user?.fullname?.lastname}</h3>
                            <p className="text-xs text-zinc-400 font-medium">Gold Member</p>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex flex-col gap-2">

                        <Link to="/user/profile" className="flex items-center gap-4 p-4 hover:bg-zinc-800 rounded-xl text-zinc-300 hover:text-lime-400 transition-all group">
                            <User size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="font-bold">Profile</span>
                        </Link>

                        <Link to="/user/history" className="flex items-center gap-4 p-4 hover:bg-zinc-800 rounded-xl text-zinc-300 hover:text-lime-400 transition-all group">
                            <Clock size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="font-bold">Ride History</span>
                        </Link>

                        <Link to="/user/payment" className="flex items-center gap-4 p-4 hover:bg-zinc-800 rounded-xl text-zinc-300 hover:text-lime-400 transition-all group">
                            <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="font-bold">Payments</span>
                        </Link>
                    </div>

                    <div className="mt-auto">
                        <Link to="/user/logout" className="flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl text-red-500 transition-colors">
                            <LogOut size={20} />
                            <span className="font-bold">Sign Out</span>
                        </Link>
                    </div>
                </div>
            </div>
            {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}


            <div className="flex flex-col justify-end h-screen absolute top-0 w-full z-10 pointer-events-none">

                {/* Initial Search Panel */}
                {!panelOpen && !vehiclePanel && !waitingForDriver && !activeBid && !mapSelectionMode && (
                    <div className="bg-dark-card p-6 rounded-t-3xl border-t border-zinc-800 pointer-events-auto animate-slide-up shadow-2xl">
                        <h4 className="text-xl font-bold text-white mb-4">Where to?</h4>
                        <form onSubmit={(e) => { e.preventDefault(); findTrip(); }}>
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
                                <input
                                    className="bg-zinc-900 w-full p-3 pl-12 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none border border-transparent focus:border-brand-primary transition-all"
                                    placeholder="Enter destination"
                                    onClick={() => setPanelOpen(true)}
                                    readOnly
                                />
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Inputs Expanded */}
                {panelOpen && !mapSelectionMode && (
                    <div className="h-screen bg-dark-card w-full z-20 px-6 pb-6 pt-24 pointer-events-auto animate-slide-up flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white">Plan your ride</h4>
                            <button onClick={() => setPanelOpen(false)} className="text-zinc-400 font-bold">Close</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); findTrip(); }} className="flex flex-col gap-4">
                            <div className='flex gap-2'>
                                <input
                                    value={pickup}
                                    onChange={handlePickupChange}
                                    onClick={() => setActiveField('pickup')}
                                    className="bg-zinc-900 p-3 rounded-xl text-white border border-zinc-800 focus:border-lime-500 focus:outline-none flex-1"
                                    placeholder="Pickup Location"
                                />
                                <button type="button" onClick={() => { setMapSelectionMode('pickup'); setPanelOpen(false); }} className="p-3 bg-zinc-800 rounded-xl text-lime-400">
                                    <LocateFixed size={20} />
                                </button>
                            </div>

                            <div className='flex gap-2'>
                                <input
                                    value={drop}
                                    onChange={handleDropChange}
                                    onClick={() => setActiveField('drop')}
                                    className="bg-zinc-900 p-3 rounded-xl text-white border border-zinc-800 focus:border-lime-500 focus:outline-none flex-1"
                                    placeholder="Drop Location"
                                />
                                <button type="button" onClick={() => { setMapSelectionMode('drop'); setPanelOpen(false); }} className="p-3 bg-zinc-800 rounded-xl text-lime-400">
                                    <LocateFixed size={20} />
                                </button>
                            </div>

                            {/* Suggestions List */}
                            {(activeField === 'pickup' && pickupSuggestions.length > 0 || activeField === 'drop' && dropSuggestions.length > 0) && (
                                <div className="bg-zinc-900/50 rounded-xl p-2 max-h-40 overflow-y-auto">
                                    <LocationSearchPanel
                                        suggestions={activeField === 'pickup' ? pickupSuggestions : dropSuggestions}
                                        setPanelOpen={setPanelOpen}
                                        setVehiclePanel={setVehiclePanel}
                                        setPickup={setPickup}
                                        setDestination={setDrop}
                                        activeField={activeField}
                                        setActiveField={setActiveField}
                                    />
                                </div>
                            )}

                            <Button type="submit" variant="primary">Find Trip</Button>
                        </form>
                    </div>
                )}


                {/* Vehicle & Vibe Selection */}
                {
                    vehiclePanel && (
                        <div ref={panelRef} className="fixed w-full z-20 bottom-0 translate-y-0 glass-panel px-3 py-10 pt-12 rounded-t-3xl shadow-2xl transition-transform duration-300 pointer-events-auto max-h-[75vh] overflow-y-auto scrollbar-hide">
                            <VehiclePanel
                                selectVehicle={setVehicleType}
                                fare={fare}
                                setConfirmRidePanel={setConfirmRidePanel}
                                setVehiclePanel={setVehiclePanel}
                                bidFare={bidFare}
                                setBidFare={setBidFare}
                            />
                        </div>
                    )
                }

                {/* Confirm Ride Panel */}
                {
                    confirmRidePanel && (
                        <div ref={panelRef} className="fixed w-full z-20 bottom-0 translate-y-0 glass-panel px-3 py-6 pt-12 rounded-t-3xl shadow-2xl transition-transform duration-300 pointer-events-auto max-h-[75vh] overflow-y-auto scrollbar-hide">
                            <ConfirmRide
                                createRide={confirmRide}
                                pickup={pickup}
                                destination={drop}
                                fare={fare}
                                vehicleType={vehicleType}
                                setConfirmRidePanel={setConfirmRidePanel}
                                setVehicleFound={setWaitingForDriver}
                                bidFare={bidFare}
                            />
                        </div>
                    )
                }

                {/* Looking for Driver Panel */}
                {
                    waitingForDriver && (
                        <div ref={panelRef} className="fixed w-full z-20 bottom-0 translate-y-0 glass-panel px-3 py-6 pt-12 rounded-t-3xl shadow-2xl transition-transform duration-300 pointer-events-auto max-h-[75vh] overflow-y-auto scrollbar-hide">
                            <LookingForDriver
                                createRide={confirmRide}
                                pickup={pickup}
                                destination={drop}
                                fare={fare}
                                vehicleType={vehicleType}
                                setVehicleFound={setWaitingForDriver}
                                bidFare={bidFare}
                                cancelRide={() => setWaitingForDriver(false)}
                            />
                        </div>
                    )
                }

                {/* Active Bid (Negotiation) */}
                {
                    activeBid && (
                        <div className="pointer-events-auto bg-dark-card rounded-t-3xl border-t border-zinc-800 shadow-2xl">
                            <BiddingPanel
                                ride={{ fare: activeBid.amount }}
                                userType="rider"
                                onAccept={(amount) => {
                                    socket.emit('accept-bid', {
                                        rideId: 'temp_ride_id',
                                        captainId: activeBid.captainId, // Wait, activeBid payload structure?
                                        amount
                                    });
                                }}
                                onReject={() => setActiveBid(null)}
                            />
                        </div>
                    )
                }

            </div >
        </div >
    );
};

export default Home;
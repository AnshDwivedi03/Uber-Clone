import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'
import { MapPin, Navigation } from 'lucide-react'

// Custom Marker Icons
const userIcon = L.divIcon({
    html: `<div class="relative w-8 h-8 bg-lime-400 rounded-full border-4 border-black flex items-center justify-center shadow-lg"><div class="w-2 h-2 bg-black rounded-full"></div></div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const driverIcon = L.divIcon({
    html: `<div class="relative w-10 h-10"><img src="https://cdn-icons-png.flaticon.com/512/3097/3097180.png" class="w-full h-full drop-shadow-lg" /></div>`, // Car icon
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const pickupIcon = L.divIcon({
    html: `<div class="w-8 h-8 flex items-center justify-center bg-black text-lime-400 rounded-full border-2 border-lime-400 font-bold shadow-lg"><span class="text-xs">P</span></div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

const destIcon = L.divIcon({
    html: `<div class="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full border-2 border-white font-bold shadow-lg"><span class="text-xs">D</span></div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090
};

// Component to handle map interaction (center updates)
const MapController = ({ onCenterChange, isSelecting, bounds, center }) => {
    const map = useMap();

    // Fly to center if provided and not selecting
    useEffect(() => {
        if (center && !isSelecting) {
            const targetLat = center.lat || center.ltd;
            const targetLng = center.lng;

            if (targetLat != null && targetLng != null) {
                map.flyTo({ lat: targetLat, lng: targetLng }, 15, {
                    animate: true,
                    duration: 1.5
                });
            }
        }
    }, [center, isSelecting, map]);

    // Force resize to prevent blank map
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);

    // Fit bounds if provided
    useEffect(() => {
        if (bounds && bounds.length > 0 && !isSelecting) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map, isSelecting]);

    useMapEvents({
        moveend: () => {
            if (isSelecting && onCenterChange) {
                const center = map.getCenter();
                onCenterChange({ lat: center.lat, lng: center.lng });
            }
        }
    });

    return null;
}

const LiveTracking = ({ pickup, destination, driverLocation, isSelecting, onLocationSelect }) => {
    const [currentPosition, setCurrentPosition] = useState(defaultCenter);
    const [routePath, setRoutePath] = useState([]);
    const [pickupCoords, setPickupCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    // Track User Location
    useEffect(() => {
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by your browser');
            return;
        }

        const updatePosition = (position) => {
            const { latitude, longitude } = position.coords;
            const pos = { lat: latitude, lng: longitude };
            setCurrentPosition(pos);

            // Auto-center on user if no active route and not selecting
            // This ensures "current location" stays in view for riders/captains when idle
            if (!pickup && !destination && !isSelecting && !driverLocation) {
                setMapCenter(pos);
            }
        };

        const error = (err) => console.log('Location error:', err);

        // Initial fetch
        navigator.geolocation.getCurrentPosition(updatePosition, error);

        // Continuous watch
        const watchId = navigator.geolocation.watchPosition(updatePosition, error, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [pickup, destination, isSelecting, driverLocation]); // Re-evaluate if tracking needs change

    // Auto-center on driver location if provided (e.g. Captain Home)
    useEffect(() => {
        if (driverLocation && !isSelecting) {
            setMapCenter(driverLocation);
        }
    }, [driverLocation, isSelecting]);

    const getCoords = async (location) => {
        if (!location) return null;
        if (typeof location === 'string') {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                    params: { address: location },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                return response.data;
            } catch (error) {
                console.error("Error fetching coordinates:", error);
                return null;
            }
        }
        return location;
    };

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchRoute = async () => {
            if (isSelecting) {
                setRoutePath([]);
                return;
            }

            if (!pickup || !destination) {
                setRoutePath([]);
                // If only pickup is set, show marker?
                if (pickup) {
                    const pCoords = await getCoords(pickup); // This technically might race too, but less critical than route
                    if (signal.aborted) return;
                    setPickupCoords(pCoords);
                    if (pCoords && !destination) setMapCenter(pCoords); 
                }
                return;
            }

            try {
                // Parallelize Geocoding Requests
                const [pCoords, dCoords] = await Promise.all([
                    getCoords(pickup),
                    getCoords(destination)
                ]);

                if (signal.aborted) return;

                if (!pCoords || !dCoords) return;

                // Use EXPLICIT coordinates for Route API to ensure consistency with markers
                // The backend handles "lat,lng" format via regex
                // pCoords is { ltd, lng } or { lat, lng } depending on backend/frontend inconsistencies. 
                // Let's normalize. 
                // Backend getAddressCoordinate returns { ltd, lng }. MapController expects { lat, lng } or { ltd, lng }.
                const pLat = pCoords.ltd || pCoords.lat;
                const pLng = pCoords.lng;
                const dLat = dCoords.ltd || dCoords.lat;
                const dLng = dCoords.lng;

                const origin = `${pLat},${pLng}`;
                const dest = `${dLat},${dLng}`;

                 const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-route`, {
                    params: { origin, destination: dest },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    signal: signal // Pass signal to axios
                });

                if (signal.aborted) return;

                // Batch State Updates 
                setPickupCoords(pCoords);
                setDestinationCoords(dCoords);
                
                if (response.data && response.data.coordinates) {
                    const path = response.data.coordinates.map(coord => [coord[1], coord[0]]);
                    setRoutePath(path);
                }

            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Route fetch canceled');
                } else {
                    console.error("Error fetching route:", error);
                }
            }
        };

        fetchRoute();

        return () => abortController.abort();
    }, [pickup, destination, isSelecting]);

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={defaultCenter} // Initial static center, MapController handles dynamic updates
                zoom={15}
                className="w-full h-full"
                zoomControl={false}
            >
                {/* Dark Mode Tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <MapController
                    onCenterChange={onLocationSelect}
                    isSelecting={isSelecting}
                    bounds={routePath}
                    center={mapCenter}
                />

                {/* User Current Position */}
                {!isSelecting && currentPosition && (
                    <Marker position={currentPosition} icon={userIcon}>
                        <Popup>You</Popup>
                    </Marker>
                )}

                {/* Pickup Marker */}
                {pickupCoords && !isSelecting && (
                    <Marker position={[pickupCoords.ltd || pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon}>
                        <Popup>Pickup Location</Popup>
                    </Marker>
                )}

                {/* Destination Marker */}
                {destinationCoords && !isSelecting && (
                    <Marker position={[destinationCoords.ltd || destinationCoords.lat, destinationCoords.lng]} icon={destIcon}>
                        <Popup>Drop Location</Popup>
                    </Marker>
                )}

                {/* Driver Marker */}
                {driverLocation && (
                    <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
                )}

                {/* Route Polyline - Lime Color */}
                {routePath.length > 0 && !isSelecting && (
                    <Polyline positions={routePath} color="#84cc16" weight={5} opacity={0.8} />
                )}

            </MapContainer>

            {/* Selection Overlay */}
            {isSelecting && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
                    <div className="relative">
                        <MapPin size={40} className="text-lime-400 drop-shadow-xl animate-bounce-slow" fill="black" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/50 blur-sm rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LiveTracking
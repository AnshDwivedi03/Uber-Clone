import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RoutingMachine = ({ pickup, dropoff, updateTime }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickup.lat, pickup.lng),
                L.latLng(dropoff.lat, dropoff.lng)
            ],
            routeWhileDragging: false,
            show: false, // Hide the itinerary instructions
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#84cc16', weight: 4 }] // Lime-500
            }
        }).addTo(map);

        routingControl.on('routesfound', function (e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            console.log('Route Summary:', summary);
            updateTime && updateTime({
                distance: summary.totalDistance, // in meters
                time: summary.totalTime // in seconds
            });
        });

        return () => map.removeControl(routingControl);
    }, [map, pickup, dropoff, updateTime]);

    return null;
};

const LiveTrackingMap = ({ pickup, dropoff, captainLocation, updateTime }) => {
    // Default to a central location if no props (e.g., Delhi)
    const defaultCenter = [28.6139, 77.2090];
    
    return (
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Render Routing if we have both points */}
            {pickup && dropoff && (
                <RoutingMachine pickup={pickup} dropoff={dropoff} updateTime={updateTime} />
            )}

            {/* Captain Marker */}
            {captainLocation && (
                <Marker position={[captainLocation.lat, captainLocation.lng]}>
                    <Popup>Captain is here</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default LiveTrackingMap;

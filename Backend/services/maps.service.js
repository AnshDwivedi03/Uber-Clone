const axios = require('axios');
const captainModel = require('../models/captain.model');
const redisService = require('./redis.service');

module.exports.getAddressCoordinate = async (address) => {
    // Check if address is a coordinate pair "lat, lng"
    const coordinateRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = address.match(coordinateRegex);
    if (match) {
        return {
            ltd: parseFloat(match[1]),
            lng: parseFloat(match[3])
        };
    }

    // Check Cache
    const cacheKey = `maps:geocode:${address}`;
    const cached = await redisService.get(cacheKey);
    if (cached) return cached;

    // Using Nominatim API (OpenStreetMap)
    // Note: User-Agent is required by Nominatim's usage policy
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'UberCloneApp/1.0' // Generic user agent
            }
        });

        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            const result = {
                ltd: parseFloat(location.lat),
                lng: parseFloat(location.lon)
            };
            // Cache for 30 days
            await redisService.set(cacheKey, result, 30 * 24 * 60 * 60);
            return result;
        } else {
            console.warn('Nominatim returned no results for address:', address);
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error('Nominatim API Error:', error.message);
        throw error;
    }
}

module.exports.getAddressFromCoordinates = async (lat, lng) => {
    if (!lat || !lng) throw new Error('Latitude and longitude are required');

    // Check Cache
    const cacheKey = `maps:rev_geocode:${lat}:${lng}`;
    const cached = await redisService.get(cacheKey);
    if (cached) return cached;

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'UberCloneApp/1.0'
            }
        });

        if (response.data && response.data.display_name) {
            const address = response.data.display_name;
            // Cache for 30 days
            await redisService.set(cacheKey, address, 30 * 24 * 60 * 60);
            return address;
        } else {
            throw new Error('Unable to fetch address');
        }
    } catch (error) {
        console.error('Nominatim Reverse Geo Error:', error.message);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    // 1. Get coordinates for origin
    const originCoords = await module.exports.getAddressCoordinate(origin);
    // 2. Get coordinates for destination
    const destinationCoords = await module.exports.getAddressCoordinate(destination);

    // 3. Use OSRM for distance and time
    // OSRM format: /route/v1/driving/lon1,lat1;lon2,lat2
    const url = `http://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.ltd};${destinationCoords.lng},${destinationCoords.ltd}?overview=false`;

    try {
        const response = await axios.get(url);
        if (response.data.code === 'Ok') {
            const route = response.data.routes[0];
            const distanceInMeters = route.distance;
            const durationInSeconds = route.duration;

            // Convert to format expected by controller (mimicking Google API structure)
            return {
                distance: {
                    text: (distanceInMeters / 1000).toFixed(1) + ' km',
                    value: distanceInMeters
                },
                duration: {
                    text: Math.round(durationInSeconds / 60) + ' mins',
                    value: durationInSeconds
                }
            };
        } else {
             throw new Error('Unable to fetch distance and time');
        }

    } catch (err) {
        console.error('OSRM Error:', err.message);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    // Check Cache
    const cacheKey = `maps:autocomplete:${input}`;
    const cached = await redisService.get(cacheKey);
    if (cached) return cached;

    // Using Nominatim for autocomplete-like suggestions
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'UberCloneApp/1.0'
            }
        });
        if (response.data) {
            // Map Nominatim results to generic description strings
            const suggestions = response.data.map(prediction => prediction.display_name);
            // Cache for 24 hours
            await redisService.set(cacheKey, suggestions, 24 * 60 * 60);
            return suggestions;
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {

    // radius in km
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[ltd, lng], radius / 6371]
            }
        }
    });

    return captains;
}

module.exports.getRoute = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    // 1. Get coordinates
    const originCoords = await module.exports.getAddressCoordinate(origin);
    const destinationCoords = await module.exports.getAddressCoordinate(destination);

    // 2. Call OSRM
    const url = `http://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.ltd};${destinationCoords.lng},${destinationCoords.ltd}?overview=full&geometries=geojson`;

    try {
        const response = await axios.get(url);
        if (response.data.code === 'Ok') {
            return response.data.routes[0].geometry; // GeoJSON LineString
        } else {
            throw new Error('Unable to fetch route');
        }
    } catch (err) {
        console.error('OSRM Route Error:', err);
        throw err;
    }
}
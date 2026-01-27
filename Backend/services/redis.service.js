const redis = require('redis');

let redisClient = null;

const connectToRedis = async () => {
    if (redisClient && redisClient.isOpen) return;

    redisClient = redis.createClient({
        url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
    redisClient.on('connect', () => console.log('✅ Connected to Redis'));

    await redisClient.connect();
};

const updateCaptainLocation = async (captainId, lat, lng) => {
    if (!redisClient) await connectToRedis();
    // GEOADD key longitude latitude member
    await redisClient.geoAdd('active-captains', {
        longitude: lng,
        latitude: lat,
        member: captainId.toString()
    });
    // Set expiry for safety (e.g., 1 hour if no update) - specialized logic may be needed
    // but geo keys are single zset, so we can't expire individual members easily.
    // Instead we rely on 'remove' when offline.
};

const getCaptainsNearby = async (lat, lng, radiusKm = 5) => {
    if (!redisClient) await connectToRedis();
    // GEORADIUS key longitude latitude radius unit
    // In newer Redis versions, use geoSearch
    const results = await redisClient.geoSearch('active-captains', {
        longitude: lng,
        latitude: lat
    }, {
        radius: radiusKm,
        unit: 'km'
    }, {
        SORT: 'ASC' // Nearest first
    });
    return results; // Returns array of captainIds
};

const removeCaptainLocation = async (captainId) => {
    if (!redisClient) await connectToRedis();
    await redisClient.zRem('active-captains', captainId.toString());
};

module.exports = {
    connectToRedis,
    updateCaptainLocation,
    getCaptainsNearby,
    removeCaptainLocation,
    redisClient // Export if raw access needed
};

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
    console.log(`Redis: Updating location for ${captainId} at ${lat}, ${lng}`);
    await redisClient.geoAdd('active-captains', {
        longitude: lng,
        latitude: lat,
        member: captainId.toString()
    });
};

const getCaptainsNearby = async (lat, lng, radiusKm = 5) => {
    if (!redisClient) await connectToRedis();
    console.log(`Redis: Searching nearby captains at ${lat}, ${lng} radius ${radiusKm}km`);
    
    // Debug: Check if any captains exist
    // const count = await redisClient.zCard('active-captains');
    // console.log(`Redis: Total active captains: ${count}`);

    const results = await redisClient.geoSearch('active-captains', {
        longitude: lng,
        latitude: lat
    }, {
        radius: radiusKm,
        unit: 'km'
    }, {
        SORT: 'ASC' // Nearest first
    });
    console.log(`Redis: Search results:`, results);
    return results; // Returns array of captainIds
};

const removeCaptainLocation = async (captainId) => {
    if (!redisClient) await connectToRedis();
    await redisClient.zRem('active-captains', captainId.toString());
};

// Generic Cache Methods
const set = async (key, value, ttlSeconds = 3600) => {
    if (!redisClient) await connectToRedis();
    await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds
    });
};

const get = async (key) => {
    if (!redisClient) await connectToRedis();
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
};

module.exports = {
    connectToRedis,
    updateCaptainLocation,
    getCaptainsNearby,
    removeCaptainLocation,
    set,
    get,
    redisClient // Export if raw access needed
};

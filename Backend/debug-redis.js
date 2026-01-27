const redis = require('redis');

async function debugRedis() {
    const client = redis.createClient({
        url: 'rediss://default:AYwpAAIncDJkOGMxNTY0ODA4NTg0ZjEyYTBjZDBiY2E4ZWQ2NGI4ZXAyMzU4ODE@proud-leech-35881.upstash.io:6379'
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();
    console.log('Connected to Redis');

    const key = 'active-captains';

    // 1. Check if key exists and type
    const type = await client.type(key);
    console.log(`Key '${key}' type: ${type}`);

    if (type === 'zset') {
        // 2. List all members
        const members = await client.zRangeWithScores(key, 0, -1);
        console.log(`Total active captains: ${members.length}`);
        
        for (const member of members) {
            console.log(`- Member: ${member.value}, Score (GeoHash): ${member.score}`);
            // Get Coords
            const pos = await client.geoPos(key, member.value);
            console.log(`  Position:`, pos);
        }

        // 3. Try a manual search near the Rider's coordinates (from previous logs)
        // Rider: 28.4578579, 77.5061873
        const riderLat = 28.4578579;
        const riderLng = 77.5061873;
        
        console.log(`\nTest Search near ${riderLat}, ${riderLng} (Radius 5km) MATCHING APP SYNTAX...`);
        const searchRes = await client.geoSearch(key, {
            latitude: riderLat,
            longitude: riderLng
        }, {
            radius: 5,
            unit: 'km'
        }, {
            SORT: 'ASC'
        });
        console.log('Search Results:', searchRes);
    } else {
        console.log('Key does not exist or is not a zset/geo');
    }

    await client.disconnect();
}

debugRedis().catch(console.error);

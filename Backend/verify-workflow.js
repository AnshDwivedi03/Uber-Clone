const amqp = require('amqplib');
const redis = require('redis');
require('dotenv').config();

async function verify() {
    console.log('Verifying Infrastructure...');

    try {
        // 1. Redis
        console.log('Checking Redis...');
        const redisUrl = process.env.REDIS_URL;
        console.log('Redis URL:', redisUrl ? redisUrl.replace(/:[^:@]*@/, ':****@') : 'Undefined');

        const redisClient = redis.createClient({
            url: redisUrl || 'redis://localhost:6379',
            socket: {
                tls: redisUrl && redisUrl.startsWith('rediss://'),
                rejectUnauthorized: false // Fix for self-signed certs if any
            }
        });

        redisClient.on('error', err => console.error('Redis Client Error:', err.message));
        await redisClient.connect();
        console.log('Redis Connected ✅');
        await redisClient.disconnect();
    } catch (e) {
        console.error('Redis Failed ❌', e.message);
    }

    try {
        // 2. RabbitMQ
        console.log('Checking RabbitMQ...');
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        const channel = await connection.createChannel();
        console.log('RabbitMQ Connected ✅');

        await channel.assertExchange('uber_exchange', 'direct', { durable: true });
        console.log('Exchange Checked ✅');

        await connection.close();
    } catch (e) {
        console.error('RabbitMQ Failed ❌', e.message);
        console.log('Make sure docker-compose up is running!');
    }
}

verify();

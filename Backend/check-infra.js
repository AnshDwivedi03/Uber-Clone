const amqp = require('amqplib');
const redis = require('redis');

async function checkInfra() {
    console.log('Checking Infrastructure...');
    let rabbitStatus = 'FAIL';
    let redisStatus = 'FAIL';

    // Check RabbitMQ
    try {
        const connection = await amqp.connect('amqp://localhost');
        console.log('RabbitMQ Connected!');
        rabbitStatus = 'OK';
        await connection.close();
    } catch (error) {
        console.log('RabbitMQ Connection Failed:', error.message);
    }

    // Check Redis
    try {
        const client = redis.createClient();
        client.on('error', (err) => console.log('Redis Error', err));
        await client.connect();
        console.log('Redis Connected!');
        redisStatus = 'OK';
        await client.disconnect();
    } catch (error) {
        console.log('Redis Connection Failed:', error.message);
    }

    console.log(`\nSummary:\nRabbitMQ: ${rabbitStatus}\nRedis: ${redisStatus}`);
    if (rabbitStatus === 'FAIL' || redisStatus === 'FAIL') {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

checkInfra();

const amqp = require('amqplib');

let connection = null;
let channel = null;
let connectionPromise = null;

const connectToRabbitMQ = async () => {
    if (connection) return;
    if (connectionPromise) return connectionPromise;

    connectionPromise = (async () => {
        try {
            console.log('Connecting to RabbitMQ...');
            console.log('URL available:', !!process.env.RABBITMQ_URL);
            const conn = await amqp.connect(process.env.RABBITMQ_URL);
            
            conn.on('error', (err) => {
                console.error('RabbitMQ Connection Error:', err);
                connection = null;
                channel = null;
                connectionPromise = null;
            });

            conn.on('close', () => {
                 console.log('RabbitMQ Connection Closed');
                 connection = null;
                 channel = null;
                 connectionPromise = null;
            });

            connection = conn;
            channel = await connection.createChannel();
            await channel.assertQueue('ride-requests', { durable: true });
            console.log('✅ Connected to RabbitMQ');
        } catch (error) {
            console.error('❌ RabbitMQ Connection Failed:', error.message);
            connectionPromise = null; 
            throw error; 
        }
    })();

    return connectionPromise;
};

const publishToQueue = async (queueName, data) => {
    try {
        if (!channel) await connectToRabbitMQ();
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
    } catch (error) {
        console.error('Failed to send message to RabbitMQ:', error.message);
    }
};

const consumeQueue = async (queueName, callback) => {
    try {
        if (!channel) await connectToRabbitMQ();
        await channel.consume(queueName, (msg) => {
            if (msg !== null) {
                try {
                     const data = JSON.parse(msg.content.toString());
                     callback(data);
                     channel.ack(msg);
                } catch(err) {
                     console.error("Error processing message:", err);
                     channel.nack(msg); 
                }
            }
        });
        console.log(`📥 Listening on ${queueName}`);
    } catch (error) {
        console.error('Failed to consume message from RabbitMQ:', error.message);
    }
};

module.exports = {
    connectToRabbitMQ,
    publishToQueue,
    consumeQueue
};

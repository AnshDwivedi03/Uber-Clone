const amqp = require('amqplib');

let connection = null;
let channel = null;

const connectToRabbitMQ = async () => {
    try {
        if (connection) return; // Already connected
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('ride-requests', { durable: true });
        console.log('✅ Connected to RabbitMQ');
    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', error);
    }
};

const publishToQueue = async (queueName, data) => {
    if (!channel) await connectToRabbitMQ();
    try {
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
        // console.log(`📤 Message sent to ${queueName}`);
    } catch (error) {
        console.error('Failed to send message to RabbitMQ:', error);
    }
};

const consumeQueue = async (queueName, callback) => {
    if (!channel) await connectToRabbitMQ();
    try {
        await channel.consume(queueName, (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                callback(data);
                channel.ack(msg);
            }
        });
        console.log(`📥 Listening on ${queueName}`);
    } catch (error) {
        console.error('Failed to consume message from RabbitMQ:', error);
    }
};

module.exports = {
    connectToRabbitMQ,
    publishToQueue,
    consumeQueue
};

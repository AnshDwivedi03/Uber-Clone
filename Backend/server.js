const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket');
const port = process.env.PORT || 3000;

const { connectToRabbitMQ } = require('./services/rabbitmq.service');
const { connectToRedis } = require('./services/redis.service');

// Handle uncaught exceptions to prevent server crash from library bugs (e.g. amqplib)
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
    // Do not exit process, to attempt recovery
});

const startServer = async () => {
    try {
        await connectToRabbitMQ();
        console.log('RabbitMQ initialized');
        await connectToRedis();
        console.log('Redis initialized');

        const server = http.createServer(app);
        initializeSocket(server);

        const captainService = require('./services/captain.service');
        captainService.subscribeToRideRequests();

        const rideService = require('./services/ride.service');
        rideService.subscribeToRideAccepted();

        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
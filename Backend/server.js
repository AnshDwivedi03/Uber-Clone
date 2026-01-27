const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket');
const port = process.env.PORT || 3000;

const { connectToRabbitMQ } = require('./services/rabbitmq.service');
const { connectToRedis } = require('./services/redis.service');

connectToRabbitMQ();
connectToRedis();

const server = http.createServer(app);

initializeSocket(server);

const captainService = require('./services/captain.service');
captainService.subscribeToRideRequests();

const rideService = require('./services/ride.service');
rideService.subscribeToRideAccepted();

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
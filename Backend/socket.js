const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');
const { publishToQueue, consumeQueue } = require('./services/rabbitmq.service');
const { updateCaptainLocation, getCaptainsNearby, removeCaptainLocation } = require('./services/redis.service');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join', async (data) => {
            const { userId, userType } = data;
            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
            }
        });

        // --- CAPTAIN EVENTS ---
        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;
            if (!location || !location.ltd || !location.lng) return;

            await updateCaptainLocation(userId, location.ltd, location.lng);
        });

        socket.on('go-offline', async (data) => {
            const { userId } = data;
            await removeCaptainLocation(userId);
            await captainModel.findByIdAndUpdate(userId, { isOnline: false });
        });

        socket.on('go-online', async (data) => {
            const { userId } = data;
            await captainModel.findByIdAndUpdate(userId, { isOnline: true });
        });

        // --- RIDER EVENTS ---
        socket.on('ride-request', async (rideData) => {
            try {
                const { pickup, drop, bid, vibe, userId } = rideData;
                console.log('Ride Requested:', rideData);
                await publishToQueue('ride-requests', { ...rideData, socketId: socket.id });
            } catch (e) {
                console.error("Ride Request Error", e);
            }
        });

        // --- BIDDING & ACCEPTANCE EVENTS ---

        // Captain accepts the ride request directly
        socket.on('captain-accept-ride', async (data) => {
            // data: { rideId, riderId, captainId }
            console.log('Captain accepted ride:', data);

            // Check if ride is still available (omitted for brevity, assume yes)

            // Notify Rider
            const rider = await userModel.findById(data.riderId);
            if (rider && rider.socketId) {
                const otp = Math.floor(1000 + Math.random() * 9000);
                io.to(rider.socketId).emit('ride-confirmed', {
                    captainId: data.captainId,
                    rideId: data.rideId,
                    otp,
                    // Add captain details lookup here if needed
                });
            }
        });

        // Driver counters with a bid
        socket.on('make-bid', async (data) => {
            // data: { rideId, riderId, amount, captainId }
            console.log('Captain made bid:', data);

            // Emit to specific rider
            const riderElement = await userModel.findById(data.riderId);
            if (riderElement && riderElement.socketId) {
                io.to(riderElement.socketId).emit('ride-bid-received', {
                    captainId: data.captainId,
                    amount: data.amount,
                    ...data.captainDetails
                });
            }
        });

        // Rider accepts a specific captain's bid (or original fare)
        socket.on('accept-bid', async (data) => {
            // data: { rideId, captainId, amount }
            console.log('Rider accepted bid:', data);

            const captain = await captainModel.findById(data.captainId);
            if (captain && captain.socketId) {
                // Notify Captain
                io.to(captain.socketId).emit('ride-confirmed', {
                    rideId: data.rideId,
                    pickup: data.pickup,
                    drop: data.drop,
                    fare: data.amount,
                    riderDetails: data.riderDetails
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    // START WORKER TO CONSUME RIDE REQUESTS
    consumeQueue('ride-requests', async (data) => {
        console.log('Worker: Processing ride request', data);
        const { pickup, drop, userId, socketId } = data; // pickup has { lat, lng }

        // Find Captains nearby via Redis
        const validCaptains = await getCaptainsNearby(pickup.lat, pickup.lng, 5);

        console.log(`Found ${validCaptains.length} captains nearby`);

        validCaptains.forEach(async (captainId) => {
            const captain = await captainModel.findById(captainId);
            if (captain && captain.socketId) {
                io.to(captain.socketId).emit('new-ride', {
                    pickup,
                    drop,
                    fare: data.bid,
                    vibe: data.vibe,
                    rideId: 'temp_id_for_bidding',
                    riderId: userId
                });
            }
        });
    });
};

const sendMessageToSocketId = (socketId, messageObject) => {
    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
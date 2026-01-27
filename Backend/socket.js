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
            const { userId, location, rideId, riderId } = data; // Added rideId, riderId
            if (!location || !location.ltd || !location.lng) {
                return;
            }
            // console.log(`Updating location for captain ${userId}: ${location.ltd}, ${location.lng}`);
            await updateCaptainLocation(userId, location.ltd, location.lng);
            
            // Re-emit to the specific Rider
            if (riderId) {
                const rider = await userModel.findById(riderId);
                if (rider && rider.socketId) {
                    io.to(rider.socketId).emit('captain-location-update', {
                         lat: location.ltd,
                         lng: location.lng,
                         captainId: userId,
                         rideId: rideId
                    });
                }
            }
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
                
                // Ensure there is a rideId
                const rideId = rideData.rideId || rideData._id || new Date().getTime().toString(); 
                
                await publishToQueue('ride-requests', { ...rideData, socketId: socket.id, _id: rideId });
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
                    rideId: data.rideId,
                    ...data.captainDetails
                });
            }
        });

        // Rider accepts a specific captain's bid (or original fare)
        socket.on('accept-bid', async (data) => {
            // data: { rideId, captainId, amount }
            console.log('Rider accepted bid:', data);

            try {
                // 1. Update DB to confirm the ride
                const ride = await rideModel.findOneAndUpdate({
                    _id: data.rideId
                }, {
                    status: 'accepted',
                    captain: data.captainId,
                    'fare.finalFare': data.amount // Store agreed fare? Or update initialBid? Let's assume finalFare/amount
                }, { new: true });

                if (!ride) {
                    console.error('Ride not found during accept-bid:', data.rideId);
                    return;
                }

                // 2. Fetch full details for Frontend
                const rideWithDetails = await rideModel.findOne({
                    _id: data.rideId
                }).populate('rider').populate('captain').select('+otp');

                // 3. Notify Captain with FULL PAYLOAD
                if (rideWithDetails.captain && rideWithDetails.captain.socketId) {
                    
                    // Simple Flattening for Frontend
                    const rideForFrontend = {
                        ...rideWithDetails.toObject(),
                        pickup: rideWithDetails.pickup.address,
                        destination: rideWithDetails.drop.address,
                        fare: data.amount, // Use the accepted amount
                        user: rideWithDetails.rider // MAPPED
                    };

                    io.to(rideWithDetails.captain.socketId).emit('ride-confirmed', rideForFrontend);
                }

                 // 4. Notify Rider (Self-Confirmation)
                if (rideWithDetails.rider && rideWithDetails.rider.socketId) {
                     const rideForFrontend = {
                        ...rideWithDetails.toObject(),
                        pickup: rideWithDetails.pickup.address,
                        destination: rideWithDetails.drop.address,
                        fare: data.amount,
                        user: rideWithDetails.rider
                    };
                    io.to(rideWithDetails.rider.socketId).emit('ride-confirmed', rideForFrontend);
                }

            } catch (err) {
                console.error('Error handling accept-bid:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    // START WORKER TO CONSUME RIDE REQUESTS
    // Consuming here caused double consumption and errors because pickup is a string, not coords.
    // Logic is handled in services/captain.service.js instead.
    /*
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
    */
};

const sendMessageToSocketId = (socketId, messageObject) => {
    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
Demo Accounts for sigin 

Captain
mail:- tt@gmail.com
pass:- 123456

Rider
mail:- dd@gmail.com
pass:- 123456

Demo video  ::  https://drive.google.com/file/d/1JIKf1xRW9nbr78nMnIQ862HCEzJ9_-ml/view?usp=sharing

# Visual Code Flow Diagrams

## 🎬 Complete Execution Timeline

### When You Run: `node server.js`

```
TIME 0ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Node.js starts
  ↓
Loads server.js
  ├─ require('http')
  ├─ require('./app')  ← This immediately runs app.js
  │  ├─ dotenv.config() → Load .env
  │  ├─ require('./db/db').connectToDb() → Connects to MongoDB
  │  ├─ Register middleware (cors, json, etc)
  │  ├─ Register routes
  │  └─ Export Express app
  │
  ├─ require('./socket')
  ├─ connectToRabbitMQ() → Background connection to RabbitMQ
  ├─ connectToRedis() → Background connection to Redis
  ├─ http.createServer(app)
  ├─ initializeSocket(server) → Socket.io ready
  ├─ captainService.subscribeToRideRequests() → Listening to queue
  ├─ rideService.subscribeToRideAccepted() → Listening to queue
  └─ server.listen(3000) ← SERVER READY! ✅

TIME 500ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MongoDB connected ✅
  └─ Console: "Connected to DB"

RabbitMQ connected ✅
  └─ Console: "✅ Connected to RabbitMQ"

Redis connected ✅
  └─ Console: "✅ Connected to Redis"

Server listening ✅
  └─ Console: "Server is running on port 3000"

READY FOR REQUESTS! 🚀
```

---

## 👥 User Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER REGISTRATION FLOW - What happens when user clicks "Sign Up" │
└─────────────────────────────────────────────────────────────────┘

Frontend (React)
│
├─ User fills form:
│  ├─ First name: "John"
│  ├─ Last name: "Doe"
│  ├─ Email: "john@gmail.com"
│  └─ Password: "password123"
│
├─ User clicks "Register"
│
├─ Sends: POST http://localhost:3000/users/register
│  └─ Body: { fullname: {firstname, lastname}, email, password }
│
▼
Express Server (app.js)
│
├─ Middleware: cors()
├─ Middleware: express.json() ← Parses request body
├─ Middleware: cookieParser()
│
├─ Routes handler: userRoutes
│  └─ Matches: POST /users/register
│
▼
Validation (express-validator)
│
├─ Check: email is valid email format
├─ Check: firstname minimum 3 characters
├─ Check: password minimum 6 characters
│
├─ If validation fails:
│  └─ Response: 400 Bad Request { errors: [...] }
│     EXIT
│
▼
Controller: userController.registerUser()
│
├─ Extract from request:
│  ├─ fullname = { firstname: "John", lastname: "Doe" }
│  ├─ email = "john@gmail.com"
│  └─ password = "password123"
│
├─ Query MongoDB:
│  └─ Check if user with this email already exists
│
├─ If exists:
│  └─ Response: 400 { message: "User already exist" }
│     EXIT
│
├─ Hash password:
│  └─ bcrypt.hash("password123", 10)
│     Returns: "$2b$10$..." (looks random, irreversible)
│
▼
Service: userService.createUser()
│
├─ Validate required fields
│
├─ Call MongoDB:
│  └─ db.users.create({
│      fullname: { firstname: "John", lastname: "Doe" },
│      email: "john@gmail.com",
│      password: "$2b$10$..." (hashed)
│     })
│
├─ MongoDB generates:
│  └─ _id: ObjectId("507f1f77bcf86cd799439011")
│
├─ Returns user object with _id
│
▼
Back to Controller
│
├─ Generate JWT token:
│  └─ jwt.sign(
│      { _id: "507f1f77bcf86cd799439011" },
│      process.env.JWT_SECRET,
│      { expiresIn: '24h' }
│     )
│     Returns: "eyJhbGciOiJIUzI1NiIsInR5c..." (long string)
│
├─ Send response to frontend:
│  └─ Status: 201 Created
│     Body: {
│       token: "eyJhbGciOiJIUzI1NiIsInR5c...",
│       user: {
│         _id: "507f1f77bcf86cd799439011",
│         email: "john@gmail.com",
│         fullname: { firstname: "John", lastname: "Doe" }
│       }
│     }
│
▼
Frontend (React)
│
├─ Receive response
├─ Store token in localStorage
├─ Redirect to home page
└─ User logged in! ✅
```

---

## 🚗 Ride Request Flow - Complete

```
┌──────────────────────────────────────────────────────────────────────┐
│  RIDE REQUEST - User requests a ride from A to B                     │
└──────────────────────────────────────────────────────────────────────┘

TIME: 00:00
──────────────────────────────────────────────────────────────────────

USER'S PHONE (Frontend)
│
├─ User opens app
├─ Enters pickup: "123 Main Street"
├─ Enters drop: "456 Market Street"
├─ Selects vehicle type: "Auto"
└─ Clicks "Request Ride"

│
│ socket.emit('ride-request', {
│   pickup: '123 Main Street',
│   drop: '456 Market Street',
│   userId: 'user_507f1f77',
│   vehicleType: 'auto'
│ })
│
▼

SERVER - socket.js
│
├─ socket.on('ride-request') event received
│
├─ publishToQueue('ride-requests', {
│   pickup: '123 Main Street',
│   drop: '456 Market Street',
│   userId: 'user_507f1f77',
│   vehicleType: 'auto',
│   socketId: 'socket_abc123'  ← For notifications
│ })
│
▼

RABBITMQ (Message Queue)
│
├─ Message arrives in 'ride-requests' queue
├─ Stored durably
├─ Waiting to be processed
│
▼

TIME: 00:05 (5 milliseconds later)

CAPTAIN SERVICE - Consuming from queue
│
├─ Captain service picks up message from queue
│
├─ 1️⃣ Get pickup coordinates:
│   mapService.getAddressCoordinate('123 Main Street')
│   ↓
│   Calls: Nominatim API
│   Returns: { ltd: 37.7899, lng: -122.3993 }
│
├─ 2️⃣ Query Redis for nearby captains:
│   redisService.getCaptainsNearby(37.7899, -122.3993, 5km)
│   ↓
│   Redis GEOSEARCH 'active-captains'
│   Returns: [
│     'captain_001' (1.2 km away),
│     'captain_002' (2.8 km away),
│     'captain_003' (4.5 km away)
│   ]
│
├─ 3️⃣ Get captain details from MongoDB:
│   captainModel.find({
│     _id: { $in: ['captain_001', 'captain_002', 'captain_003'] },
│     status: 'active'
│   })
│   ↓
│   Returns full captain objects with socketId:
│   [
│     { _id: 'captain_001', name: 'John', socketId: 'socket_123', ... },
│     { _id: 'captain_002', name: 'Sarah', socketId: 'socket_456', ... }
│   ]
│
├─ 4️⃣ Send notifications to each captain:
│   For each captain:
│     io.to(captain.socketId).emit('new-ride', {
│       pickup: '123 Main Street',
│       drop: '456 Market Street',
│       fare: 45,
│       ...
│     })
│
▼

TIME: 00:10

CAPTAINS' PHONES (Frontend)
│
├─ Captain 1 receives 'new-ride' event
│  ├─ Sound: 🔔 (notification)
│  ├─ Popup: "New Ride Available"
│  ├─ Shows: Pickup address, Drop address, Estimated fare $45
│  └─ Buttons: "Accept" or "Decline"
│
└─ Captain 2 receives same notification

│
│ → Captain 1 clicks "ACCEPT"
│
│ socket.emit('captain-accept-ride', {
│   rideId: 'ride_xyz',
│   riderId: 'user_507f1f77',
│   captainId: 'captain_001'
│ })
│
▼

SERVER - socket.js
│
├─ socket.on('captain-accept-ride') event received
│
├─ Query MongoDB to get rider's socketId:
│   userModel.findById('user_507f1f77')
│   Returns: { socketId: 'socket_rider_789', ... }
│
├─ Generate OTP:
│   otp = Math.random() → 4-digit code → 3824
│
├─ Save to ride document:
│   rideModel.updateOne({
│     _id: 'ride_xyz',
│     status: 'accepted',
│     captain: 'captain_001',
│     otp: '3824'
│   })
│
├─ Send notification to rider:
│   io.to('socket_rider_789').emit('ride-confirmed', {
│     captainId: 'captain_001',
│     captainName: 'John',
│     rideId: 'ride_xyz',
│     otp: '3824'
│   })
│
├─ Send notification to captain:
│   io.to('socket_123').emit('ride-accepted', {
│     riderId: 'user_507f1f77',
│     riderName: 'Alice',
│     pickup: '123 Main Street'
│   })
│
▼

TIME: 00:15

USER'S PHONE
│
├─ Notification: ✅ Ride Confirmed!
├─ Shows: Captain "John" is coming
├─ Shows: Vehicle "Blue Sedan, ABC-1234"
├─ Shows: OTP to verify: 3824
├─ Status: Waiting for Captain
│
▼ (Captain drives to pickup location)

TIME: 02:30 (2.5 minutes later)

CAPTAIN ARRIVES AT PICKUP
│
├─ Captain clicks "Arrived"
│
├─ User sees: "Captain is here! Enter OTP to start ride"
├─ User enters: 3824
│
│ POST /rides/confirm
│ Body: { rideId: 'ride_xyz', otp: '3824' }
│
▼

SERVER - ride.controller.js
│
├─ Verify OTP:
│   if (ride.otp !== enteredOtp) error
│   ✓ OTP matches!
│
├─ Update ride status:
│   rideModel.updateOne({
│     _id: 'ride_xyz',
│     status: 'ongoing',
│     otp: null  ← Clear OTP
│   })
│
├─ Notify both:
│   io.emit('ride-started', { message: 'Ride started!' })
│
▼

TIME: 02:31

BOTH PHONES
│
├─ User: Sees live location of captain on map
├─ Captain: Starts navigation to destination
├─ System: Tracks trip in real-time
│
▼ (Ride continues for 8 minutes...)

TIME: 10:30 (when ride ends)

CAPTAIN ARRIVES AT DESTINATION
│
├─ Captain clicks "Complete Ride"
│
│ POST /rides/complete
│ Body: { rideId: 'ride_xyz' }
│
▼

SERVER - ride.controller.js
│
├─ Update ride:
│   rideModel.updateOne({
│     _id: 'ride_xyz',
│     status: 'completed',
│     finalFare: 45,
│     completedAt: now
│   })
│
├─ Update captain earnings:
│   captainModel.updateOne({
│     _id: 'captain_001',
│     $inc: { todayEarnings: 45 }  ← Add 45 to earnings
│   })
│
├─ Notify both:
│   io.emit('ride-completed', {
│     message: 'Ride completed!',
│     fare: 45,
│     rating: 'Please rate your experience'
│   })
│
▼

BOTH PHONES
│
├─ ✅ Ride Completed!
├─ Amount paid: $45
├─ Rating popup appears
└─ "Thank you for riding with us!"

END OF RIDE ✅ SUCCESS
```

---

## 🔐 Authentication & Authorization Flow

```
┌────────────────────────────────────────────────────────┐
│  JWT TOKEN AUTHENTICATION FLOW                         │
└────────────────────────────────────────────────────────┘

REGISTRATION/LOGIN
──────────────────

User logs in with email + password

│
▼
Server verifies credentials (password matches hashed)

│
▼
Server generates JWT token:
  Header: { alg: "HS256", typ: "JWT" }
  Payload: { _id: "user_507f1f77bcf86cd799439011", iat: 1234567890, exp: 1234654290 }
  Signature: HMACSHA256(header + payload, secret)

│
Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MDIwMDAwMDAsImV4cCI6MTYwMjA4NjQwMH0.signature"
│
▼
Send to Frontend

│
Frontend stores in: localStorage.token

ACCESSING PROTECTED ROUTES
──────────────────────────

User wants to: GET /users/profile

│
├─ Read token from localStorage
├─ Send: Authorization: Bearer <token>
│
▼
Express Server

├─ Middleware: authUser runs FIRST
│
├─ Extract token from header:
│  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
│
├─ Check if token is blacklisted:
│  blackListTokenModel.findOne({ token })
│  If found: ❌ Return 401 Unauthorized (user logged out)
│
├─ Verify token:
│  jwt.verify(token, process.env.JWT_SECRET)
│
│  Checks:
│  1. Signature is valid (hasn't been tampered with)
│  2. Token hasn't expired (24 hours)
│  3. Format is correct
│
├─ If valid:
│  decoded = { _id: "507f1f77bcf86cd799439011", iat, exp }
│  Fetch: user = userModel.findById("507f1f77bcf86cd799439011")
│  req.user = user ← Attach to request
│  next() ← Continue to controller
│
├─ If invalid/expired:
│  ❌ Return 401 Unauthorized
│
▼
Controller runs (if middleware passed)

├─ Can access req.user (the authenticated user)
└─ res.json(req.user) ← Return user data

LOGOUT
──────

User clicks "Logout"

│
GET /users/logout

│
▼
Middleware: authUser (verify token valid)

│
▼
Controller: logoutUser

├─ Extract token
├─ Add to blacklist:
│  blackListTokenModel.create({ token })
├─ Clear frontend localStorage
│
▼
Response: "Logged out successfully"

│
Next time user tries with same token:
  → Middleware finds it in blacklist
  → Returns 401 Unauthorized
  → User must login again

TOKEN STORAGE SECURITY
─────────────────────

Server:
├─ JWT_SECRET: Must be environment variable (never hardcode)
├─ Blacklist: Store in MongoDB for revocation
├─ HTTPS: Always use in production (not HTTP)

Frontend:
├─ localStorage: Easier to access, vulnerable to XSS
├─ sessionStorage: Clears when browser closes
├─ Cookie: Can be HttpOnly (not accessible from JS), more secure
└─ Best practice: HttpOnly secure cookie in production

PASSWORD SECURITY
─────────────────

Plain text password: "password123"
                ↓
bcrypt.hash(password, salt=10)
                ↓
Hashed: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/wFm"

Why bcrypt?
├─ One-way hash (can't reverse)
├─ Salt added (same password gives different hash)
├─ Slow by design (prevents brute force)
└─ Industry standard for password hashing
```

---

## 📊 Real-Time Location Updates Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CAPTAIN LOCATION TRACKING - Real-time GPS Updates          │
└─────────────────────────────────────────────────────────────┘

CAPTAIN GOES ONLINE
───────────────────

Captain logs in
        │
        ├─ Frontend connects via Socket.io
        │
        └─ socket.emit('join', { userId: 'captain_001', userType: 'captain' })
                   │
                   ▼
           Server updates database:
           captainModel.findByIdAndUpdate(
             'captain_001',
             { socketId: 'socket_abc123' }  ← Store connection ID
           )

LOCATION UPDATE (Every 5 seconds)
──────────────────────────────────

Captain's phone has GPS
        │
        ├─ Every 5 seconds:
        │  GPS reads current location: { latitude: 37.7899, longitude: -122.3993 }
        │
        └─ socket.emit('update-location-captain', {
             userId: 'captain_001',
             location: { ltd: 37.7899, lng: -122.3993 }
           })
                   │
                   ▼
           Server receives in socket.js
                   │
                   ├─ Validates coordinates
                   │
                   └─ await updateCaptainLocation(userId, lat, lng)
                       │
                       ▼
           Redis stores location:
           GEOADD 'active-captains'
             longitude: -122.3993
             latitude: 37.7899
             member: 'captain_001'
                       │
                       ✅ Location stored in Redis (instant!)

CAPTAIN GOES OFFLINE
─────────────────────

Captain clicks "Go Offline"
        │
        └─ socket.emit('go-offline', { userId: 'captain_001' })
                   │
                   ▼
           Server:
           1. Remove from Redis:
              ZREM 'active-captains' 'captain_001'
           
           2. Update database:
              captainModel.findByIdAndUpdate(
                'captain_001',
                { isOnline: false }
              )

HOW LOCATIONS ARE USED
──────────────────────

User requests ride at location: 37.79, -122.40

        │
        ▼
Captain Service runs:
        
        ├─ mapService.getAddressCoordinate('pickup address')
        │  └─ Returns pickup coordinates: 37.7899, -122.3993
        │
        ├─ redisService.getCaptainsNearby(37.7899, -122.3993, 5km)
        │  └─ GEOSEARCH 'active-captains'
        │     ├─ Center: 37.7899, -122.3993 (pickup)
        │     ├─ Radius: 5km
        │     └─ Returns captains sorted by distance:
        │        [
        │          'captain_001' (distance: 1.2 km),
        │          'captain_002' (distance: 2.8 km),
        │          'captain_003' (distance: 4.5 km)
        │        ]
        │
        └─ Get details from MongoDB and notify them

WHY REDIS FOR LOCATIONS?
─────────────────────────

MongoDB would work but:
  ✗ Query: db.captains.find({ 
      "location": { $near: [37.7899, -122.3993], $maxDistance: 5000 } 
    })
  ✗ Takes: 100-500ms (too slow for real-time)

Redis GEO commands:
  ✓ Query: GEOSEARCH 'active-captains' ... 
  ✓ Takes: 1-5ms (1000x faster!)
  ✓ Optimized for geographic data
  ✓ Perfect for finding nearby items

Hybrid approach:
  ├─ MongoDB: Persistent captain profile data
  ├─ Redis: Real-time location (updated every 5 seconds)
  └─ Best of both worlds!

EXAMPLE REDIS GEO COMMANDS
──────────────────────────

GEOADD active-captains -122.3993 37.7899 captain_001
       └─ Stores captain at longitude, latitude

GEOADD active-captains -122.5000 37.8000 captain_002
       └─ Stores another captain

GEOSEARCH active-captains 
  FROMMEMBER 37.7899 -122.3993 
  BYRADIUS 5 km
       └─ Finds all captains within 5km

Result: [ 'captain_001', 'captain_002', ... ]
```

---

## 💬 Data Types Flowing Through System

```
FROM FRONTEND (JSON)
│
├─ String: "123 Main Street"
├─ String: "john@gmail.com"
├─ Number: 37.7899
├─ Boolean: true
├─ Object: { pickup: "...", drop: "..." }
└─ Array: [ 1, 2, 3 ]

         ↓ HTTP/WebSocket

EXPRESS MIDDLEWARE
│
├─ req.body: Parsed JSON
├─ req.params: URL parameters
├─ req.query: Query string parameters
├─ req.headers: HTTP headers
├─ req.cookies: Cookie data
└─ req.user: Attached by middleware

         ↓ Process

JAVASCRIPT VARIABLES
│
├─ let, const, var
├─ Objects, Arrays
├─ Functions, Callbacks
├─ Promises, async/await
└─ Classes, Methods

         ↓ Serialize

STORAGE FORMAT
│
├─ MongoDB: BSON (Binary JSON)
│  └─ { _id: ObjectId, email: String, ... }
│
├─ Redis: Strings/Hashes/Sets/Sorted Sets
│  └─ member: captainId, longitude: -122.3, latitude: 37.7
│
├─ RabbitMQ: Binary Buffer
│  └─ Buffer.from(JSON.stringify(data))
│
└─ Cookies: String
   └─ "token=eyJhbGciOiJIUzI1NiI..."

         ↓ Retrieve/Process

JAVASCRIPT OBJECTS AGAIN
│
├─ Parse JSON: JSON.parse(bufferString)
├─ Transform: map, filter, reduce
├─ Validate: check types, ranges
└─ Format: Prepare for response

         ↓ Serialize

TO FRONTEND (JSON)
│
├─ { token: "...", user: { name: "John", email: "..." } }
├─ { success: true, data: [...] }
├─ { error: "Invalid email", code: 400 }
└─ { message: "Ride confirmed", otp: "3824" }

         ↓ HTTP Response

FRONTEND RECEIVES
│
├─ Parse JSON: response.json()
├─ Extract data
├─ Update state
├─ Re-render UI
└─ User sees update ✅
```

---



const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error');
const path = require('path'); // Import the path module

// Load env vars
dotenv.config({ path: './.env' });

// Create Express app
const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://your-flutter-app-ip:port',
    methods: ['GET', 'POST'],
}));

// Body parser
app.use(express.json());

// Route files
const auth = require('./routes/authRoutes');

// Mount routers
app.use('/api/auth', auth);

// Error handler middleware (should be after all routes)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log("There is new error here" + err));

// const PORT = process.env.PORT || 3000;

// const server = app.listen(
//     PORT,
//     console.log(`Server running on port ${PORT}`)
// );

const PORT = process.env.PORT || 3000;
const HOST = '192.168.1.10'; // Replace with your computer's IP
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));



// Routes
app.use('/api/orders', require('./routes/orderRoutes'));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/api/orders', (req, res) => {
    // Fetch orders from MongoDB
    const orders = [
        {
            _id: '680adf9a835d3963e1d6eb40',
            image: '/uploads/image-123456789.png',
            formDesc: 'hgg',
            date: '2001-09-08T21:00:00.000Z',
            time: '08:05',
            address: 'ggg',
            name: 'ggg',
            phone: '055666',
            isCraftAccept: false,
            isUserAccept: false,
            orderStatus: 'pending',
            createdAt: '2025-04-25T01:04:26.247Z',
            __v: 0,
        },
        // Other orders...
    ];

    res.json({
        success: true,
        data: orders,
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something broke!' });
});
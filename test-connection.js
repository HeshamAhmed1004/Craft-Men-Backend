const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/auth')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));
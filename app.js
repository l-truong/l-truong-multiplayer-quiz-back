const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { connectToMongoDB } = require('./config/db');
const categoryRoutes = require('./api/routes/categoryRoutes');
const questionRoutes = require('./api/routes/questionRoutes');
const roomRoutes = require('./api/routes/roomRoutes');

const app = express();

// Connect to MongoDB
connectToMongoDB();

// Middleware setup
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable CORS for all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Define route handlers
app.use('/categories', categoryRoutes);
app.use('/questions', questionRoutes);
app.use('/rooms', roomRoutes);

// General error handling middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({ error: { message: error.message } });
});

module.exports = app;
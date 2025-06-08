require('dotenv').config();
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
const express = require('express');
const morgan = require('morgan');
const { connectToMongoDB } = require('./services/db.js');
const authRoutes = require('./middlewares/authServer.js');
const userRoutes = require('./api/routes/userRoutes');
const categoryRoutes = require('./api/routes/categoryRoutes');
const questionRoutes = require('./api/routes/questionRoutes');
const roomRoutes = require('./api/routes/roomRoutes');

const app = express();

// Connect to MongoDB
connectToMongoDB();

// Middleware setup
app.use(morgan('dev'));

// Use express built-in body parsing with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

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
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/questions', questionRoutes);
app.use('/rooms', roomRoutes);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// 404 error handling middleware
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// General error handling middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({ error: { message: error.message } });
});

module.exports = app;
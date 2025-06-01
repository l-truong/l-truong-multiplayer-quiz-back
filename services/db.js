require('dotenv').config();
const { MONGO_PROTOCOL, MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_DATABASE, MONGO_OPTIONS_RETRY_WRITES, MONGO_OPTIONS_W } = process.env;
const mongoUri = `${MONGO_PROTOCOL}://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}/${MONGO_DATABASE}?retryWrites=${MONGO_OPTIONS_RETRY_WRITES}&w=${MONGO_OPTIONS_W}`;
const mongoose = require('mongoose');

function connectToMongoDB() {
    mongoose.connect(mongoUri)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch(err => {
            console.error('Error connecting to MongoDB:', err);
        });
}

module.exports = { connectToMongoDB };
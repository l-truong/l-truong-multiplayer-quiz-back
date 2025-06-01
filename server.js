require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket/socket');

// Set the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Create an HTTP server and pass the Express app to it
const server = http.createServer(app);
initSocket(server);
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
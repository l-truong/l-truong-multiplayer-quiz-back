// Core modules
const express = require('express');
// Custom middlewares and models
const authenticateToken = require('../../middlewares/authenticateToken');
const Room = require('../models/room');
// Router setup
const router = express.Router();

/********/
/* GET */
/********/

// Get all rooms
router.get('/', authenticateToken, async (req, res) => {
    try {
        const rooms = await Room.find();
        return res.json(rooms);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});


/********/
/* DELETE */
/********/

// Delete all rooms
router.delete('/all', authenticateToken, async (req, res) => {
    try {
        const result = await Room.deleteMany({});

        return res.json({
            message: 'All rooms deleted',
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        return res.status(500).json({
            message: 'An error occurred',
            error: err.message,
        });
    }
});

module.exports = router;
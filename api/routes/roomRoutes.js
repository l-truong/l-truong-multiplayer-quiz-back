const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer();
const Room = require('../models/room');

/********/
/* GET */
/********/

// Get all rooms
router.get('/', async (req, res) => {
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
router.delete('/all', async (req, res) => {
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
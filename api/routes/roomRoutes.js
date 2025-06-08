// Core modules
const express = require('express');
// Custom middlewares and models
const authenticateToken = require('../../middlewares/authenticateToken');
const Room = require('../models/room');
// Router setup
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: API for rooms
 */

/********/
/* GET */
/********/
/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Retrieve all rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 *                   example: Error message details
 */
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
/**
 * @swagger
 * /rooms/all:
 *   delete:
 *     summary: Delete all rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All rooms deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All rooms deleted
 *                 deletedCount:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 *                   example: Error message details
 */
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
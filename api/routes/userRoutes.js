require('dotenv').config();
const { USER_USERNAME_MIN_LENGTH, USER_USERNAME_MAX_LENGTH, USER_USERNAME_REGEX,
    USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_REGEX } = require('../../config/apiConfig');
// Core modules
const express = require('express');
// Custom middlewares and models
const authenticateToken = require('../../middlewares/authenticateToken');
const User = require('../models/user');
// Router setup
const router = express.Router();
// Import bcrypt for hashing and comparing passwords
const bcrypt = require('bcryptjs');
// Utility functions
const { checkMissingParams, checkInvalidTypes } = require('../../utils/validators');

const REQUIRED_PARAMS = ['username', 'password'];
const EXPECTED_TYPES = {
    username: 'string',
    password: 'string'
};

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for users
 */

/********/
/* GET */
/********/
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 60f7a1b2c1234d5678ef9012
 *                   username:
 *                     type: string
 *                     example: johndoe
 *                   email:
 *                     type: string
 *                     example: johndoe@example.com
 *                   role:
 *                     type: string
 *                     example: admin
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2023-01-01T12:00:00.000Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2023-02-01T12:00:00.000Z
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error message
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.find();
        return res.json(users);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

/********/
/* POST */
/********/
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User data to create a new user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username (letters, numbers, hyphens, underscores; length between USER_USERNAME_MIN_LENGTH and USER_USERNAME_MAX_LENGTH)
 *                 example: johndoe_123
 *               password:
 *                 type: string
 *                 description: Password (at least one uppercase, one lowercase, one number; length between USER_PASSWORD_MIN_LENGTH and USER_PASSWORD_MAX_LENGTH)
 *                 example: StrongPass123
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request - missing or invalid parameters or username already exists
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
 *                   example: Missing parameters / Parameters are in wrong formats / User already exists with this username
 *                 missing:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["username", "password"]
 *                 invalidParams:
 *                   type: object
 *                   example: { "username": "invalidUser" }
 *                 invalidFormat:
 *                   type: object
 *                   example: { "password": "weakpass" }
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error message
 */
router.post('/', authenticateToken, async (req, res) => {
    // Check for missing parameters
    const missingParams = checkMissingParams(req.body, REQUIRED_PARAMS);

    if (missingParams.length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Missing parameters',
            missing: missingParams
        });
    }

    // Check if parameters are  in valid format
    const invalidParams = checkInvalidTypes(req.body, EXPECTED_TYPES);

    if (Object.keys(invalidParams).length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Parameters are in wrong formats',
            invalidParams
        });
    }

    // Regex for username (no spaces, no special chars except _ and -)
    const usernameRegex = USER_USERNAME_REGEX;
    if (!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: `Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters long, and only contain letters, numbers, hyphens, and underscores`,
            invalidFormat: { username : req.body.username }
        });
    }

    // Regex for password (at least 8 chars, includes uppercase, lowercase, and a number, no spaces)
    const passwordRegex = USER_PASSWORD_REGEX;
    if (!passwordRegex.test(req.body.password)) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: `Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, and one number`,
            invalidFormat: { password : req.body.password }
        });
    }

    // Check if the user already exists by username
    const users = await User.find();
    const existingUser = users.find(user => user.username === req.body.username);
    if (existingUser) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'User already exists with this username',
            invalidParams: { username: req.body.username }
        });
    }

    const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUND, 10);
    const hashedPassword = await bcrypt.hash(req.body.password, bcryptSaltRounds);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    try {
        await user.save();
        return res.sendStatus(201);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

module.exports = router;
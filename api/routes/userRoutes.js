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

/********/
/* GET */
/********/

// Get all users
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

// Create a new user
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
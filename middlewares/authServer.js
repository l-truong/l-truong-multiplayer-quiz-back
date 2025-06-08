require('dotenv').config();
const { TOKEN_MAX_ACCEPTED_LENGTH, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION, USER_USERNAME_MIN_LENGTH,
  USER_USERNAME_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH } = require('../config/apiConfig');
// Core modules / third-party packages
const express = require('express');
const jwt = require('jsonwebtoken');
// Router setup
const router = express.Router();
// Import bcrypt for hashing and comparing passwords
const bcrypt = require('bcryptjs');
// Custom middlewares and models
const authenticateToken = require('./authenticateToken');
const User = require('../api/models/user');
// Utility functions
const { checkMissingParams, checkInvalidTypes, validateStringLength } = require('../utils/validators');

router.use(express.json());

// Store issued refresh tokens
let refreshTokens = [];

const EXPECTED_TYPES_LOGIN = {
  username: 'string',
  password: 'string'
};
const EXPECTED_TYPES_TOKEN = {
  token: 'string'
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and token management
 */

/********/
/* POST */
/********/
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login to obtain access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
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
 *                 description: Username of the user
 *                 example: admin01
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: P@ssw0rd123
 *     responses:
 *       200:
 *         description: Tokens generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *       400:
 *         description: Missing or invalid parameters or validation errors
 *       401:
 *         description: Unauthorized - invalid username or password
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  // Check for missing parameters
  const requiredParams = ['username', 'password'];
  const missingParams = checkMissingParams(req.body, requiredParams);

  if (missingParams.length > 0) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Missing parameters',
      missing: missingParams
    });
  }

  // Check if parameters are  in valid format
  const invalidParams = checkInvalidTypes(req.body, EXPECTED_TYPES_LOGIN);

  if (Object.keys(invalidParams).length > 0) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Parameters are in wrong formats',
      invalidParams
    });
  } 

  // Performance and abuse safeguard
  const invalidLength = [];

  const usernameError = validateStringLength('Username', req.body.username, USER_USERNAME_MIN_LENGTH, USER_USERNAME_MAX_LENGTH);
  if (usernameError) {
    invalidLength.push(usernameError);
  }                

  const passwordError = validateStringLength('Password', req.body.password, USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH);
  if (passwordError) {
    invalidLength.push(passwordError);
  }                             

  if (invalidLength.length > 0) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Validation failed',
      invalidLength
    });
  }
    
  try {
    // Check if user exist
    const users = await User.find();
    const user = users.find(user => user.username === req.body.username);    
    if (!user) {
      return res.sendStatus(401);
    }

    // Check if provided password matches user's password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.sendStatus(401);
    }
    
    // Generate access token and refresh token
    const payload = {
      userId: user.userId,
      username: user.username      
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
    
    refreshTokens.push(refreshToken);

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    return res.status(500).json({
      message: 'An error occurred',
      error: err.message
    });
  }
});

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Refresh access token using a valid refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *       400:
 *         description: Missing or invalid parameters or token too long
 *       403:
 *         description: Forbidden - invalid or expired refresh token
 *       500:
 *         description: Server error
 */
router.post('/token', authenticateToken, (req, res) => {  
  // Check for missing parameters
  const requiredParams = ['token'];
  const missingParams = checkMissingParams(req.body, requiredParams);

  if (missingParams.length > 0) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Missing parameters',
      missing: missingParams
    });
  }

  // Check if parameters are  in valid format
  const invalidParams = checkInvalidTypes(req.body, EXPECTED_TYPES_TOKEN);

  if (Object.keys(invalidParams).length > 0) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Parameters are in wrong formats',
      invalidParams
    });
  }

  // Performance and abuse safeguard
  if (req.body.token.length > TOKEN_MAX_ACCEPTED_LENGTH) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Token too long'
    });
  }

  // Check if the refresh token is in the refreshTokens list
  if (!refreshTokens.includes(req.body.token)) {
    return res.sendStatus(403);
  }

  try {
    // Verify the refresh token
    jwt.verify(req.body.token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {      
      if (err) {
        return res.sendStatus(403);        
      }
      // Generate a new access token
      const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });      
      return res.json({ accessToken: accessToken });
    });
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
 * /logout:
 *   delete:
 *     summary: Logout user by invalidating the refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token to invalidate
 *     responses:
 *       204:
 *         description: Successfully logged out, token invalidated
 *       400:
 *         description: Missing or invalid parameters or token too long
 *       404:
 *         description: Token not found (already invalidated)
 */
router.delete('/logout', authenticateToken, (req, res) => {
  // Check for missing parameters
  const requiredParams = ['token'];
  const missingParams = checkMissingParams(req.body, requiredParams);

  if (missingParams.length > 0) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Missing parameters',
      missing: missingParams
    });
  }

  // Check if parameters are  in valid format  
  const invalidParams = checkInvalidTypes(req.body, EXPECTED_TYPES_TOKEN);

  if (Object.keys(invalidParams).length > 0) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Parameters are in wrong formats',
      invalidParams
    });
  }

  // Performance and abuse safeguard
  if (req.body.token.length > TOKEN_MAX_ACCEPTED_LENGTH) {
    return res.status(400).json({
      message: 'An error occurred', 
      error: 'Token too long'
    });
  }

  // Check if the refresh token is in the refreshTokens list
  if (!refreshTokens.includes(req.body.token)) {
    return res.sendStatus(404);
  }

  refreshTokens = refreshTokens.filter(token => token !== req.body.token);

  return res.sendStatus(204);  
});

module.exports = router;
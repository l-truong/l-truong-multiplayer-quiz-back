const { TOKEN_MAX_ACCEPTED_LENGTH, USER_USERNAME_MIN_LENGTH, USER_USERNAME_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH } = require('../../config/apiConfig');
// Core modules
const express = require('express');
const jwt = require('jsonwebtoken');
// Third-party modules
const request = require('supertest');
// Application modules
const User = require('../../api/models/user');
jest.mock('../../api/models/user');
const router = require('../../middlewares/authServer');
// App setup
const app = express();
app.use(express.json({ limit: '10kb' }));
app.use('/', router);
// Utility functions
const { setupUsersMocks, resetMocks } = require('../utils/setupMocks');
const { generateString }  = require('../utils/generateString');

/********/
/* MOCKS */
/********/
// Set up mocks before each test
beforeEach(() => {      
  setupUsersMocks();
});
// Reset mocks after each test
afterEach(() => {
  resetMocks();
});


/********/
/* UNIT TESTS */
/********/

// POST /login
describe('POST /login', () => {
  it('should return 400 error if missing parameters', async () => {
    const resOnlyUsername = await request(app).post('/login').send({ username: 'user01' });
    expect(resOnlyUsername.status).toBe(400);
    expect(resOnlyUsername.body.message).toBe('An error occurred');
    expect(resOnlyUsername.body.error).toBe('Missing parameters');
    expect(resOnlyUsername.body.missing).toEqual(['password']);
    
    const resOnlyPassword = await request(app).post('/login').send({ password: 'User01Password2025!@' });
    expect(resOnlyPassword.status).toBe(400);
    expect(resOnlyPassword.body.message).toBe('An error occurred');
    expect(resOnlyPassword.body.error).toBe('Missing parameters');
    expect(resOnlyPassword.body.missing).toEqual(['username']);

    const newMissingAllParameters = {};
    User.prototype.save.mockResolvedValue(newMissingAllParameters);        
    const resMissingAllParameters = await request(app).post('/login').send();
    expect(resMissingAllParameters.status).toBe(400);
    expect(resMissingAllParameters.body.message).toBe('An error occurred');
    expect(resMissingAllParameters.body.error).toBe('Missing parameters');
    expect(resMissingAllParameters.body.missing).toEqual(['username', 'password']);
  });

  it('should return 400 error if parameters not string', async () => {
    const resUsernameNotString = await request(app).post('/login').send({ username: 0, password: 'User01Password2025!@' });
    expect(resUsernameNotString.status).toBe(400);
    expect(resUsernameNotString.body.message).toBe('An error occurred');
    expect(resUsernameNotString.body.error).toBe('Parameters are in wrong formats');
    expect(resUsernameNotString.body.invalidParams).toEqual({ username : 0 });

    const resPasswordNotString = await request(app).post('/login').send({ username: 'user01', password: 1 });
    expect(resPasswordNotString.status).toBe(400);
    expect(resPasswordNotString.body.message).toBe('An error occurred');
    expect(resPasswordNotString.body.error).toBe('Parameters are in wrong formats');
    expect(resPasswordNotString.body.invalidParams).toEqual({ password : 1 });

    const resAllParametersNotString = await request(app).post('/login').send({ username: 0, password: 1 });
    expect(resAllParametersNotString.status).toBe(400);
    expect(resAllParametersNotString.body.message).toBe('An error occurred');
    expect(resAllParametersNotString.body.error).toBe('Parameters are in wrong formats');
    expect(resAllParametersNotString.body.invalidParams).toEqual({ username: 0, password: 1 });
  });

  it('should return 400 error if parameters length not respected', async () => {
    const shortUsername = generateString(USER_USERNAME_MIN_LENGTH - 1);
    const resUsernameTooShort = await request(app).post('/login').send({ username: shortUsername, password: 'User01Password2025@' });   
    expect(resUsernameTooShort.status).toBe(400);    
    expect(resUsernameTooShort.body.message).toBe('An error occurred');
    expect(resUsernameTooShort.body.error).toBe('Validation failed');
    expect(resUsernameTooShort.body.invalidLength).toEqual([`Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters`]);

    const longUsername = generateString(USER_USERNAME_MAX_LENGTH + 1);
    const resUsernameTooLong = await request(app).post('/login').send({ username: longUsername, password: 'User01Password2025@' });   
    expect(resUsernameTooLong.status).toBe(400);    
    expect(resUsernameTooLong.body.message).toBe('An error occurred');
    expect(resUsernameTooLong.body.error).toBe('Validation failed');
    expect(resUsernameTooLong.body.invalidLength).toEqual([`Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters`]);

    const shortPassword = generateString(USER_PASSWORD_MIN_LENGTH - 1);
    const resPasswordTooShort = await request(app).post('/login').send({ username: 'userNotExist', password: shortPassword });   
    expect(resPasswordTooShort.status).toBe(400);        
    expect(resPasswordTooShort.body.message).toBe('An error occurred');
    expect(resPasswordTooShort.body.error).toBe('Validation failed');
    expect(resPasswordTooShort.body.invalidLength).toEqual([`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters`]);

    const longPassword = generateString(USER_PASSWORD_MAX_LENGTH + 1);
    const resPasswordTooLong = await request(app).post('/login').send({ username: 'userNotExist', password: longPassword });   
    expect(resPasswordTooLong.status).toBe(400);        
    expect(resPasswordTooLong.body.message).toBe('An error occurred');
    expect(resPasswordTooLong.body.error).toBe('Validation failed');
    expect(resPasswordTooLong.body.invalidLength).toEqual([`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters`]);

    const res = await request(app).post('/login').send({ username: shortUsername, password: longPassword });   
    expect(res.status).toBe(400);    
    expect(res.body.message).toBe('An error occurred');
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.invalidLength).toEqual([
      `Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters`,
      `Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters`
    ]);
  }); 

  it('should return 401 error if user donesn\'t exists', async () => {
    const res = await request(app).post('/login').send({ username: 'userNotExist', password: 'newPassword123@' });   
    expect(res.status).toBe(401);
  }); 

  it('should return 401 error if password donesn\'t match username', async () => {
    const res = await request(app).post('/login').send({ username: 'user01', password: 'notThePassword123@' });   
    expect(res.status).toBe(401);
  }); 

  it('should return access and refresh tokens on login', async () => {
    const res = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });  

  it('should return 500 error on server failure', async () => {
    User.find.mockRejectedValue(new Error('Database error'));            
    const res = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('An error occurred');
    expect(res.body.error).toBe('Database error');
  });
});

// POST /token
describe('POST /token', () => {
  it('should return 400 error if missing parameters', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken;

    const resMissingToken = await request(app).post('/token').set('Authorization', `Bearer ${accessToken}`).send();
    expect(resMissingToken.status).toBe(400);
    expect(resMissingToken.body.message).toBe('An error occurred');
    expect(resMissingToken.body.error).toBe('Missing parameters');
    expect(resMissingToken.body.missing).toEqual(['token']);    
  });

  it('should return 400 error if parameters not string', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken;

    const resTokenNotString = await request(app).post('/token').set('Authorization', `Bearer ${accessToken}`).send({ token: 0 });        
    expect(resTokenNotString.status).toBe(400);
    expect(resTokenNotString.body.message).toBe('An error occurred');
    expect(resTokenNotString.body.error).toBe('Parameters are in wrong formats');
    expect(resTokenNotString.body.invalidParams).toEqual({ token : 0 });
  });

  it('should return 400 error if parameters length not respected', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken; 
    
    const res = await request(app).post('/token').set('Authorization', `Bearer ${accessToken}`).send({ token: generateString(TOKEN_MAX_ACCEPTED_LENGTH + 1) })
    expect(res.status).toBe(400);    
    expect(res.body.message).toBe('An error occurred');
    expect(res.body.error).toBe('Token too long');
  });

  it('should return 403 error if refresh token isn\'t in refreshTokens list', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken;

    const resTokenNotInRefreshList = await request(app).post('/token').set('Authorization', `Bearer ${accessToken}`).send({ token: 'tokenNotInRefreshTokenList' })    
    expect(resTokenNotInRefreshList.status).toBe(403);    
  });

  it('should return 403 error on jwt.verify failure', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken;

    jest.spyOn(jwt, 'verify').mockImplementationOnce((token, secret, callback) => {        
      callback(null, { username: 'user01' }); // simulate valid access token for authenticateToken
    }).mockImplementationOnce((token, secret, callback) => {
      callback(new Error('Invalid token'), null); // Second call = for refresh token, simulate failure
    });
    const res = await request(app).post('/token').set('Authorization', `Bearer ${accessToken}`).send({ token: refreshToken });
    expect(res.status).toBe(403);
    jwt.verify.mockRestore();
  });

  it('should return new access token using refresh token', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken; 
    
    const res = await request(app).post('/token').set('Authorization', `Bearer ${accessToken}`).send({ token: refreshToken })
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should return 500 error on server failure', async () => { 
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken;

    jest.spyOn(jwt, 'sign').mockImplementation(() => { throw new Error('JWT signing failure'); });
    const res = await request(app).post('/token').set('Authorization', `Bearer ${accessToken}`).send({ token: refreshToken })
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'An error occurred');
    expect(res.body).toHaveProperty('error', 'JWT signing failure');
    jwt.sign.mockRestore();
  });
});

// DELETE /logout
describe('GET /logout', () => {
  it('should return 400 error if missing parameters', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken;

    const resMissingToken = await request(app).delete('/logout').set('Authorization', `Bearer ${accessToken}`).send();
    expect(resMissingToken.status).toBe(400);
    expect(resMissingToken.body.message).toBe('An error occurred');
    expect(resMissingToken.body.error).toBe('Missing parameters');
    expect(resMissingToken.body.missing).toEqual(['token']);    
  });

  it('should return 400 error if parameters not string', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken;

    const resTokenNotString = await request(app).delete('/logout').set('Authorization', `Bearer ${accessToken}`).send({ token: 0 });        
    expect(resTokenNotString.status).toBe(400);
    expect(resTokenNotString.body.message).toBe('An error occurred');
    expect(resTokenNotString.body.error).toBe('Parameters are in wrong formats');
    expect(resTokenNotString.body.invalidParams).toEqual({ token : 0 });
  });

  it('should return 400 error if parameters length not respected', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken; 
    
    const res = await request(app).delete('/logout').set('Authorization', `Bearer ${accessToken}`).send({ token: generateString(TOKEN_MAX_ACCEPTED_LENGTH + 1) })
    expect(res.status).toBe(400);    
    expect(res.body.message).toBe('An error occurred');
    expect(res.body.error).toBe('Token too long');
  });
  
  it('should return 403 error if refresh token isn\'t in refreshTokens list', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken;

    const resTokenNotInRefreshList = await request(app).delete('/logout').set('Authorization', `Bearer ${accessToken}`).send({ token: 'tokenNotInRefreshTokenList' })    
    expect(resTokenNotInRefreshList.status).toBe(404);    
  });

  it('should logout using token', async () => {
    const resLogin = await request(app).post('/login').send({ username: 'user01', password: 'User01Password2025!@' });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body).toHaveProperty('accessToken');
    expect(resLogin.body).toHaveProperty('refreshToken');

    const accessToken = resLogin.body.accessToken;
    const refreshToken = resLogin.body.refreshToken; 
    
    const res = await request(app).delete('/logout').set('Authorization', `Bearer ${accessToken}`).send({ token: refreshToken })
    expect(res.status).toBe(204);
  });
});
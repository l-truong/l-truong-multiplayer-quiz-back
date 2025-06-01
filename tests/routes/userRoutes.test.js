const { USER_USERNAME_MIN_LENGTH, USER_USERNAME_MAX_LENGTH,
    USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH } = require('../../config/apiConfig');
// Core modules
const express = require('express');
// Application modules
const User = require('../../api/models/user');
jest.mock('../../api/models/user');
const router = require('../../api/routes/userRoutes');
// App setup
const app = express();
app.use(express.json({ limit: '10kb' }));
app.use('/users', router);
// Test data and mocks
const { mockUsers } = require('../mocks/mockUsers');
// Utility functions
const { setupUsersMocks, resetMocks } = require('../utils/setupMocks');
const { convertObjectIdsToStrings } = require('../utils/convertFunctions');
const { generateString }  = require('../utils/generateString');
const { authGet, authPost } = require('../utils/authHelpers');


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
/* GET */
/********/

// GET /users
describe('GET /users', () => {
    it('should return all users', async () => {
        const res = await authGet(app, '/users');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStrings(mockUsers));
    });

    it('should return 500 error on server failure', async () => {
        User.find.mockRejectedValue(new Error('Database error'));
        const res = await authGet(app, '/users');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});


/********/
/* POST */
/********/

// POST /users
describe('POST /users', () => {
    it('should return 400 error if missing parameters', async () => {
        const newOnlyUsername = { username: 'onlyUsername' };
        User.prototype.save.mockResolvedValue(newOnlyUsername);
        const resOnlyUsername = await authPost(app, '/users', newOnlyUsername);
        expect(resOnlyUsername.status).toBe(400);
        expect(resOnlyUsername.body.message).toBe('An error occurred');
        expect(resOnlyUsername.body.error).toBe('Missing parameters');
        expect(resOnlyUsername.body.missing).toEqual(['password']);

        const newOnlyPassword = { password: 'onlyPassword' };
        User.prototype.save.mockResolvedValue(newOnlyPassword);
        const resOnlyPassword = await authPost(app, '/users', newOnlyPassword);
        expect(resOnlyPassword.status).toBe(400);
        expect(resOnlyPassword.body.message).toBe('An error occurred');
        expect(resOnlyPassword.body.error).toBe('Missing parameters');
        expect(resOnlyPassword.body.missing).toEqual(['username']);

        const newMissingAllParameters = {};
        User.prototype.save.mockResolvedValue(newMissingAllParameters);
        const resMissingAllParameters = await authPost(app, '/users', newMissingAllParameters);
        expect(resMissingAllParameters.status).toBe(400);
        expect(resMissingAllParameters.body.message).toBe('An error occurred');
        expect(resMissingAllParameters.body.error).toBe('Missing parameters');
        expect(resMissingAllParameters.body.missing).toEqual(['username', 'password']);
    });

    it('should return 400 error if parameters not string', async () => {
        const newUsernameNotString = { username: 0, password: 'newPassword123@' };
        User.prototype.save.mockResolvedValue(newUsernameNotString);
        const resUsernameNotString = await authPost(app, '/users', newUsernameNotString);
        expect(resUsernameNotString.status).toBe(400);
        expect(resUsernameNotString.body.message).toBe('An error occurred');
        expect(resUsernameNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resUsernameNotString.body.invalidParams).toEqual({ username : 0 });

        const newPasswordNotString = { username: 'newUsername', password: 1 };
        User.prototype.save.mockResolvedValue(newPasswordNotString);
        const resPasswordNotString = await authPost(app, '/users', newPasswordNotString);
        expect(resPasswordNotString.status).toBe(400);
        expect(resPasswordNotString.body.message).toBe('An error occurred');
        expect(resPasswordNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resPasswordNotString.body.invalidParams).toEqual({ password : 1 });

        const newUserAllParametersNotString = { username: 0, password: 1};
        User.prototype.save.mockResolvedValue(newUserAllParametersNotString);
        const resAllParametersNotString = await authPost(app, '/users', newUserAllParametersNotString);
        expect(resAllParametersNotString.status).toBe(400);
        expect(resAllParametersNotString.body.message).toBe('An error occurred');
        expect(resAllParametersNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resAllParametersNotString.body.invalidParams).toEqual({ username: 0, password: 1 });
    });

    it('should return 400 error if parameters are valid', async () => {
        const shortUsername = generateString(USER_USERNAME_MIN_LENGTH - 1);
        const newShortUser = { username: shortUsername, password: 'newPassword123@' };
        User.prototype.save.mockResolvedValue(newShortUser);
        const resShortUsername = await authPost(app, '/users', newShortUser);
        expect(resShortUsername.status).toBe(400);
        expect(resShortUsername.body.message).toBe('An error occurred');
        expect(resShortUsername.body.error).toBe(`Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters long, and only contain letters, numbers, hyphens, and underscores`);
        expect(resShortUsername.body.invalidFormat).toEqual({ username: shortUsername });

        const longUsername = generateString(USER_USERNAME_MAX_LENGTH + 1);
        const newLongUser = { username: longUsername, password: 'newPassword123@' };
        User.prototype.save.mockResolvedValue(newLongUser);
        const resLongUsername = await authPost(app, '/users', newLongUser);
        expect(resLongUsername.status).toBe(400);
        expect(resLongUsername.body.message).toBe('An error occurred');
        expect(resLongUsername.body.error).toBe(`Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters long, and only contain letters, numbers, hyphens, and underscores`);
        expect(resLongUsername.body.invalidFormat).toEqual({ username: longUsername });

        const newSpecialsCharactersUsername = { username: 'user01@', password: 'newPassword123@' };
        User.prototype.save.mockResolvedValue(newSpecialsCharactersUsername);
        const resSpecialsCharactersUsername = await authPost(app, '/users', newSpecialsCharactersUsername);
        expect(resSpecialsCharactersUsername.status).toBe(400);
        expect(resSpecialsCharactersUsername.body.message).toBe('An error occurred');
        expect(resSpecialsCharactersUsername.body.error).toBe(`Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters long, and only contain letters, numbers, hyphens, and underscores`);
        expect(resSpecialsCharactersUsername.body.invalidFormat).toEqual({ username: 'user01@' });

        const shortPassword = generateString(USER_PASSWORD_MIN_LENGTH - 1);
        const newShortPassword = { username: 'new-Username', password: shortPassword };
        User.prototype.save.mockResolvedValue(newShortPassword);
        const resShortPassword  = await authPost(app, '/users', newShortPassword);
        expect(resShortPassword .status).toBe(400);
        expect(resShortPassword .body.message).toBe('An error occurred');
        expect(resShortPassword .body.error).toBe(`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, and one number`);
        expect(resShortPassword .body.invalidFormat).toEqual({ password: shortPassword });

        const longPassword = generateString(USER_PASSWORD_MAX_LENGTH + 1);
        const newLongPassword  = { username: 'new-Username', password: longPassword };
        User.prototype.save.mockResolvedValue(newLongPassword);
        const resLongPassword  = await authPost(app, '/users', newLongPassword);
        expect(resLongPassword.status).toBe(400);
        expect(resLongPassword.body.message).toBe('An error occurred');
        expect(resLongPassword.body.error).toBe(`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, and one number`);
        expect(resLongPassword.body.invalidFormat).toEqual({ password: longPassword });

        const newNoSpacesPassword = { username: 'new-Username', password: 'newPassword 123@' };
        User.prototype.save.mockResolvedValue(newNoSpacesPassword);
        const resNoSpacesPassword = await authPost(app, '/users', newNoSpacesPassword);
        expect(resNoSpacesPassword.status).toBe(400);
        expect(resNoSpacesPassword.body.message).toBe('An error occurred');
        expect(resNoSpacesPassword.body.error).toBe(`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, and one number`);
        expect(resNoSpacesPassword.body.invalidFormat).toEqual({ password: 'newPassword 123@' });

        const newMissingLowercasePassword = { username: 'new-Username', password: 'NEWPASSWORD123@' };
        User.prototype.save.mockResolvedValue(newMissingLowercasePassword);
        const resMissingLowercasePassword = await authPost(app, '/users', newMissingLowercasePassword);
        expect(resMissingLowercasePassword.status).toBe(400);
        expect(resMissingLowercasePassword.body.message).toBe('An error occurred');
        expect(resMissingLowercasePassword.body.error).toBe(`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, and one number`);
        expect(resMissingLowercasePassword.body.invalidFormat).toEqual({ password: 'NEWPASSWORD123@' });

        const newMissingUppercasePassword = { username: 'new-Username', password: 'newpassword123@' };
        User.prototype.save.mockResolvedValue(newMissingUppercasePassword);
        const resMissingUppercasePassword = await authPost(app, '/users', newMissingUppercasePassword);
        expect(resMissingUppercasePassword.status).toBe(400);
        expect(resMissingUppercasePassword.body.message).toBe('An error occurred');
        expect(resMissingUppercasePassword.body.error).toBe(`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, and one number`);
        expect(resMissingUppercasePassword.body.invalidFormat).toEqual({ password: 'newpassword123@' });

        const newMissingNumberPassword = { username: 'new-Username', password: 'newPassword@' };
        User.prototype.save.mockResolvedValue(newMissingNumberPassword);
        const resMissingNumberPassword = await authPost(app, '/users', newMissingNumberPassword);
        expect(resMissingNumberPassword.status).toBe(400);
        expect(resMissingNumberPassword.body.message).toBe('An error occurred');
        expect(resMissingNumberPassword.body.error).toBe(`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, and one number`);
        expect(resMissingNumberPassword.body.invalidFormat).toEqual({ password: 'newPassword@' });

        const newMissingSpecialsCharactersPassword = { username: 'new-Username', password: 'newPassword123' };
        User.prototype.save.mockResolvedValue(newMissingSpecialsCharactersPassword);
        const resMissingSpecialsCharactersPassword = await authPost(app, '/users', newMissingSpecialsCharactersPassword);
        expect(resMissingSpecialsCharactersPassword.status).toBe(400);
        expect(resMissingSpecialsCharactersPassword.body.message).toBe('An error occurred');
        expect(resMissingSpecialsCharactersPassword.body.error).toBe(`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, and one number`);
        expect(resMissingSpecialsCharactersPassword.body.invalidFormat).toEqual({ password: 'newPassword123' });
    });

    it('should return 400 error if user already exists', async () => {
        const newUser = { username: 'user01', password: 'newPassword123@' };
        User.prototype.save.mockResolvedValue(newUser);
        const res = await authPost(app, '/users', newUser);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('User already exists with this username');
        expect(res.body.invalidParams).toEqual({ username: 'user01' });
    });

    it('should create a new user', async () => {
        const newUser = { username: 'new-Username', password: 'newPassword123@' };
        User.prototype.save.mockResolvedValue(newUser);
        const res = await authPost(app, '/users', newUser);
        expect(res.status).toBe(201);
    });

    it('should return 500 error if save fails', async () => {
        User.prototype.save.mockRejectedValue(new Error('Validation error'));
        const res = await authPost(app, '/users', { username: 'new-Username', password: 'newPassword123@' });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Validation error');
    });
});
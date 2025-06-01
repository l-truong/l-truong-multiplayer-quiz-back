// Core modules
const jwt = require('jsonwebtoken');
// Application modules
const authenticateToken = require('../../middlewares/authenticateToken');

describe('authenticateToken middleware', () => {
  it('should return 401 if no token provided', () => {
    const req = { headers: {} };
    const res = { sendStatus: jest.fn() };
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token invalid', () => {
    const req = { headers: { authorization: 'Bearer fake.token.here' } };
    const res = { sendStatus: jest.fn() };
    const next = jest.fn();

    jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    jwt.verify.mockRestore();
  });

  it('should call next if token valid', () => {
    const req = { headers: { authorization: 'Bearer valid.token.here' } };
    const res = { sendStatus: jest.fn() };
    const next = jest.fn();

    const user = { username: 'user01' };
    jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
      callback(null, user);
    });

    authenticateToken(req, res, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
    jwt.verify.mockRestore();
  });
});
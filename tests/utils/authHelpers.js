const jwt = require('jsonwebtoken');
const request = require('supertest');
// Test data and mocks
const { mockUsers } = require('../mocks/mockUsers');
// Mock user payload and test token
const user = mockUsers[0];
const token = jwt.sign(user.username, process.env.ACCESS_TOKEN_SECRET);


function authGet(app, url) {
  return request(app).get(url).set('Authorization', `Bearer ${token}`);
}

function authPost(app, url, data) {
  return request(app).post(url).set('Authorization', `Bearer ${token}`).send(data);
}

function authUpload(app, url, fieldName, fileBuffer, filename) {
  return request(app).post(url).set('Authorization', `Bearer ${token}`).attach(fieldName, fileBuffer, filename);
}

function authPatch(app, url, data) {
  return request(app).patch(url).set('Authorization', `Bearer ${token}`).send(data);
}

function authDelete(app, url) {
  return request(app).delete(url).set('Authorization', `Bearer ${token}`);
}

module.exports = {
  authGet,
  authPost,
  authUpload,
  authPatch,
  authDelete
};
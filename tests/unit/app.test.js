// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('404 middleware', () => {
  // If the request for resources that can't be found can't be found, it should return a 404 error
  test("requests for resources that can't be found", () =>
    request(app).get('/not-found').expect(404));
});

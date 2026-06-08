// tests/unit/app-error.test.js
// Tests for the error-handling middleware in src/app.js (lines 56-65)
// jest.mock() is hoisted, so the mock is active when app.js is required below.

jest.mock('../../src/routes', () => {
  const express = require('express');
  const router = express.Router();

  // Triggers the error handler with a default 500 status
  router.get('/test-error-500', (_req, _res, next) => {
    next(new Error('internal server error'));
  });

  // Triggers the error handler with a 4xx status (false branch of status > 499)
  router.get('/test-error-400', (_req, _res, next) => {
    const err = new Error('bad request');
    err.status = 400;
    next(err);
  });

  // Triggers the error handler with no message (tests the || fallback)
  router.get('/test-error-no-message', (_req, _res, next) => {
    next({});
  });

  return router;
});

const request = require('supertest');
const app = require('../../src/app');

describe('app.js error handling middleware', () => {
  test('returns 500 for unhandled server errors', async () => {
    const res = await request(app).get('/test-error-500');
    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('internal server error');
  });

  test('returns correct status for client errors (status <= 499)', async () => {
    const res = await request(app).get('/test-error-400');
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  });

  test('uses fallback message when error has no message', async () => {
    const res = await request(app).get('/test-error-no-message');
    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('unable to process request');
  });
});

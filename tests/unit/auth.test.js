// tests/unit/auth.test.js

// for src/auth/index.js

describe('src/auth/index.js', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('throws when both Cognito and HTPASSWD_FILE are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'us-east-2_test';
    process.env.AWS_COGNITO_CLIENT_ID = 'testclientid';
    // HTPASSWD_FILE is already set via env.jest

    expect(() => require('../../src/auth')).toThrow(
      'env contains configuration for both AWS Cognito and HTTP Basic Auth'
    );

    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
  });

  test('exports Cognito auth when only Cognito env vars are set', () => {
    const savedHtpasswd = process.env.HTPASSWD_FILE;
    delete process.env.HTPASSWD_FILE;
    process.env.AWS_COGNITO_POOL_ID = 'us-east-2_test';
    process.env.AWS_COGNITO_CLIENT_ID = 'testclientid';

    // jest.doMock is not hoisted, so it works inside test functions
    jest.doMock('../../src/auth/cognito', () => ({
      strategy: jest.fn(),
      authenticate: jest.fn(),
    }));

    const auth = require('../../src/auth');
    expect(auth.strategy).toBeDefined();
    expect(auth.authenticate).toBeDefined();

    jest.dontMock('../../src/auth/cognito');
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    process.env.HTPASSWD_FILE = savedHtpasswd;
  });

  test('throws when no auth env vars are configured', () => {
    const savedHtpasswd = process.env.HTPASSWD_FILE;
    delete process.env.HTPASSWD_FILE;
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;

    expect(() => require('../../src/auth')).toThrow(
      'missing env vars: no authorization configuration found'
    );

    process.env.HTPASSWD_FILE = savedHtpasswd;
  });
});

// for src/auth/auth-middleware.js

describe('auth-middleware.js', () => {
  test('calls next with error response when passport returns an error', () => {
    // Reset modules so passport and auth-middleware share the same instance
    jest.resetModules();
    const passport = require('passport');
    const authMiddleware = require('../../src/auth/auth-middleware');

    jest
      .spyOn(passport, 'authenticate')
      .mockImplementation(
        (_strategy, _options, callback) => () =>
          callback(new Error('passport internal error'), null)
      );

    const middleware = authMiddleware('http');
    const req = {};
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 'error' }));

    passport.authenticate.mockRestore();
  });
});

// for src/auth/basic-auth.js

describe('basic-auth.js', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('throws when HTPASSWD_FILE env var is not set', () => {
    const saved = process.env.HTPASSWD_FILE;
    delete process.env.HTPASSWD_FILE;

    expect(() => require('../../src/auth/basic-auth')).toThrow(
      'missing expected env var: HTPASSWD_FILE'
    );

    process.env.HTPASSWD_FILE = saved;
  });
});

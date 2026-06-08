// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');

const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should allow creating a fragment with a supported Content-Type
  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello world'));
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  // The response should include the fragment metadata with id, ownerId, created, updated, type, and size properties
  test('response includes id, ownerId, created, updated, type, size', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello'));
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment).toHaveProperty('ownerId');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('updated');
    expect(res.body.fragment).toHaveProperty('type');
    expect(res.body.fragment).toHaveProperty('size');
  });

  // The size and type in the response should match the Content-Type header and body size of the request
  test('size and type match the request', async () => {
    const body = Buffer.from('hello world');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(body);
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(body.length);
  });

  // The ownerId in the response should match the hashed email of the authenticated user
  test('ownerId matches hashed email of authenticated user', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello'));
    expect(res.body.fragment.ownerId).toBe(hash('test-user1@fragments-testing.com'));
  });

  // The POST response should include a Location header with a full URL
  test('POST response includes a Location header with a full URL', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello'));
    expect(res.headers['location']).toMatch(/^https?:\/\/.+\/v1\/fragments\/.+$/);
  });

  // The POST request with an unsupported Content-Type should return a 415 status code
  test('unsupported Content-Type returns 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/msword')
      .send(Buffer.from('data'));
    expect(res.statusCode).toBe(415);
  });
});

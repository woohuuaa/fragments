// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
  test('authenticated users get existing fragment ids', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello ids'));

    expect(postRes.statusCode).toBe(201);

    const getRes = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.fragments).toContain(postRes.body.fragment.id);
  });

  // If a valid username/password pair is used with the query parameter expand=1, 
  // it should return an array of fragment objects with all the metadata for each fragment
  test('authenticated users get expanded fragments with expand=1', async () => {
    const body = Buffer.from('hello expand');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(body);

    expect(postRes.statusCode).toBe(201);

    const getRes = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.status).toBe('ok');
    expect(Array.isArray(getRes.body.fragments)).toBe(true);

    const fragment = getRes.body.fragments.find((f) => f.id === postRes.body.fragment.id);

    expect(fragment).toBeDefined();
    expect(fragment.id).toBe(postRes.body.fragment.id);
    expect(fragment.type).toBe('text/plain');
    expect(fragment.size).toBe(body.length);
    expect(fragment).toHaveProperty('ownerId');
    expect(fragment).toHaveProperty('created');
    expect(fragment).toHaveProperty('updated');
  });
});

const request = require('supertest');
const app = require('../../src/app');

const username = 'test-user1@fragments-testing.com';
const password = 'test-password1';

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/random-id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/random-id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should return the fragment data for the given id
  test('authenticated users can get an existing fragment by id', async () => {
    // Create a new fragment to ensure we have a valid ID to test with
    const data = 'hello world';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send(Buffer.from(data));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;

    // Try to retrieve the fragment by its ID
    const getRes = await request(app).get(`/v1/fragments/${id}`).auth(username, password);

    // Check that the response is correct
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toMatch(/^text\/plain/);
    expect(getRes.text).toBe(data);
  });

  // If a fragment is created by one user, another user should not be able to access it by ID
  test('authenticated users cannot get another user fragment by id', async () => {
    // Create a new fragment with the first user
    const data = 'private data';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send(Buffer.from(data));

    const id = postRes.body.fragment.id;

    // Try to retrieve the fragment with a different user
    const res = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('test-user2@fragments-testing', 'test-password2');

    expect(res.statusCode).toBe(404);
  });

  // If a valid username/password pair is used but the fragment ID does not exist, it should return a 404 error
  test('authenticated users get 404 for a missing fragment id', async () => {
    const res = await request(app).get('/v1/fragments/nonexistent-id').auth(username, password);
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });
});

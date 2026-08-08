const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');

const username = 'test-user1@fragments-testing.com';
const password = 'test-password1';

describe('GET /v1/fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/random-id/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/random-id/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should return the fragment metadata for the given id
  test('authenticated users can get existing fragment metadata by id', async () => {
    const body = Buffer.from('hello metadata');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send(body);

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;

    const getRes = await request(app).get(`/v1/fragments/${id}/info`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.status).toBe('ok');
    expect(getRes.body.fragment).toEqual({
      id,
      ownerId: hash(username),
      created: postRes.body.fragment.created,
      updated: postRes.body.fragment.updated,
      type: 'text/plain',
      size: body.length,
    });
  });

  // If a fragment is created by one user, another user should not be able to access its metadata
  test('authenticated users cannot get another user fragment metadata by id', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('private metadata'));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('test-user2@fragments-testing', 'test-password2');

    expect(res.statusCode).toBe(404);
  });

  // If a valid username/password pair is used but the fragment ID does not exist, it should return a 404 error
  test('authenticated users get 404 for missing fragment metadata', async () => {
    const res = await request(app)
      .get('/v1/fragments/nonexistent-id/info')
      .auth(username, password);

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });
});

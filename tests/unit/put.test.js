// tests/unit/put.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/random-id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .put('/v1/fragments/random-id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should allow updating a fragment with a supported Content-Type
  test('authenticated users can update an existing fragment', async () => {
    // First, create a fragment to update
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello world'));
    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');

    // Then, update the fragment
    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('updated data'));
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.status).toBe('ok');

    expect(putRes.body.fragment).toHaveProperty('id');
    expect(putRes.body.fragment).toHaveProperty('ownerId');
    expect(putRes.body.fragment).toHaveProperty('created');
    expect(putRes.body.fragment).toHaveProperty('updated');
    expect(putRes.body.fragment).toHaveProperty('type');
    expect(putRes.body.fragment).toHaveProperty('size');

    expect(putRes.body.fragment.id).toBe(postRes.body.fragment.id);
    expect(putRes.body.fragment.size).toBe(Buffer.byteLength('updated data'));
    expect(putRes.body.fragment.type).toBe('text/plain');
  });

  test('GET /v1/fragments/:id returns the updated fragment', async () => {
    // First, create a fragment to update
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello world'));
    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');

    // Then, update the fragment
    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('updated data'));
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.status).toBe('ok');
    expect(putRes.body.fragment.id).toBe(postRes.body.fragment.id);
    expect(putRes.body.fragment.size).toBe(Buffer.byteLength('updated data'));
    expect(putRes.body.fragment.type).toBe('text/plain');

    // Finally, get the updated fragment
    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toMatch(/^text\/plain/);
    expect(getRes.text).toBe('updated data');
  });

  // A user should be able to update an image fragment
  test('authenticated users can update an image fragment', async () => {
    // First, create an image fragment to update
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'image/png')
      .send(Buffer.from([1, 2, 3]));

    // Then, update the fragment
    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'image/png')
      .send(Buffer.from([4, 5, 6, 7]));

    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.fragment.type).toBe('image/png');
    expect(putRes.body.fragment.size).toBe(Buffer.byteLength(Buffer.from([4, 5, 6, 7])));
  });

  // Updating data should preserve the fragment's original metadata
  test('updating a fragment preserves its identity and type', async () => {
    // First, create a fragment to update
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('original data');

    const oldFragment = postRes.body.fragment;

    // Then, update the fragment
    const putRes = await request(app)
      .put(`/v1/fragments/${oldFragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('updated data');

    const updatedFragment = putRes.body.fragment;

    // The updated fragment should have the same id, ownerId, created, and type as the original fragment
    expect(putRes.statusCode).toBe(200);
    expect(updatedFragment.id).toBe(oldFragment.id);
    expect(updatedFragment.ownerId).toBe(oldFragment.ownerId);
    expect(updatedFragment.created).toBe(oldFragment.created);
    expect(updatedFragment.type).toBe(oldFragment.type);
    expect(updatedFragment.updated).toEqual(expect.any(String));
  });

  // A user should not be able to change the fragment's Content-Type
  test('updating with a different Content-Type returns 400', async () => {
    // First, create a fragment to update
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('plain text');

    // Then, attempt to update the fragment with a different Content-Type
    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ message: 'different type' }));

    expect(putRes.statusCode).toBe(400);
    expect(putRes.body.status).toBe('error');
    expect(putRes.body.error.code).toBe(400);
  });

  // Updating with an unsupported Content-Type should return 415
  test('unsupported Content-Type returns 415', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('original data');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/pdf')
      .send(Buffer.from([1, 2, 3]));

    expect(putRes.statusCode).toBe(415);
    expect(putRes.body.status).toBe('error');
    expect(putRes.body.error.code).toBe(415);
  });

  // Updating a fragment id that does not exist should return 404
  test('authenticated users get 404 for a missing fragment id', async () => {
    const res = await request(app)
      .put('/v1/fragments/nonexistent-id')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('updated data');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });

  // A user should not be able to update another user's fragment
  test("authenticated users cannot update another user's fragment", async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('private data');

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('test-user2@fragments-testing', 'test-password2')
      .set('Content-Type', 'text/plain')
      .send('changed by another user');

    expect(putRes.statusCode).toBe(404);
    expect(putRes.body.status).toBe('error');
    expect(putRes.body.error.code).toBe(404);
  });

  // If fragment.setData() throws, the server should return 500
  test('returns 500 when updating fragment data fails', async () => {
    // First, create a fragment to update
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('original data');

    const { Fragment } = require('../../src/model/fragment');
    jest.spyOn(Fragment.prototype, 'setData').mockRejectedValueOnce(new Error('database failed'));

    const putRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('updated data');

    expect(putRes.statusCode).toBe(500);
    expect(putRes.body.status).toBe('error');
    expect(putRes.body.error.code).toBe(500);
    expect(putRes.body.error.message).toBe('database failed');

    Fragment.prototype.setData.mockRestore();
  });
});

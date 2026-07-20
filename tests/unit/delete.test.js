const request = require('supertest');
const app = require('../../src/app');

const username = 'test-user1@fragments-testing.com';
const password = 'test-password1';
const otherUsername = 'test-user2@fragments-testing';
const otherPassword = 'test-password2';

const createFragment = () =>
  request(app)
    .post('/v1/fragments')
    .auth(username, password)
    .set('Content-Type', 'text/plain')
    .send(Buffer.from('Hello S3!'));

describe('DELETE /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/random-id').expect(401));

  test('authenticated users can delete their fragment', async () => {
    const postRes = await createFragment();
    const { id } = postRes.body.fragment;

    const deleteRes = await request(app).delete(`/v1/fragments/${id}`).auth(username, password);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.status).toBe('ok');

    await request(app).get(`/v1/fragments/${id}`).auth(username, password).expect(404);
  });

  test('authenticated users get 404 for a missing fragment', async () => {
    const res = await request(app).delete('/v1/fragments/nonexistent-id').auth(username, password);

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });

  test("authenticated users cannot delete another user's fragment", async () => {
    const postRes = await createFragment();
    const { id } = postRes.body.fragment;

    await request(app).delete(`/v1/fragments/${id}`).auth(otherUsername, otherPassword).expect(404);

    await request(app).get(`/v1/fragments/${id}`).auth(username, password).expect(200);
  });
});

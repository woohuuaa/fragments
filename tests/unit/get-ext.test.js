const request = require('supertest');
const app = require('../../src/app');

const username = 'test-user1@fragments-testing.com';
const password = 'test-password1';

describe('GET /v1/fragments/:id.ext', () => { 
  test('authenticated users can convert markdown fragments to html', async () => {
    const markdown = '# Hello World';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/markdown')
      .send(Buffer.from(markdown));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;

    const getRes = await request(app).get(`/v1/fragments/${id}.html`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toMatch(/^text\/html/);
    expect(getRes.text).toContain('<h1>Hello World</h1>');
  });

  test('unsupported conversions return 415', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello'));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;

    const res = await request(app).get(`/v1/fragments/${id}.html`).auth(username, password);

    expect(res.statusCode).toBe(415);
  });

  test('missing fragments return 404', async () => {
    const res = await request(app).get('/v1/fragments/missing-id.html').auth(username, password);

    expect(res.statusCode).toBe(404);
  });
});
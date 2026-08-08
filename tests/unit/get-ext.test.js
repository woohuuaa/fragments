const request = require('supertest');
const app = require('../../src/app');
const sharp = require('sharp');

const username = 'test-user1@fragments-testing.com';
const password = 'test-password1';

const createTestImage = (format) =>
  sharp({
    create: { width: 2, height: 2, channels: 3, background: 'red' },
  })
    .toFormat(format)
    .toBuffer();

describe('GET /v1/fragments/:id.ext', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/random-id.html').expect(401));
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
    expect(getRes.headers['content-type']).toContain('text/html');
    expect(getRes.text).toContain('<h1>Hello World</h1>');
  });

  test('authenticated users can convert markdown fragments to plain text', async () => {
    const markdown = '# Hello World';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/markdown')
      .send(Buffer.from(markdown));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const getRes = await request(app).get(`/v1/fragments/${id}.txt`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe(markdown);
  });

  test('authenticated users can convert HTML fragments to plain text', async () => {
    const html = '<h1>Hello World</h1>';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/html')
      .send(Buffer.from(html));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const getRes = await request(app).get(`/v1/fragments/${id}.txt`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe(html);
  });

  test('authenticated users can convert JSON fragments to plain text', async () => {
    const json = '{"message":"Hello World"}';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'application/json')
      .send(json);

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const getRes = await request(app).get(`/v1/fragments/${id}.txt`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe(json);
  });

  test('authenticated users can request a fragment in its original format', async () => {
    const text = 'Hello World';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send(Buffer.from(text));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const getRes = await request(app).get(`/v1/fragments/${id}.txt`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe(text);
  });
  test('authenticated users can convert PNG fragments to JPEG', async () => {
    const data = await createTestImage('png');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'image/png')
      .send(data);

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const getRes = await request(app).get(`/v1/fragments/${id}.jpg`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/jpeg');
    expect(Buffer.isBuffer(getRes.body)).toBe(true);

    const metadata = await sharp(getRes.body).metadata();
    expect(metadata.format).toBe('jpeg');
  });

  test('authenticated users can convert JPEG fragments to PNG', async () => {
    const data = await createTestImage('jpeg');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'image/jpeg')
      .send(data);

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const getRes = await request(app).get(`/v1/fragments/${id}.png`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/png');
    expect(Buffer.isBuffer(getRes.body)).toBe(true);

    const metadata = await sharp(getRes.body).metadata();
    expect(metadata.format).toBe('png');
  });

  test('authenticated users can convert WebP fragments to GIF', async () => {
    const data = await createTestImage('webp');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'image/webp')
      .send(data);

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const getRes = await request(app).get(`/v1/fragments/${id}.gif`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/gif');

    const metadata = await sharp(getRes.body).metadata();
    expect(metadata.format).toBe('gif');
  });

  test('authenticated users can convert GIF fragments to WebP', async () => {
    const data = await createTestImage('gif');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'image/gif')
      .send(data);

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const getRes = await request(app).get(`/v1/fragments/${id}.webp`).auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/webp');

    const metadata = await sharp(getRes.body).metadata();
    expect(metadata.format).toBe('webp');
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

  test('unknown extensions return 415', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('hello'));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.pdf`).auth(username, password);

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(415);
  });

  test("authenticated users cannot convert another user's fragment", async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/markdown')
      .send(Buffer.from('# Private'));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('test-user2@fragments-testing', 'test-password2');

    expect(res.statusCode).toBe(404);
  });

  test('image conversion errors return 500', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'image/png')
      .send(Buffer.from('not a valid image'));

    expect(postRes.statusCode).toBe(201);

    const id = postRes.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.jpg`).auth(username, password);

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(500);
  });
  test('missing fragments return 404', async () => {
    const res = await request(app).get('/v1/fragments/missing-id.html').auth(username, password);

    expect(res.statusCode).toBe(404);
  });
});

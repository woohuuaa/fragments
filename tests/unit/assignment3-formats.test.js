const request = require('supertest');
const sharp = require('sharp');
const YAML = require('yaml');

const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

const username = 'test-user1@fragments-testing.com';
const password = 'test-password1';

describe('Assignment 3 fragment formats', () => {
  test('CSV, YAML, and AVIF are supported', () => {
    expect(Fragment.isSupportedType('text/csv')).toBe(true);
    expect(Fragment.isSupportedType('application/yaml')).toBe(true);
    expect(Fragment.isSupportedType('image/avif')).toBe(true);
  });

  test('formats lists all supported CSV, JSON, YAML, and image conversions', () => {
    expect(new Fragment({ ownerId: '1234', type: 'text/csv' }).formats).toEqual([
      'text/csv',
      'text/plain',
      'application/json',
    ]);
    expect(new Fragment({ ownerId: '1234', type: 'application/json' }).formats).toEqual([
      'application/json',
      'application/yaml',
      'text/plain',
    ]);
    expect(new Fragment({ ownerId: '1234', type: 'application/yaml' }).formats).toEqual([
      'application/yaml',
      'text/plain',
    ]);

    const imageFormats = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'];
    imageFormats.forEach((type) => {
      expect(new Fragment({ ownerId: '1234', type }).formats).toEqual(imageFormats);
    });
  });

  test('POST creates CSV, YAML, and AVIF fragments', async () => {
    const fragments = [
      { type: 'text/csv', body: Buffer.from('name,city\nAlice,Toronto') },
      { type: 'application/yaml', body: Buffer.from('service: fragments') },
      {
        type: 'image/avif',
        body: await sharp({
          create: { width: 2, height: 2, channels: 3, background: 'red' },
        })
          .avif()
          .toBuffer(),
      },
    ];

    for (const fragment of fragments) {
      const res = await request(app)
        .post('/v1/fragments')
        .auth(username, password)
        .set('Content-Type', fragment.type)
        .send(fragment.body);

      expect(res.statusCode).toBe(201);
      expect(res.body.fragment.type).toBe(fragment.type);
      expect(res.body.fragment.size).toBe(fragment.body.length);
    }
  });

  test('CSV converts to JSON', async () => {
    const csv = 'name,city\nAlice,"Toronto, ON"';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/csv')
      .send(Buffer.from(csv));

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.json`)
      .auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('application/json');
    expect(getRes.body).toEqual([{ name: 'Alice', city: 'Toronto, ON' }]);
  });

  test('JSON converts to YAML using .yaml and .yml', async () => {
    const json = '{"service":"Fragments","storage":"DynamoDB"}';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'application/json')
      .send(json);

    for (const extension of ['yaml', 'yml']) {
      const getRes = await request(app)
        .get(`/v1/fragments/${postRes.body.fragment.id}.${extension}`)
        .auth(username, password);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.headers['content-type']).toContain('application/yaml');
      expect(YAML.parse(getRes.text)).toEqual({ service: 'Fragments', storage: 'DynamoDB' });
    }
  });

  test('YAML converts to plain text', async () => {
    const yaml = 'service: Fragments\nstorage: S3\n';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'application/yaml')
      .send(Buffer.from(yaml));

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe(yaml);
  });

  test('AVIF converts to PNG', async () => {
    const avif = await sharp({
      create: { width: 2, height: 2, channels: 3, background: 'red' },
    })
      .avif()
      .toBuffer();
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'image/avif')
      .send(avif);

    const getRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.png`)
      .auth(username, password);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/png');
    expect((await sharp(getRes.body).metadata()).format).toBe('png');
  });
});

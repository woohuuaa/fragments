// tests/unit/memory.test.js

const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
} = require('../../src/model/data/memory');

describe('memory', () => {
  // ── writeFragment / readFragment ──────────────────────────────────────────

  // writeFragment() wraps MemoryDB.put() which resolves with no value
  test('writeFragment() returns nothing', async () => {
    const result = await writeFragment({ ownerId: 'a', id: '1', type: 'text/plain', size: 0 });
    expect(result).toBe(undefined);
  });

  // writeFragment() serializes to JSON; readFragment() parses back — values should match
  test('readFragment() returns what was written by writeFragment()', async () => {
    const fragment = { ownerId: 'a', id: '2', type: 'text/plain', size: 0 };
    await writeFragment(fragment);
    const result = await readFragment('a', '2');
    expect(result).toEqual(fragment);
  });

  // MemoryDB.get() returns undefined when the key doesn't exist
  test('readFragment() returns undefined for non-existent ownerId/id', async () => {
    const result = await readFragment('no-such-owner', 'no-such-id');
    expect(result).toBe(undefined);
  });

  // owner exists in db but the specific fragment id does not
  test('readFragment() returns undefined for wrong id within existing owner', async () => {
    await writeFragment({ ownerId: 'a', id: '3', type: 'text/plain', size: 0 });
    const result = await readFragment('a', 'wrong-id');
    expect(result).toBe(undefined);
  });

  // writing to the same ownerId/id again should overwrite the previous value
  test('writeFragment() overwrites existing fragment with same ownerId and id', async () => {
    await writeFragment({ ownerId: 'a', id: '4', type: 'text/plain', size: 0 });
    await writeFragment({ ownerId: 'a', id: '4', type: 'text/plain', size: 42 });
    const result = await readFragment('a', '4');
    expect(result.size).toBe(42);
  });

  // ownerId is the primary key — same fragment id under different owners must not collide
  test('fragments from different owners are stored independently', async () => {
    await writeFragment({ ownerId: 'owner-a', id: 'shared-id', type: 'text/plain', size: 0 });
    await writeFragment({ ownerId: 'owner-b', id: 'shared-id', type: 'text/plain', size: 0 });
    expect((await readFragment('owner-a', 'shared-id')).ownerId).toBe('owner-a');
    expect((await readFragment('owner-b', 'shared-id')).ownerId).toBe('owner-b');
  });

  // ── writeFragmentData / readFragmentData ──────────────────────────────────

  // writeFragmentData() wraps MemoryDB.put() which resolves with no value
  test('writeFragmentData() returns nothing', async () => {
    const result = await writeFragmentData('b', '1', Buffer.from('hello'));
    expect(result).toBe(undefined);
  });

  // raw data is stored as-is (no JSON serialization unlike metadata)
  test('readFragmentData() returns what was written by writeFragmentData()', async () => {
    const data = Buffer.from('hello fragments');
    await writeFragmentData('b', '2', data);
    const result = await readFragmentData('b', '2');
    expect(result).toEqual(data);
  });

  // MemoryDB.get() returns undefined when the key doesn't exist
  test('readFragmentData() returns undefined for non-existent ownerId/id', async () => {
    const result = await readFragmentData('no-such-owner', 'no-such-id');
    expect(result).toBe(undefined);
  });

  // owner exists in db but the specific fragment id does not
  test('readFragmentData() returns undefined for wrong id within existing owner', async () => {
    await writeFragmentData('b', '3', Buffer.from('data'));
    const result = await readFragmentData('b', 'wrong-id');
    expect(result).toBe(undefined);
  });

  // fragment data is stored as a raw Buffer (binary-safe)
  test('readFragmentData() returns a Buffer', async () => {
    const data = Buffer.from([0x01, 0x02, 0x03, 0xff]);
    await writeFragmentData('b', '4', data);
    const result = await readFragmentData('b', '4');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(data);
  });

  // ── metadata and data are independent ─────────────────────────────────────

  // metadata and raw data use separate MemoryDB instances — they must not interfere
  test('fragment metadata and raw data are stored independently', async () => {
    const fragment = { ownerId: 'c', id: '1', type: 'text/plain', size: 0 };
    const raw = Buffer.from('raw content');
    await writeFragment(fragment);
    await writeFragmentData('c', '1', raw);
    expect(await readFragment('c', '1')).toEqual(fragment);
    expect(await readFragmentData('c', '1')).toEqual(raw);
  });
});

const mockListFragments = jest.fn();

jest.mock('../../src/model/data', () => ({
  listFragments: mockListFragments,
}));

const { Fragment } = require('../../src/model/fragment');

describe('Fragment with DynamoDB metadata', () => {
  test('byUser() accepts expanded metadata objects', async () => {
    const metadata = {
      id: 'fragment-id',
      ownerId: 'owner-id',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      type: 'application/json',
      size: 2,
    };
    mockListFragments.mockResolvedValue([metadata]);

    const fragments = await Fragment.byUser(metadata.ownerId, true);

    expect(fragments).toEqual([new Fragment(metadata)]);
    expect(mockListFragments).toHaveBeenCalledWith(metadata.ownerId, true);
  });
});
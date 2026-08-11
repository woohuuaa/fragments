// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

const logger = require('../logger');

const imageFormats = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'];

const formatsByType = {
  'text/plain': ['text/plain'],
  'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
  'text/html': ['text/html', 'text/plain'],
  'text/csv': ['text/csv', 'text/plain', 'application/json'],
  'application/json': ['application/json', 'application/yaml', 'text/plain'],
  'application/yaml': ['application/yaml', 'text/plain'],
  'image/png': imageFormats,
  'image/jpeg': imageFormats,
  'image/webp': imageFormats,
  'image/avif': imageFormats,
  'image/gif': imageFormats,
};

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({
    id = randomUUID(),
    ownerId,
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
    type,
    size = 0,
  }) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type) throw new Error('type is required');
    if (!Fragment.isSupportedType(type)) throw new Error(`Unsupported type: ${type}`);
    if (typeof size !== 'number' || size < 0) throw new Error('size must be a non-negative number');

    this.id = id;
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    logger.debug({ ownerId, expand }, 'Getting fragments for user');
    const fragments = await listFragments(ownerId, expand);
    logger.info({ ownerId, count: fragments.length }, 'Got fragments for user');
    if (expand) {
      return fragments.map((fragment) => {
        const metadata = typeof fragment === 'string' ? JSON.parse(fragment) : fragment;
        return new Fragment(metadata);
      });
    }
    return fragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    logger.debug({ ownerId, id }, 'Getting fragment by id');
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      logger.warn({ ownerId, id }, 'Fragment not found');
      throw new Error(`No fragment found with id=${id}`);
    }
    // re-create a full Fragment instance after getting from db.
    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    logger.info({ ownerId, id }, 'Deleting fragment');
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  save() {
    logger.debug({ id: this.id }, 'Saving fragment metadata');
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    logger.debug({ id: this.id }, 'Getting fragment data');
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      logger.warn({ id: this.id }, 'setData() requires a Buffer');
      throw new Error('data must be a Buffer');
    }
    logger.debug({ id: this.id, size: data.length }, 'Setting fragment data');
    //update the metadata whenever the data is changed, so they match
    this.size = data.length;
    this.updated = new Date().toISOString();
    await writeFragmentData(this.ownerId, this.id, data);
    await writeFragment(this);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return formatsByType[this.mimeType] || [this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type  value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);

      return type.startsWith('text/') || type in formatsByType;
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;

const contentType = require('content-type');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const id = req.params.id;
  const ownerId = req.user;

  // If body is not a Buffer, the Content-Type was unsupported
  if (!Buffer.isBuffer(req.body)) {
    logger.warn({ ownerId, id, contentType: req.get('Content-Type') }, 'Unsupported Content-Type');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  let fragment;

  try {
    // Get the fragment by id and ownerId.
    fragment = await Fragment.byId(ownerId, id);
  } catch (err) {
    logger.warn({ err, ownerId, id }, 'Fragment not found for update');
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }

  try {
    // parse type from request
    const type = contentType.format(contentType.parse(req));

    if (fragment.type !== type) {
      logger.warn(
        { ownerId, id, fragmentType: fragment.type, type },
        'Content-Type mismatch for fragment update'
      );
      return res
        .status(400)
        .json(createErrorResponse(400, 'Content-Type mismatch for fragment update'));
    }

    logger.debug({ ownerId, id, type }, 'Updating fragment');

    await fragment.setData(req.body);

    logger.info({ ownerId, id, size: fragment.size }, 'Fragment updated');

    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Failed to update fragment');
    return res.status(500).json(createErrorResponse(500, err.message));
  }
};

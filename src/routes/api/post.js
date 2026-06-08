// src/routes/api/post.js

const contentType = require('content-type');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // If body is not a Buffer, the Content-Type was unsupported
  if (!Buffer.isBuffer(req.body)) {
    logger.warn({ contentType: req.get('Content-Type') }, 'Unsupported Content-Type');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  try {
    const { type } = contentType.parse(req);

    logger.debug({ ownerId: req.user, type }, 'Creating new fragment');

    const fragment = new Fragment({ ownerId: req.user, type });

    await fragment.save();
    await fragment.setData(req.body);

    // Build the Location header URL
    const apiUrl = process.env.API_URL || `http://${req.headers.host}`;
    const locationUrl = new URL(`/v1/fragments/${fragment.id}`, apiUrl);

    logger.info({ fragment }, 'Created new fragment');

    res.setHeader('Location', locationUrl.href);
    return res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Failed to create fragment');
    return res.status(500).json(createErrorResponse(500, err.message));
  }
};

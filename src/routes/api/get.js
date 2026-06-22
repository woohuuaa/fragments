// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user, expand);

    logger.info({ ownerId: req.user, count: fragments.length }, 'Listed fragments for user');
    return res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    logger.error({ err }, 'failed to list fragments');
    return res.status(500).json(createErrorResponse(500, 'Unable to get fragments'));
  }
};

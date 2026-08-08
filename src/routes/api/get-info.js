const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.info({ ownerId: req.user, id: req.params.id }, 'Got fragment metadata');
    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.warn({ err, ownerId: req.user, id: req.params.id }, 'fragment metadata not found');
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};

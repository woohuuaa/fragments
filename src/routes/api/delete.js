const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  try {
    // Confirm that the fragment exists and belongs to the authenticated user.
    await Fragment.byId(ownerId, id);
  } catch (err) {
    logger.warn({ err, ownerId, id }, 'fragment not found for delete');
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }

  try {
    await Fragment.delete(ownerId, id);
    logger.info({ ownerId, id }, 'fragment deleted');
    return res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.error({ err, ownerId, id }, 'failed to delete fragment');
    return res.status(500).json(createErrorResponse(500, 'Unable to delete fragment'));
  }
};

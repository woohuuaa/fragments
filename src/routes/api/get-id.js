const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const data = await fragment.getData();

    if (!data) {
      logger.warn({ ownerId: req.user, id: req.params.id }, 'fragment data not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    res.setHeader('Content-Type', fragment.type);
    return res.status(200).send(data);
  } catch (err) {
    logger.warn({ err, ownerId: req.user, id: req.params.id }, 'fragment not found');
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};

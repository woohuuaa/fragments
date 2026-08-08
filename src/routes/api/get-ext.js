const MarkdownIt = require('markdown-it');

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const md = new MarkdownIt();

module.exports = async (req, res) => {
  const { id, ext } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    if (!data) {
      logger.warn({ ownerId: req.user, id }, 'fragment data not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Assignment 2 only requires Markdown -> HTML conversion
    if (fragment.mimeType === 'text/markdown' && ext === 'html') {
      const html = md.render(data.toString());

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    logger.warn({ ownerId: req.user, id, ext, type: fragment.type }, 'unsupported conversion');
    return res.status(415).json(createErrorResponse(415, 'Unsupported conversion'));
  } catch (err) {
    logger.warn({ err, ownerId: req.user, id }, 'fragment not found');
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};

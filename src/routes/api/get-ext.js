// src/routes/api/get-ext.js

const MarkdownIt = require('markdown-it');
const sharp = require('sharp');

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const md = new MarkdownIt();

module.exports = async (req, res) => {
  const { id, ext } = req.params;
  const extension = ext.toLowerCase();

  try {
    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    if (!data) {
      logger.warn({ ownerId: req.user, id }, 'fragment data not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Determine the MIME type requested by the extension
    let outputType;

    if (extension === 'txt') {
      outputType = 'text/plain';
    } else if (extension === 'md') {
      outputType = 'text/markdown';
    } else if (extension === 'html') {
      outputType = 'text/html';
    } else if (extension === 'json') {
      outputType = 'application/json';
    } else if (extension === 'png') {
      outputType = 'image/png';
    } else if (extension === 'jpg' || extension === 'jpeg') {
      outputType = 'image/jpeg';
    } else if (extension === 'webp') {
      outputType = 'image/webp';
    } else if (extension === 'gif') {
      outputType = 'image/gif';
    }

    // Reject unknown extensions or unsupported conversions
    if (!outputType || !fragment.formats.includes(outputType)) {
      logger.warn(
        { ownerId: req.user, id, inputType: fragment.mimeType, outputType, ext: req.params.ext },
        'Unsupported conversion'
      );
      return res.status(415).json(createErrorResponse(415, 'Unsupported conversion'));
    }

    // Return the original data when the requested type is the same
    if (fragment.mimeType === outputType) {
      res.setHeader('Content-Type', outputType);
      return res.status(200).send(data);
    }

    // Markdown -> HTML conversion
    if (fragment.mimeType === 'text/markdown' && extension === 'html') {
      const html = md.render(data.toString());

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    // Markdown, HTML, or JSON -> plain text conversion
    if (outputType === 'text/plain') {
      const text = data.toString();

      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(text);
    }

    // Convert images using Sharp
    if (fragment.mimeType.startsWith('image/')) {
      let convertedImage;

      try {
        if (outputType === 'image/png') {
          convertedImage = await sharp(data).png().toBuffer();
        } else if (outputType === 'image/jpeg') {
          convertedImage = await sharp(data).jpeg().toBuffer();
        } else if (outputType === 'image/webp') {
          convertedImage = await sharp(data).webp().toBuffer();
        } else if (outputType === 'image/gif') {
          convertedImage = await sharp(data).gif().toBuffer();
        }

        res.setHeader('Content-Type', outputType);
        return res.status(200).send(convertedImage);
      } catch (err) {
        logger.error(
          { err, ownerId: req.user, id, inputType: fragment.mimeType, outputType },
          'Failed to convert image'
        );

        return res.status(500).json(createErrorResponse(500, 'Unable to convert fragment'));
      }
    }

    logger.warn({ ownerId: req.user, id, ext, type: fragment.type }, 'unsupported conversion');
    return res.status(415).json(createErrorResponse(415, 'Unsupported conversion'));
  } catch (err) {
    logger.warn({ err, ownerId: req.user, id }, 'fragment not found');
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};

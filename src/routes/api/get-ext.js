// src/routes/api/get-ext.js

const MarkdownIt = require('markdown-it');
const sharp = require('sharp');
const YAML = require('yaml');
const { parse: parseCsv } = require('csv-parse/sync');

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const md = new MarkdownIt();

const typesByExtension = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  csv: 'text/csv',
  json: 'application/json',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
};

async function convertData(fragment, data, outputType) {
  if (fragment.mimeType === outputType) {
    return data;
  }

  if (fragment.mimeType === 'text/markdown' && outputType === 'text/html') {
    return Buffer.from(md.render(data.toString()));
  }

  if (fragment.mimeType === 'text/csv' && outputType === 'application/json') {
    const records = parseCsv(data.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    return Buffer.from(JSON.stringify(records));
  }

  if (fragment.mimeType === 'application/json' && outputType === 'application/yaml') {
    return Buffer.from(YAML.stringify(JSON.parse(data.toString())));
  }

  if (outputType === 'text/plain') {
    return Buffer.from(data.toString());
  }

  if (fragment.mimeType.startsWith('image/')) {
    const format = outputType === 'image/jpeg' ? 'jpeg' : outputType.split('/')[1];
    return sharp(data).toFormat(format).toBuffer();
  }

  throw new Error(`Unsupported conversion from ${fragment.mimeType} to ${outputType}`);
}

module.exports = async (req, res) => {
  const { id, ext } = req.params;
  const outputType = typesByExtension[ext.toLowerCase()];

  try {
    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    if (!data) {
      logger.warn({ ownerId: req.user, id }, 'Fragment data not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    if (!outputType || !fragment.formats.includes(outputType)) {
      logger.warn(
        { ownerId: req.user, id, inputType: fragment.mimeType, outputType, ext },
        'Unsupported conversion'
      );
      return res.status(415).json(createErrorResponse(415, 'Unsupported conversion'));
    }

    try {
      const convertedData = await convertData(fragment, data, outputType);
      res.setHeader('Content-Type', outputType);
      return res.status(200).send(convertedData);
    } catch (err) {
      logger.error(
        { err, ownerId: req.user, id, inputType: fragment.mimeType, outputType },
        'Failed to convert fragment'
      );
      return res.status(500).json(createErrorResponse(500, 'Unable to convert fragment'));
    }
  } catch (err) {
    logger.warn({ err, ownerId: req.user, id }, 'Fragment not found');
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};

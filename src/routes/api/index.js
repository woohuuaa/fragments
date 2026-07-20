// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

const { Fragment } = require('../../model/fragment');
// Parse the Content-Type header using the content-type module
const contentType = require('content-type');

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
// You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
router.post('/fragments', rawBody(), require('./post'));

// GET /v1/fragments
router.get('/fragments', require('./get'));

// GET /v1/fragments/:id/info
router.get('/fragments/:id/info', require('./get-info'));

// GET /v1/fragments/:id.ext
router.get('/fragments/:id.:ext', require('./get-ext'));

// GET /v1/fragments/:id
router.get('/fragments/:id', require('./get-id'));

// DELETE /v1/fragments/:id
router.delete('/fragments/:id', require('./delete'));

module.exports = router;

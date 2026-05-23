// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    fragments: ['this is where the list of fragments will go.'],
  });
};

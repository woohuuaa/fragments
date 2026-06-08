// tests/unit/logger.test.js

describe('logger', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('uses info level when FRAGMENTS_LOG_LEVEL is not set', () => {
    const saved = process.env.FRAGMENTS_LOG_LEVEL;
    delete process.env.FRAGMENTS_LOG_LEVEL;

    const logger = require('../../src/logger');
    expect(logger.level).toBe('info');

    process.env.FRAGMENTS_LOG_LEVEL = saved;
  });

  test('configures pino-pretty transport when FRAGMENTS_LOG_LEVEL is debug', () => {
    process.env.FRAGMENTS_LOG_LEVEL = 'debug';

    const logger = require('../../src/logger');
    expect(logger.level).toBe('debug');

    process.env.FRAGMENTS_LOG_LEVEL = 'silent';
  });
});

# fragments

Fragments back-end API

## Quick Setup

Run this first:

```bash
npm install
```

This installs the app dependencies and the dev tools from `package.json`.

## Script Notes

All server commands run `src/server.js`.

Default local URL: `http://localhost:8080`

Use a different port with:

```bash
PORT=3000 npm run start
```

Same idea works with `dev` and `debug`.

### `npm run lint`

Quick ESLint check for `src/**/*.js`.

```bash
npm run lint
```

Good to run after changing server code and before committing.

### `npm run start`

Plain local run.
No auto-restart.
No debugger.

```bash
npm run start
```

This does not load `.env.debug`.

### `npm run dev`

Normal coding mode.

```bash
npm run dev
```

What it does:

- loads `.env.debug`
- runs Node with `--watch`
- restarts automatically when files change

Reminder: `.env.debug` currently sets `FRAGMENTS_LOG_LEVEL=debug`.

### `npm run debug`

Use this when stepping through code.

```bash
npm run debug
```

What it does:

- loads `.env.debug`
- runs Node with `--watch`
- restarts automatically when files change
- opens the Node inspector on `0.0.0.0:9229`

VS Code launch config already exists in `.vscode/launch.json`: `Debug via npm run debug`.

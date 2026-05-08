# fragments

Fragments back-end API

## Setup

Install dependencies before running any scripts:

```bash
npm install
```

This installs the packages from `package.json`, including the server dependencies and development tools.

## Scripts

### `npm run lint`

Checks the JavaScript files in `src/` with ESLint. Use this to catch style problems and common code issues.

```bash
npm run lint
```

### `npm run start`

Starts the API server normally. Use this when you want to run the app locally without file watching or a debugger.

```bash
npm run start
```

By default, the server listens on `http://localhost:8080`.
Set `PORT` if you want to use a different port.

Example:

```bash
PORT=3000 npm run start
```

### `npm run dev`

Starts the server in development mode. Use this while actively working on the app.

This command:

- loads environment variables from `.env.debug`
- runs Node with `--watch`
- restarts the server automatically when files change

```bash
npm run dev
```

### `npm run debug`

Starts the server in debug mode. Use this when you want to step through the code with a debugger.

This command:

- loads environment variables from `.env.debug`
- runs Node with `--watch`
- restarts the server automatically when files change
- exposes the Node inspector on `0.0.0.0:9229`

```bash
npm run debug
```

If you're using VS Code, `.vscode/launch.json` already includes `Debug via npm run debug`.

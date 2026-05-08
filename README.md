# fragments

Fragments back-end API

## Running Scripts

Install dependencies first:

```bash
npm install
```

Lint the source:

```bash
npm run lint
```

Use this to check the files in `src/` for JavaScript style and code quality issues with ESLint.

Start the server:

```bash
npm run start
```

Use this for a normal local run of the API without file watching or the debugger attached.

The server listens on `http://localhost:8080` by default. Set `PORT` to use a different port.

Run in development mode:

```bash
npm run dev
```

Use this while actively working on the app. It loads `.env.debug` and runs the server with `--watch`, so it restarts when files change.

Run in debug mode:

```bash
npm run debug
```

Use this when you want to step through the code with a debugger. It loads `.env.debug`, runs with `--watch`, and starts the Node inspector on `0.0.0.0:9229`.

The `.vscode/launch.json` already includes `Debug via npm run debug`.

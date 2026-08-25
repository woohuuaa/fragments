# fragments

Fragments is a cloud-based REST API for storing, retrieving, updating, deleting, and converting small pieces of text, structured data, and images. A fragment consists of metadata, such as its owner, MIME type, size, and timestamps, plus the original binary data. All fragment operations are authenticated, and each user's data is isolated using a hashed owner ID.

## Project Overview

The service is built with Node.js and Express and supports text formats, JSON, YAML, and common image formats. Clients can create fragments with raw HTTP request bodies, retrieve fragment data or metadata, update and delete existing fragments, and request supported format conversions such as Markdown to HTML, CSV to JSON, JSON to YAML, or PNG to JPEG.

The production data layer uses AWS services:

- Amazon Cognito authenticates users with JWT bearer tokens.
- Amazon DynamoDB stores fragment metadata.
- Amazon S3 stores the original fragment binary data.
- Amazon ECR stores versioned Docker images.
- Amazon ECS runs the containerized API service.
- Elastic Load Balancing distributes HTTP requests across ECS tasks.
- Amazon CloudWatch collects container and application logs.

Local development uses Docker Compose to run the API with DynamoDB Local and MiniStack S3. The data strategy is configurable, allowing the service to use either the in-memory backend or AWS-compatible storage.

## CI/CD

GitHub Actions provides continuous integration and delivery:

- Every commit or pull request to `main` runs ESLint, Prettier, unit tests, Hurl integration tests, Docker Compose services, and Dockerfile linting.
- Successful commits build and publish Docker images to Docker Hub.
- Pushing a version tag such as `v0.7.3` builds and pushes a versioned image to Amazon ECR.
- The tagged ECR image is added to a new ECS task definition revision and automatically deployed to the ECS service.

Unit tests use Jest and Supertest. Integration tests use Hurl to send real HTTP requests to the Docker Compose environment using HTTP Basic Authentication, DynamoDB Local, and MiniStack S3.

## Quick Setup

Run this first:

```bash
npm install
```

This installs the app dependencies and the dev tools from `package.json`.

## Script Notes

All server commands start the application through `src/index.js`.

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

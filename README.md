# PlayWrightMCP

## Installed packages

- `@playwright/test`
- `@modelcontextprotocol/sdk`

## Setup

Run the following commands if you need to recreate the project:

```bash
npm init -y
npm install -D @playwright/test @modelcontextprotocol/sdk typescript @types/node
```

## Playwright TypeScript

- Playwright is configured with `playwright.config.ts`
- TypeScript settings are in `tsconfig.json`
- Example test is at `tests/example.spec.ts`
- Google login test is at `tests/google-login.spec.ts`

Run tests with:

```bash
npm test
```

Run only the Google login test:

```bash
npm test -- tests/google-login.spec.ts
```

You can also set credentials in `.env`:

```text
GOOGLE_EMAIL=your-email@example.com
GOOGLE_PASSWORD=your-password
```

## Jenkins setup

1. Install Jenkins and the Pipeline plugin.
2. Configure a Node.js tool or ensure `node` and `npm` are on the build agent `PATH`.
3. Add this repository to a Jenkins Pipeline job or Multibranch Pipeline.
4. Run the pipeline using the included `Jenkinsfile`.

The pipeline performs:
- `npm ci`
- `npx playwright install` (with browser dependencies on Unix agents)
- `npx playwright test --reporter=list --reporter=junit`
- archives `playwright-report` and `test-results`

Open the HTML report locally with:

```bash
npm run test:report
```

## Notes

The package `@model-context-protocol/mcp` was not found on npm; `@modelcontextprotocol/sdk` is the installed MCP SDK package.

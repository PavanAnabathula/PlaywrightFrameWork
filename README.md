# PlayWrightMCP

Playwright test automation for the Sauce Demo application using a Page Object Model structure.

## Project overview

- Tests are located in `tests/saucedemo.spec.ts`
- Page objects are implemented in `pages/` (`LoginPage.ts`, `InventoryPage.ts`, `CartPage.ts`, `CheckoutPage.ts`)
- Playwright config is defined in `playwright.config.ts`
- TypeScript configuration is in `tsconfig.json`
- Browser reports are generated under `playwright-report/`

## Installed packages

- `@playwright/test`
- `@modelcontextprotocol/sdk`
- `typescript`
- `dotenv`
- `@types/node`
- `@types/dotenv`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install
```

## Running tests

Run the full suite:

```bash
npm test
```

Open the HTML report:

```bash
npm run test:report
```

Run tests with Allure reporting and generate the Allure HTML report:

```bash
# Run tests and produce Allure results
npm run test:allure

# Generate the Allure HTML report from results
npm run allure:generate

# Open the generated Allure report (local)
npm run allure:open
```

## Test coverage

The suite validates Sauce Demo application flows with the following scenarios:
- login success and failure cases
- user access control for protected pages
- cart operations including add/remove and badge updates
- product sorting by name and price
- checkout validation for missing shipping fields
- end-to-end purchase and cancel checkout workflows

## Playwright configuration

- `testDir` is set to `./tests`
- Default browser is Chrome using the `Desktop Chrome` device profile
- Tests run with `headless: false` by default
- HTML report generation is enabled with `reporter: [['list'], ['html', { open: 'never' }]]`

## Notes

- The current test suite targets `https://www.saucedemo.com`.
- Credentials in the suite use Sauce Demo standard users such as `standard_user`, `locked_out_user`, `problem_user`, and `performance_glitch_user`.
- There is an existing `Jenkinsfile` in the repository for CI pipeline integration.

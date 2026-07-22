# Testing Guidelines

## Purpose

These guidelines define the minimum testing standards for this project. All new features and bug fixes must include appropriate automated tests.

## Core Principles

1. Tests must be isolated and independent.
2. Tests must be deterministic and pass on repeated runs.
3. Tests must be maintainable, readable, and focused on behavior.
4. Setup and teardown hooks are required where needed to ensure reliable execution.
5. Prefer meaningful assertions over implementation-detail assertions.

## Unit Tests

1. Use Jest to test individual functions and React components in isolation.
2. Unit test file naming must follow `*.test.js` or `*.test.ts`.
3. Backend unit tests must be placed in `packages/backend/__tests__/`.
4. Frontend unit tests must be placed in `packages/frontend/src/__tests__/`.
5. Name unit test files to match what they test.
6. Example: `app.test.js` tests `app.js`.

## Integration Tests

1. Use Jest + Supertest to test backend API endpoints with real HTTP requests.
2. Integration tests must be placed in `packages/backend/__tests__/integration/`.
3. Integration test file naming must follow `*.test.js` or `*.test.ts`.
4. Name integration test files based on endpoint or feature behavior.
5. Example: `todos-api.test.js` for TODO API endpoints.

## End-to-End (E2E) Tests

1. Use Playwright for complete UI workflow tests through browser automation.
2. E2E tests must be placed in `tests/e2e/`.
3. E2E test file naming must follow `*.spec.js` or `*.spec.ts`.
4. Name E2E files based on the user journey under test.
5. Example: `todo-workflow.spec.js`.
6. Playwright tests must use one browser only.
7. Playwright tests must use the Page Object Model (POM) pattern for maintainability.
8. Limit E2E coverage to 5-8 critical user journeys, focused on happy paths and key edge cases.

## Port Configuration for Testability and CI/CD

1. Always use environment variables with sensible defaults for ports.
2. Backend must support:

```js
const PORT = process.env.PORT || 3030;
```

3. Frontend uses React default port 3000 and may be overridden via `PORT` environment variable.
4. Port configurability is required to support dynamic CI/CD environments and parallel test execution.

## Test Isolation, Setup, and Teardown

1. Each test must create or arrange its own data and must not depend on prior tests.
2. Use setup and teardown hooks (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`) where appropriate.
3. Ensure cleanup of any external state, network mocks, and temporary data.
4. Avoid shared mutable state across tests unless fully reset between test cases.

## Coverage Expectations for New Work

1. Every new feature must include appropriate tests at the correct level (unit, integration, and/or E2E).
2. Bug fixes must include a regression test whenever practical.
3. If tests are intentionally deferred, document the reason and follow-up plan in the related change.

## Maintainability Standards

1. Keep tests small and focused with one clear intent per test.
2. Use descriptive test names that explain behavior and expected outcome.
3. Centralize repeated setup in helper utilities or fixtures when useful.
4. Avoid brittle selectors and timing-based flakiness in E2E tests.
5. Review tests with the same quality bar as production code.
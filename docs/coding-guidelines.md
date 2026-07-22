# Coding Guidelines

Great software is readable, consistent, and easy to change. These guidelines define how we write code in this project so the codebase stays understandable as it grows.

We favor clarity over cleverness. Any contributor should be able to open a file and quickly understand the intent, the data flow, and the expected behavior. Prefer explicit naming, small functions, and predictable patterns over compressed one-liners or deeply nested logic.

## Style and Formatting

Use consistent formatting throughout the codebase. Keep indentation, whitespace, and line wrapping uniform so diffs stay clean and reviews focus on behavior instead of style noise. Keep functions focused on one responsibility and split long blocks into smaller helpers when readability improves.

Write comments sparingly and intentionally. Code should usually explain itself through naming and structure; comments should capture reasoning, tradeoffs, or non-obvious constraints.

## Imports and Module Organization

Keep imports organized and easy to scan.

1. Group imports by type when practical (external dependencies first, then internal modules).
2. Avoid unused imports.
3. Prefer explicit imports over wildcard-style patterns that hide dependencies.
4. Keep module boundaries clear: UI concerns stay in frontend code, API/server concerns stay in backend code.

Favor predictable file organization and co-locate related code and tests where it helps maintainability.

## Linting and Code Quality Tooling

Linting is required, not optional. ESLint (and related tooling in this repo) should pass before code is merged. Address warnings when possible, not only errors, especially when warnings indicate maintainability or correctness risks.

Use auto-fix capabilities where safe, but always review changes before committing. Tooling enforces baseline consistency; engineering judgment still applies for architecture and behavior.

## DRY and Reuse

Follow the DRY principle: avoid duplicating logic, validation rules, constants, and transformations across files. When duplication appears in more than one place, extract shared utilities or reusable components.

Do not over-abstract too early. First optimize for clarity; introduce shared abstractions when repeated patterns are stable and clearly beneficial.

## Error Handling and Defensive Coding

Handle expected failures deliberately.

1. Validate inputs at boundaries.
2. Return clear error messages and status codes in backend endpoints.
3. Fail fast on invalid states instead of silently ignoring issues.
4. Avoid swallowing exceptions without logging or handling rationale.

## Testing Expectations

Code changes should be accompanied by tests that prove behavior and prevent regressions. Prefer focused tests with descriptive names. Keep tests deterministic and independent.

When fixing a bug, add a regression test when practical so the issue does not recur.

## Maintainability and Review Readiness

Before submitting code, check for:

1. Readability: can another developer understand it quickly?
2. Simplicity: is there a simpler structure with the same behavior?
3. Consistency: does it match existing project patterns?
4. Safety: are edge cases and failure paths handled?
5. Quality gates: lint and tests pass.

Small, cohesive pull requests are preferred over large mixed-purpose changes. Keep commits focused and descriptive so history remains useful.

## Accessibility and UX Awareness for Frontend Code

Frontend changes should maintain accessibility and interaction consistency. Preserve semantic HTML, keyboard accessibility, and clear feedback states. Avoid UI changes that introduce visual inconsistency without updating shared styles or tokens.

## Final Principle

Leave the codebase better than you found it. Incremental improvements in naming, structure, and test coverage compound over time and reduce future delivery risk.
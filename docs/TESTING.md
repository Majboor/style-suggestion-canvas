# Testing

This project ships an automated test suite covering the core client logic and
the main user-facing routes.

## Layout

| Layer | Tool | Location |
| ----- | ---- | -------- |
| Unit / component | [Vitest](https://vitest.dev) + Testing Library (jsdom) | `src/**/*.test.{ts,tsx}` |
| End-to-end smoke | [Playwright](https://playwright.dev) (chromium) | `e2e/*.spec.ts` |

## Commands

```bash
npm run test          # run the unit + component suite once
npm run test:watch    # watch mode while developing
npm run test:coverage # unit suite with a v8 coverage report
npm run test:e2e      # build, preview, and run the Playwright smoke tests
```

## What is covered

- **`StyleApiClient`** — session persistence, base-URL overrides, the
  iteration state machine (first-call → iteration 1, the 30-iteration cap,
  `No more images available` and `Invalid iteration ID` recovery), and the
  auth / profile / health endpoints (all with `fetch` mocked, no network).
- **`ImageCard`** — iteration counter rendering, button enable/disable rules,
  and that a Like click submits feedback and reports the next image to its
  parent.
- **`cn`** utility — class merging and Tailwind conflict resolution.
- **Smoke (Playwright)** — the landing page renders, navigation into the Style
  API tester works, empty-access-id validation fires without a network call,
  the docs route loads, and unknown routes render the 404 page. These run
  against the production bundle via `vite preview` and never call the live API,
  so they stay deterministic.

## CI

`.github/workflows/ci.yml` runs the unit suite (plus a production build) and
the Playwright smoke suite on every push to `main` and every pull request.

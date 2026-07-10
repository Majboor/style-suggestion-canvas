import { test, expect } from "@playwright/test";

// End-to-end smoke coverage of the client-side routes. These assert the app
// boots, renders, and navigates without a live backend — API calls are not
// exercised so the suite stays deterministic in CI.

test("landing page renders the product hero and nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Style Suggestion Canvas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Style Preference API" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Try the Style API/i })).toBeVisible();
});

test("navigates from landing to the Style API tester", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Try the Style API/i }).click();
  await expect(page).toHaveURL(/\/style-api$/);
  // The auth panel is the default tab when unauthenticated.
  await expect(page.getByPlaceholder("Enter your access ID")).toBeVisible();
});

test("the tester rejects an empty access id without a network call", async ({ page }) => {
  const apiCalls: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/preference")) apiCalls.push(req.url());
  });

  await page.goto("/style-api");
  const accessId = page.getByPlaceholder("Enter your access ID");
  await expect(accessId).toHaveValue("");

  // Trigger authentication with an empty id; validation should block the call.
  const authButton = page.getByRole("button", { name: /^Authenticate$/i });
  if (await authButton.count()) {
    await authButton.first().click();
    await expect(page.getByText(/Access ID is required/i)).toBeVisible();
  }
  expect(apiCalls, "no auth request should fire for an empty access id").toHaveLength(0);
});

test("unknown routes render the NotFound page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByText(/404/)).toBeVisible();
});

test("API documentation route loads", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /API Documentation/i }).first().click();
  await expect(page).toHaveURL(/\/api-docs$/);
});

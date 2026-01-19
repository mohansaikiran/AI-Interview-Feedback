import { test, expect } from '@playwright/test';

function uniqEmail() {
  return `e2e_${Date.now()}@example.com`;
}

test('user registers, completes interview, sees feedback + history', async ({ page }) => {
  const email = uniqEmail();
  const password = 'Password123';

  // Register
  await page.goto('/login');
  await page.getByTestId('login').click();
  await page.getByTestId('email').fill(email);
  await page.getByTestId('password').fill(password);
  await page.getByTestId('register-submit').click();

  // Logged in (email visible in header)
  await expect(page.getByText(email)).toBeVisible();

  // Start interview
  const start = page.getByTestId('start-interview');
  if (await start.isVisible().catch(() => false)) {
    await start.click();
  } else {
    await page.goto('/interview');
  }

  // Answer 5 questions
  for (let i = 0; i < 5; i++) {
    await page.getByTestId('answer').fill(
      'This is a sufficiently detailed response to meet the minimum length requirement.'
    );
    await page.getByTestId('next-submit').click();
  }

  // Feedback visible
  await expect(page.getByTestId('feedback-page')).toBeVisible();
  await expect(page.getByText('Communication', { exact: true })).toBeVisible();
  await expect(page.getByText('Problem Solving', { exact: true })).toBeVisible();
  await expect(page.getByText('Empathy', { exact: true })).toBeVisible();

  // History shows interview
  await page.goto('/history');
  await expect(page.getByTestId('history-page')).toBeVisible();
  await expect(page.getByText('Interview', { exact: true })).toBeVisible();
});
import { expect, test } from '@playwright/test'

test('the index page of the application shows the Next.js logo', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Senior Engineering Manager' }),
  ).toBeVisible()
})

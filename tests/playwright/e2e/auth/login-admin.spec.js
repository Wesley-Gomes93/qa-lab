const { test, expect } = require("@playwright/test");
const { loginAsAdmin } = require("../../support/helpers");

test.describe("Login como Admin", () => {
  test("faz login como ADM e valida dashboard com área admin", async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText("(Admin)")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Todos os usuários" })).toBeVisible();
  });
});

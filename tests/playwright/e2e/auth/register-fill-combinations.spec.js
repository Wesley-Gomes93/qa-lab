const { test, expect } = require("@playwright/test");
const { randomEmail, randomName, visitPlayground, fillRegisterForm } = require("../../support/helpers");

test.describe("Registro - preenchimento do formulário (combinações)", () => {
  test("preenche apenas e-mail e senha", async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();
    await fillRegisterForm(page, { email: randomEmail(), password: "senha-aleatoria" });
  });

  test("preenche apenas e-mail e nome", async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();
    await fillRegisterForm(page, { name: randomName(), email: randomEmail() });
  });

  test("preenche apenas e-mail", async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();
    await fillRegisterForm(page, { email: randomEmail() });
  });

  test("preenche apenas nome", async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();
    await fillRegisterForm(page, { name: randomName() });
  });

  test("preenche apenas senha", async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();
    await fillRegisterForm(page, { password: "minhasenha123" });
  });

  test("preenche nome, e-mail e senha", async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();
    await fillRegisterForm(page, { name: randomName(), email: randomEmail(), password: "senha123" });
  });
});

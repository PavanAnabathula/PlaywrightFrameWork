import { type Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async removeItem(itemId: string) {
    await this.page.locator(`[data-test="remove-${itemId}"]`).click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async getItemCount() {
    return this.cartItems.count();
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  async getProductNames() {
    return this.page.locator('.inventory_item_name').allTextContents();
  }
}

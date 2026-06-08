import { type Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly cartLink: Locator;
  readonly productSort: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.inventoryList = page.locator('.inventory_list');
    this.cartLink = page.locator('.shopping_cart_link');
    this.productSort = page.locator('.product_sort_container');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async addToCart(itemId: string) {
    await this.page.locator(`[data-test="add-to-cart-${itemId}"]`).click();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async sortBy(optionValue: string) {
    await this.productSort.selectOption(optionValue);
  }

  async openMenu() {
    await this.menuButton.click();
  }

  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }
}

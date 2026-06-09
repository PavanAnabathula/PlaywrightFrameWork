import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Sauce Demo - Page Object Model', () => {
  test('logs in successfully with standard_user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/inventory.html/);
    await expect(inventoryPage.inventoryList).toBeVisible();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('standard_user', 'wrong_password');
    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match any user in this service'
    );
  });

  test('fails login with empty username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('', 'secret_sauce');
    await expect(loginPage.errorMessage).toContainText('required');
  });

  test('fails login with empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('standard_user', '');
    await expect(loginPage.errorMessage).toContainText('required');
  });

  test('fails login with empty username and password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toContainText('required');
  });
  test('denies access to cart page when not signed in', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/cart.html', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(/cart.html/);
    await expect(page.locator('[data-test="error"]')).toContainText(
      "Epic sadface: You can only access '/cart.html' when you are logged in."
    );
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('locked out user cannot login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('locked_out_user', 'secret_sauce');
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('can continue shopping from cart and retains cart count', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.continueShopping();

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(inventoryPage.inventoryList).toBeVisible();
  });

  test('sorts products by name A to Z and Z to A', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('az');
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Sauce Labs Backpack');

    await inventoryPage.sortBy('za');
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Test.allTheThings() T-Shirt (Red)');
  });
  test('fails checkout when first name is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('', 'User', '29135');
    await checkoutPage.continueCheckout();
    await expect(checkoutPage.errorMessage).toContainText('Error');
  });

  test('fails checkout when last name is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('Test', '', '29135');
    await checkoutPage.continueCheckout();
    await expect(checkoutPage.errorMessage).toContainText('Error');
  });

  test('fails checkout when postal code is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('Test', 'User', '');
    await checkoutPage.continueCheckout();
    await expect(checkoutPage.errorMessage).toContainText('Error');
  });

  test('fails checkout when all shipping fields are missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('', '', '');
    await checkoutPage.continueCheckout();
    await expect(checkoutPage.errorMessage).toContainText('Error');
  });

  test('adds all products to cart and removes them all', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    const products = [
      'sauce-labs-backpack',
      'sauce-labs-bike-light',
      'sauce-labs-bolt-t-shirt',
      'sauce-labs-fleece-jacket',
      'sauce-labs-onesie',
      'test.allthethings()-t-shirt-(red)'
    ];

    for (const itemId of products) {
      await inventoryPage.addToCart(itemId);
    }

    await expect(page.locator('.shopping_cart_badge')).toHaveText(`${products.length}`);
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await expect(cartPage.cartItems).toHaveCount(products.length);

    for (const itemId of products) {
      await cartPage.removeItem(itemId);
    }

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  test('cart badge updates when items are added and removed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await inventoryPage.addToCart('sauce-labs-bike-light');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    await cartPage.removeItem('sauce-labs-backpack');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('cart page shows selected item after add to cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    const productNames = await cartPage.getProductNames();
    expect(productNames).toContain('Sauce Labs Backpack');
    await expect(cartPage.cartItems).toHaveCount(1);
  });

  test('checkout summary displays order details after shipping info', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('Test', 'User', '29135');
    await checkoutPage.continueCheckout();

    await expect(checkoutPage.summaryInfo).toBeVisible();
    await expect(checkoutPage.finishButton).toBeVisible();
  });

  test('can logout from cart page and returns to login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    await inventoryPage.logout();
    await expect(page).toHaveURL(/saucedemo.com\/$/);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('sorts products by price high to low and low to high', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('hilo');
    await expect(page.locator('.inventory_item').first().locator('.inventory_item_price')).toHaveText('$49.99');

    await inventoryPage.sortBy('lohi');
    await expect(page.locator('.inventory_item').first().locator('.inventory_item_price')).toHaveText('$7.99');
  });

  test('completes end-to-end purchase with multiple items', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await expect(cartPage.cartItems).toHaveCount(2);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('Test', 'User', '29135');
    await checkoutPage.continueCheckout();
    await expect(checkoutPage.summaryInfo).toBeVisible();
    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('adds a backpack to cart and completes checkout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await expect(page).toHaveURL(/cart.html/);
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('Test', 'User', '29135');
    await checkoutPage.continueCheckout();

    await expect(checkoutPage.summaryInfo).toBeVisible();
    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('removes an item from the cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await expect(cartPage.cartItems).toHaveCount(2);
    await cartPage.removeItem('sauce-labs-backpack');
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Bike Light');
  });

  test('adds multiple items and shows correct cart count', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  test('sorts products by price low to high', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('lohi');
    await expect(page.locator('.inventory_item').first().locator('.inventory_item_price')).toHaveText('$7.99');
  });

  test('can cancel checkout and return to cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('Test', 'User', '29135');
    await checkoutPage.cancel();
    await expect(page).toHaveURL(/cart.html/);
  });

  test('logs out successfully from inventory', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.logout();
    await expect(page).toHaveURL(/saucedemo.com\/$/);
  });

  const loginValidationCases = [
    { name: 'invalid username', username: 'invalid_user', password: 'secret_sauce', error: 'Username and password do not match any user' },
    { name: 'invalid password', username: 'standard_user', password: 'wrong_password', error: 'Username and password do not match any user' },
    { name: 'username with only spaces', username: '   ', password: 'secret_sauce', error: 'Username and password do not match any user' },
    { name: 'password with only spaces', username: 'standard_user', password: '   ', error: 'Username and password do not match any user' },
    { name: 'uppercase username', username: 'STANDARD_USER', password: 'secret_sauce', error: 'Username and password do not match any user' },
    { name: 'uppercase password', username: 'standard_user', password: 'SECRET_SAUCE', error: 'Username and password do not match any user' },
    { name: 'special chars in username', username: '!@#$%^&*', password: 'secret_sauce', error: 'Username and password do not match any user' },
    { name: 'special chars in password', username: 'standard_user', password: '!@#$%^&*', error: 'Username and password do not match any user' },
    { name: 'long username', username: 'a'.repeat(100), password: 'secret_sauce', error: 'Username and password do not match any user' },
    { name: 'long password', username: 'standard_user', password: 'a'.repeat(100), error: 'Username and password do not match any user' }
  ];

  loginValidationCases.forEach(({ name, username, password, error }) => {
    test(`login validation - ${name}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(username, password);
      await expect(loginPage.errorMessage).toContainText(error);
    });
  });

  const knownUsers = [
    { username: 'standard_user', shouldSucceed: true },
    { username: 'problem_user', shouldSucceed: true },
    { username: 'performance_glitch_user', shouldSucceed: true },
    { username: 'locked_out_user', shouldSucceed: false },
  ];

  knownUsers.forEach(({ username, shouldSucceed }) => {
    test(`login flow for ${username}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(username, 'secret_sauce');

      if (shouldSucceed) {
        await expect(page).toHaveURL(/inventory.html/);
        await expect(page.locator('.inventory_list')).toBeVisible();
      } else {
        await expect(loginPage.errorMessage).toContainText('locked out');
      }
    });
  });

  test('inventory contains exactly 6 products after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('cart badge is hidden when no item is added', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  test('add and remove the same item returns cart to empty state', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.removeItem('sauce-labs-backpack');
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('cart badge count persists after refresh', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await page.reload();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('sort and add to cart keeps the selected filter state', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('za');
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('.product_sort_container')).toHaveValue('za');
  });

  const sortScenarios = [
    { name: 'price low to high', value: 'lohi', expectedPrice: '$7.99' },
    { name: 'price high to low', value: 'hilo', expectedPrice: '$49.99' },
    { name: 'name A to Z', value: 'az', expectedText: 'Sauce Labs Backpack' },
    { name: 'name Z to A', value: 'za', expectedText: 'Test.allTheThings() T-Shirt (Red)' },
  ];

  sortScenarios.forEach(({ name, value, expectedPrice, expectedText }) => {
    test(`sort scenario - ${name}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');

      const inventoryPage = new InventoryPage(page);
      await inventoryPage.sortBy(value);

      if (expectedPrice) {
        await expect(page.locator('.inventory_item').first().locator('.inventory_item_price')).toHaveText(expectedPrice);
      }
      if (expectedText) {
        await expect(page.locator('.inventory_item').first().locator('.inventory_item_name')).toHaveText(expectedText);
      }
    });
  });

  const checkoutValidationCases = [
    { name: 'first name missing', firstName: '', lastName: 'User', postalCode: '29135', errorText: 'Error' },
    { name: 'last name missing', firstName: 'Test', lastName: '', postalCode: '29135', errorText: 'Error' },
    { name: 'postal code missing', firstName: 'Test', lastName: 'User', postalCode: '', errorText: 'Error' },
    { name: 'all fields missing', firstName: '', lastName: '', postalCode: '', errorText: 'Error' },
    { name: 'first name whitespace only', firstName: '   ', lastName: 'User', postalCode: '29135', errorText: 'Error' },
    { name: 'last name whitespace only', firstName: 'Test', lastName: '   ', postalCode: '29135', errorText: 'Error' },
  ];

  checkoutValidationCases.forEach(({ name, firstName, lastName, postalCode, errorText }) => {
    test(`checkout validation - ${name}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');

      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addToCart('sauce-labs-backpack');
      await inventoryPage.openCart();

      const cartPage = new CartPage(page);
      await cartPage.checkout();

      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.enterShippingInformation(firstName, lastName, postalCode);
      await checkoutPage.continueCheckout();
      await expect(checkoutPage.errorMessage).toContainText(errorText);
    });
  });

  test('checkout back and forth retains cart items after cancel', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.cancel();
    await expect(page).toHaveURL(/cart.html/);
    await expect(cartPage.cartItems).toHaveCount(1);
  });

  test('checkout completes with one item and returns confirmation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.checkout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.enterShippingInformation('Test', 'User', '29135');
    await checkoutPage.continueCheckout();
    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('sort selection resets to default after refresh', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('lohi');
    await page.reload();
    await expect(page.locator('.product_sort_container')).toHaveValue('az');
  });

  test('continue shopping from cart returns to inventory and keeps count', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.continueShopping();

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('user can logout after adding item to cart and is redirected to login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.logout();

    await expect(page).toHaveURL(/saucedemo.com\/$/);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});

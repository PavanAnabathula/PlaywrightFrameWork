# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: saucedemo.spec.ts >> Sauce Demo - Page Object Model >> checkout validation - last name whitespace only
- Location: tests\saucedemo.spec.ts:484:9

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h3[data-test="error"]')
Expected substring: "Error"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h3[data-test="error"]')

```

```yaml
- button "Open Menu"
- img "Open Menu"
- text: "Swag Labs 1 Checkout: Overview QTY Description 1"
- link "Sauce Labs Backpack":
  - /url: "#"
- text: "carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection. $29.99 Payment Information: SauceCard #31337 Shipping Information: Free Pony Express Delivery! Price Total Item total: $29.99 Tax: $2.40 Total: $32.39"
- button "Go back Cancel":
  - img "Go back"
  - text: Cancel
- button "Finish"
- contentinfo:
  - list:
    - listitem:
      - link "Twitter":
        - /url: https://twitter.com/saucelabs
    - listitem:
      - link "Facebook":
        - /url: https://www.facebook.com/saucelabs
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/sauce-labs/
  - text: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  399 |   });
  400 | 
  401 |   test('cart badge is hidden when no item is added', async ({ page }) => {
  402 |     const loginPage = new LoginPage(page);
  403 |     await loginPage.goto();
  404 |     await loginPage.login('standard_user', 'secret_sauce');
  405 | 
  406 |     await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  407 |   });
  408 | 
  409 |   test('add and remove the same item returns cart to empty state', async ({ page }) => {
  410 |     const loginPage = new LoginPage(page);
  411 |     await loginPage.goto();
  412 |     await loginPage.login('standard_user', 'secret_sauce');
  413 | 
  414 |     const inventoryPage = new InventoryPage(page);
  415 |     await inventoryPage.addToCart('sauce-labs-backpack');
  416 |     await inventoryPage.openCart();
  417 | 
  418 |     const cartPage = new CartPage(page);
  419 |     await cartPage.removeItem('sauce-labs-backpack');
  420 |     await expect(cartPage.cartItems).toHaveCount(0);
  421 |   });
  422 | 
  423 |   test('cart badge count persists after refresh', async ({ page }) => {
  424 |     const loginPage = new LoginPage(page);
  425 |     await loginPage.goto();
  426 |     await loginPage.login('standard_user', 'secret_sauce');
  427 | 
  428 |     const inventoryPage = new InventoryPage(page);
  429 |     await inventoryPage.addToCart('sauce-labs-backpack');
  430 |     await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  431 | 
  432 |     await page.reload();
  433 |     await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  434 |   });
  435 | 
  436 |   test('sort and add to cart keeps the selected filter state', async ({ page }) => {
  437 |     const loginPage = new LoginPage(page);
  438 |     await loginPage.goto();
  439 |     await loginPage.login('standard_user', 'secret_sauce');
  440 | 
  441 |     const inventoryPage = new InventoryPage(page);
  442 |     await inventoryPage.sortBy('za');
  443 |     await inventoryPage.addToCart('sauce-labs-backpack');
  444 | 
  445 |     await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  446 |     await expect(page.locator('.product_sort_container')).toHaveValue('za');
  447 |   });
  448 | 
  449 |   const sortScenarios = [
  450 |     { name: 'price low to high', value: 'lohi', expectedPrice: '$7.99' },
  451 |     { name: 'price high to low', value: 'hilo', expectedPrice: '$49.99' },
  452 |     { name: 'name A to Z', value: 'az', expectedText: 'Sauce Labs Backpack' },
  453 |     { name: 'name Z to A', value: 'za', expectedText: 'Test.allTheThings() T-Shirt (Red)' },
  454 |   ];
  455 | 
  456 |   sortScenarios.forEach(({ name, value, expectedPrice, expectedText }) => {
  457 |     test(`sort scenario - ${name}`, async ({ page }) => {
  458 |       const loginPage = new LoginPage(page);
  459 |       await loginPage.goto();
  460 |       await loginPage.login('standard_user', 'secret_sauce');
  461 | 
  462 |       const inventoryPage = new InventoryPage(page);
  463 |       await inventoryPage.sortBy(value);
  464 | 
  465 |       if (expectedPrice) {
  466 |         await expect(page.locator('.inventory_item').first().locator('.inventory_item_price')).toHaveText(expectedPrice);
  467 |       }
  468 |       if (expectedText) {
  469 |         await expect(page.locator('.inventory_item').first().locator('.inventory_item_name')).toHaveText(expectedText);
  470 |       }
  471 |     });
  472 |   });
  473 | 
  474 |   const checkoutValidationCases = [
  475 |     { name: 'first name missing', firstName: '', lastName: 'User', postalCode: '29135', errorText: 'Error' },
  476 |     { name: 'last name missing', firstName: 'Test', lastName: '', postalCode: '29135', errorText: 'Error' },
  477 |     { name: 'postal code missing', firstName: 'Test', lastName: 'User', postalCode: '', errorText: 'Error' },
  478 |     { name: 'all fields missing', firstName: '', lastName: '', postalCode: '', errorText: 'Error' },
  479 |     { name: 'first name whitespace only', firstName: '   ', lastName: 'User', postalCode: '29135', errorText: 'Error' },
  480 |     { name: 'last name whitespace only', firstName: 'Test', lastName: '   ', postalCode: '29135', errorText: 'Error' },
  481 |   ];
  482 | 
  483 |   checkoutValidationCases.forEach(({ name, firstName, lastName, postalCode, errorText }) => {
  484 |     test(`checkout validation - ${name}`, async ({ page }) => {
  485 |       const loginPage = new LoginPage(page);
  486 |       await loginPage.goto();
  487 |       await loginPage.login('standard_user', 'secret_sauce');
  488 | 
  489 |       const inventoryPage = new InventoryPage(page);
  490 |       await inventoryPage.addToCart('sauce-labs-backpack');
  491 |       await inventoryPage.openCart();
  492 | 
  493 |       const cartPage = new CartPage(page);
  494 |       await cartPage.checkout();
  495 | 
  496 |       const checkoutPage = new CheckoutPage(page);
  497 |       await checkoutPage.enterShippingInformation(firstName, lastName, postalCode);
  498 |       await checkoutPage.continueCheckout();
> 499 |       await expect(checkoutPage.errorMessage).toContainText(errorText);
      |                                               ^ Error: expect(locator).toContainText(expected) failed
  500 |     });
  501 |   });
  502 | 
  503 |   test('checkout back and forth retains cart items after cancel', async ({ page }) => {
  504 |     const loginPage = new LoginPage(page);
  505 |     await loginPage.goto();
  506 |     await loginPage.login('standard_user', 'secret_sauce');
  507 | 
  508 |     const inventoryPage = new InventoryPage(page);
  509 |     await inventoryPage.addToCart('sauce-labs-backpack');
  510 |     await inventoryPage.openCart();
  511 | 
  512 |     const cartPage = new CartPage(page);
  513 |     await cartPage.checkout();
  514 | 
  515 |     const checkoutPage = new CheckoutPage(page);
  516 |     await checkoutPage.cancel();
  517 |     await expect(page).toHaveURL(/cart.html/);
  518 |     await expect(cartPage.cartItems).toHaveCount(1);
  519 |   });
  520 | 
  521 |   test('checkout completes with one item and returns confirmation', async ({ page }) => {
  522 |     const loginPage = new LoginPage(page);
  523 |     await loginPage.goto();
  524 |     await loginPage.login('standard_user', 'secret_sauce');
  525 | 
  526 |     const inventoryPage = new InventoryPage(page);
  527 |     await inventoryPage.addToCart('sauce-labs-backpack');
  528 |     await inventoryPage.openCart();
  529 | 
  530 |     const cartPage = new CartPage(page);
  531 |     await cartPage.checkout();
  532 | 
  533 |     const checkoutPage = new CheckoutPage(page);
  534 |     await checkoutPage.enterShippingInformation('Test', 'User', '29135');
  535 |     await checkoutPage.continueCheckout();
  536 |     await checkoutPage.finish();
  537 | 
  538 |     await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  539 |   });
  540 | 
  541 |   test('sort selection resets to default after refresh', async ({ page }) => {
  542 |     const loginPage = new LoginPage(page);
  543 |     await loginPage.goto();
  544 |     await loginPage.login('standard_user', 'secret_sauce');
  545 | 
  546 |     const inventoryPage = new InventoryPage(page);
  547 |     await inventoryPage.sortBy('lohi');
  548 |     await page.reload();
  549 |     await expect(page.locator('.product_sort_container')).toHaveValue('az');
  550 |   });
  551 | 
  552 |   test('continue shopping from cart returns to inventory and keeps count', async ({ page }) => {
  553 |     const loginPage = new LoginPage(page);
  554 |     await loginPage.goto();
  555 |     await loginPage.login('standard_user', 'secret_sauce');
  556 | 
  557 |     const inventoryPage = new InventoryPage(page);
  558 |     await inventoryPage.addToCart('sauce-labs-backpack');
  559 |     await inventoryPage.openCart();
  560 | 
  561 |     const cartPage = new CartPage(page);
  562 |     await cartPage.continueShopping();
  563 | 
  564 |     await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  565 |     await expect(page.locator('.inventory_list')).toBeVisible();
  566 |   });
  567 | 
  568 |   test('user can logout after adding item to cart and is redirected to login', async ({ page }) => {
  569 |     const loginPage = new LoginPage(page);
  570 |     await loginPage.goto();
  571 |     await loginPage.login('standard_user', 'secret_sauce');
  572 | 
  573 |     const inventoryPage = new InventoryPage(page);
  574 |     await inventoryPage.addToCart('sauce-labs-backpack');
  575 |     await inventoryPage.logout();
  576 | 
  577 |     await expect(page).toHaveURL(/saucedemo.com\/$/);
  578 |     await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  579 |   });
  580 | });
  581 | 
```
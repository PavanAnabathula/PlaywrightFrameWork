# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: saucedemo.spec.ts >> Sauce Demo - Page Object Model >> denies access to cart page when not signed in
- Location: tests\saucedemo.spec.ts:53:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /cart.html/
Received string:  "https://www.saucedemo.com/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "https://www.saucedemo.com/"

```

```yaml
- text: Swag Labs
- textbox "Username"
- textbox "Password"
- 'heading "Epic sadface: You can only access ''/cart.html'' when you are logged in." [level=3]':
  - button
  - text: "Epic sadface: You can only access '/cart.html' when you are logged in."
- button "Login"
- heading "Accepted usernames are:" [level=4]
- text: standard_user locked_out_user problem_user performance_glitch_user error_user visual_user
- heading "Password for all users:" [level=4]
- text: secret_sauce
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { LoginPage } from '../pages/LoginPage';
  3   | import { InventoryPage } from '../pages/InventoryPage';
  4   | import { CartPage } from '../pages/CartPage';
  5   | import { CheckoutPage } from '../pages/CheckoutPage';
  6   | 
  7   | test.describe('Sauce Demo - Page Object Model', () => {
  8   |   test('logs in successfully with standard_user', async ({ page }) => {
  9   |     const loginPage = new LoginPage(page);
  10  |     await loginPage.goto();
  11  | 
  12  |     await loginPage.login('standard_user', 'secret_sauce');
  13  | 
  14  |     const inventoryPage = new InventoryPage(page);
  15  |     await expect(page).toHaveURL(/inventory.html/);
  16  |     await expect(inventoryPage.inventoryList).toBeVisible();
  17  |     await expect(inventoryPage.title).toHaveText('Products');
  18  |   });
  19  | 
  20  |   test('shows error for invalid credentials', async ({ page }) => {
  21  |     const loginPage = new LoginPage(page);
  22  |     await loginPage.goto();
  23  | 
  24  |     await loginPage.login('standard_user', 'wrong_password');
  25  |     await expect(loginPage.errorMessage).toContainText(
  26  |       'Username and password do not match any user in this service'
  27  |     );
  28  |   });
  29  | 
  30  |   test('fails login with empty username', async ({ page }) => {
  31  |     const loginPage = new LoginPage(page);
  32  |     await loginPage.goto();
  33  | 
  34  |     await loginPage.login('', 'secret_sauce');
  35  |     await expect(loginPage.errorMessage).toContainText('required');
  36  |   });
  37  | 
  38  |   test('fails login with empty password', async ({ page }) => {
  39  |     const loginPage = new LoginPage(page);
  40  |     await loginPage.goto();
  41  | 
  42  |     await loginPage.login('standard_user', '');
  43  |     await expect(loginPage.errorMessage).toContainText('required');
  44  |   });
  45  | 
  46  |   test('fails login with empty username and password', async ({ page }) => {
  47  |     const loginPage = new LoginPage(page);
  48  |     await loginPage.goto();
  49  | 
  50  |     await loginPage.login('', '');
  51  |     await expect(loginPage.errorMessage).toContainText('required');
  52  |   });
  53  |   test('denies access to cart page when not signed in', async ({ page }) => {
  54  |     await page.goto('https://www.saucedemo.com/cart.html', {
  55  |       waitUntil: 'domcontentloaded',
  56  |       timeout: 60_000,
  57  |     });
> 58  |     await expect(page).toHaveURL(/cart.html/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  59  |     await expect(page.locator('[data-test="error"]')).toContainText(
  60  |       "Epic sadface: You can only access '/cart.html' when you are logged in."
  61  |     );
  62  |     await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  63  |   });
  64  | 
  65  |   test('locked out user cannot login', async ({ page }) => {
  66  |     const loginPage = new LoginPage(page);
  67  |     await loginPage.goto();
  68  | 
  69  |     await loginPage.login('locked_out_user', 'secret_sauce');
  70  |     await expect(loginPage.errorMessage).toContainText('locked out');
  71  |   });
  72  | 
  73  |   test('can continue shopping from cart and retains cart count', async ({ page }) => {
  74  |     const loginPage = new LoginPage(page);
  75  |     await loginPage.goto();
  76  |     await loginPage.login('standard_user', 'secret_sauce');
  77  | 
  78  |     const inventoryPage = new InventoryPage(page);
  79  |     await inventoryPage.addToCart('sauce-labs-backpack');
  80  |     await inventoryPage.openCart();
  81  | 
  82  |     const cartPage = new CartPage(page);
  83  |     await expect(cartPage.cartItems).toHaveCount(1);
  84  |     await cartPage.continueShopping();
  85  | 
  86  |     await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  87  |     await expect(inventoryPage.inventoryList).toBeVisible();
  88  |   });
  89  | 
  90  |   test('sorts products by name A to Z and Z to A', async ({ page }) => {
  91  |     const loginPage = new LoginPage(page);
  92  |     await loginPage.goto();
  93  |     await loginPage.login('standard_user', 'secret_sauce');
  94  | 
  95  |     const inventoryPage = new InventoryPage(page);
  96  |     await inventoryPage.sortBy('az');
  97  |     await expect(page.locator('.inventory_item_name').first()).toHaveText('Sauce Labs Backpack');
  98  | 
  99  |     await inventoryPage.sortBy('za');
  100 |     await expect(page.locator('.inventory_item_name').first()).toHaveText('Test.allTheThings() T-Shirt (Red)');
  101 |   });
  102 |   test('fails checkout when first name is missing', async ({ page }) => {
  103 |     const loginPage = new LoginPage(page);
  104 |     await loginPage.goto();
  105 |     await loginPage.login('standard_user', 'secret_sauce');
  106 | 
  107 |     const inventoryPage = new InventoryPage(page);
  108 |     await inventoryPage.addToCart('sauce-labs-backpack');
  109 |     await inventoryPage.openCart();
  110 | 
  111 |     const cartPage = new CartPage(page);
  112 |     await cartPage.checkout();
  113 | 
  114 |     const checkoutPage = new CheckoutPage(page);
  115 |     await checkoutPage.enterShippingInformation('', 'User', '29135');
  116 |     await checkoutPage.continueCheckout();
  117 |     await expect(checkoutPage.errorMessage).toContainText('Error');
  118 |   });
  119 | 
  120 |   test('fails checkout when last name is missing', async ({ page }) => {
  121 |     const loginPage = new LoginPage(page);
  122 |     await loginPage.goto();
  123 |     await loginPage.login('standard_user', 'secret_sauce');
  124 | 
  125 |     const inventoryPage = new InventoryPage(page);
  126 |     await inventoryPage.addToCart('sauce-labs-backpack');
  127 |     await inventoryPage.openCart();
  128 | 
  129 |     const cartPage = new CartPage(page);
  130 |     await cartPage.checkout();
  131 | 
  132 |     const checkoutPage = new CheckoutPage(page);
  133 |     await checkoutPage.enterShippingInformation('Test', '', '29135');
  134 |     await checkoutPage.continueCheckout();
  135 |     await expect(checkoutPage.errorMessage).toContainText('Error');
  136 |   });
  137 | 
  138 |   test('fails checkout when postal code is missing', async ({ page }) => {
  139 |     const loginPage = new LoginPage(page);
  140 |     await loginPage.goto();
  141 |     await loginPage.login('standard_user', 'secret_sauce');
  142 | 
  143 |     const inventoryPage = new InventoryPage(page);
  144 |     await inventoryPage.addToCart('sauce-labs-backpack');
  145 |     await inventoryPage.openCart();
  146 | 
  147 |     const cartPage = new CartPage(page);
  148 |     await cartPage.checkout();
  149 | 
  150 |     const checkoutPage = new CheckoutPage(page);
  151 |     await checkoutPage.enterShippingInformation('Test', 'User', '');
  152 |     await checkoutPage.continueCheckout();
  153 |     await expect(checkoutPage.errorMessage).toContainText('Error');
  154 |   });
  155 | 
  156 |   test('fails checkout when all shipping fields are missing', async ({ page }) => {
  157 |     const loginPage = new LoginPage(page);
  158 |     await loginPage.goto();
```
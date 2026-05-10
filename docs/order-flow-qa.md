# Order Flow QA Notes

## Client step behavior

Verify that commercial users select a B2B client before adding products.

## Product step behavior

Verify that product selection shows price, cold-chain category, and current stock state.

## Quantity validation

Verify quantity inputs reject empty and invalid values before summary confirmation.

## Summary calculation

Verify line totals and order total update from selected quantities and prices.

## Order create request

Verify the create action posts an order payload to /api/v1/orders.

## Stock warning behavior

Verify low stock warnings appear before confirmation for constrained products.

## Failure message behavior

Verify API failure state shows a clear non-blocking message.

## Browser order smoke path

Verify login, products, orders, new order, confirmation, and list return path.

## Buyer visibility note

Record buyer-facing visibility scoped by client account where portal data is available.

## Integration fallback checks

Record route aliases and static API fallback behavior used by order navigation checks.


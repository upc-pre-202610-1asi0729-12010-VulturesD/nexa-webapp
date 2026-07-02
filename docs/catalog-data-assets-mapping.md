# Catalog Data Assets Mapping

Nexa WebApp renders catalog products using the RESTful API contract exposed by Nexa Platform.

Catalog media is served as static WebApp assets and referenced from product records by stable relative URLs.

## Contract Fields

- `id`
- `sku`
- `name`
- `description`
- `category`
- `brand`
- `unit`
- `price`
- `stock`
- `reserved`
- `minStock`
- `imageUrl`
- `temperatureRange`

## Validation

Catalog views must preserve cold-chain product names, stock indicators, temperature labels, and buyer-facing product details.

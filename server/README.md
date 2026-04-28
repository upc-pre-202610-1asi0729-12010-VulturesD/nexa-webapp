# server

Fake REST API for Nexa TB1. Uses [json-server](https://github.com/typicode/json-server) to serve `db.json` as a set of REST endpoints.

This is not a real backend. It simulates the resource layer during TB1 so the frontend can demonstrate Axios integration without an actual server.

## Run

```bash
npm run server
```

Starts at `http://localhost:3000`.

The legacy command remains available:

```bash
npm run mock:api
```

## Resources

| Endpoint             | Description              |
|----------------------|--------------------------|
| `/products`          | Product catalog          |
| `/categories`        | Product categories       |
| `/inventoryLots`     | Lot registry (FEFO)      |
| `/stockMovements`    | Inventory movements      |
| `/warehouses`        | Warehouse zones          |
| `/clients`           | B2B client accounts      |
| `/orders`            | Orders                   |
| `/dispatches`        | Dispatch records         |
| `/alerts`            | Operational alerts       |
| `/activityLog`       | Recent activity feed     |
| `/users`             | Demo user accounts       |

## Notes

- All IDs are strings (e.g. `PRD-001`, `CLI-001`).
- Dates are ISO strings (`YYYY-MM-DD`).
- `orders[].items` is an embedded array — not a separate collection.
- `warehouses[].zones` is embedded — not a separate collection.
- Passwords in `users` are plaintext for demo purposes only.

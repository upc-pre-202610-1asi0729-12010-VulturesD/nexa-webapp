# TB1 QA Notes

## Routing aliases

Record checks for /catalog, /dispatch, /create-order, and ops aliases so old bookmarks reach canonical Angular routes.

Routing aliases keep TB1 demos stable while preserving the final Angular route names.

## Auth guards

Record checks for unauthenticated access, login success, role redirects, and logout behavior.

Guard validation protects internal and buyer screens during TB1 review.

## API base URL

Record checks for environment API roots, interceptor mapping, and JSON Server compatibility.

API checks keep /api/v1 calls stable across local and hosted review paths.

## JSON Server routes

Record checks for collection routes and id routes across products, clients, orders, inventory, and dispatches.

Route checks prevent broken detail screens in TB1 browser flows.

## Sidebar responsiveness

Record responsive shell checks for collapsed width, menu labels, and active states.

Responsive shell checks protect repeated desktop and mobile navigation.

## Topbar alignment

Record topbar checks for logo, role badge, language control, and profile actions.

Topbar alignment keeps navigation clear for commercial, logistics, and buyer users.

## Create order route

Record checks that /orders/new loads the create order workflow and keeps confirmation reachable.

Order route checks protect the main S1 commercial scenario.

## Order failure messaging

Record checks for graceful messaging when the mock API rejects or cannot persist an order.

Failure-state checks keep the flow understandable during local API interruptions.


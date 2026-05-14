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

## Catalog cards

Record card checks for product name, SKU, category, temperature, price, and stock state.

Catalog visual checks keep product browsing consistent and scannable.

## Client labels

Record client checks for segment labels, credit state, contact information, and status copy.

Client copy checks support commercial account review before order creation.

## Stock mapping

Record inventory checks for low stock, reserved stock, lot age, and movement labels.

Inventory checks support S2 logistics review of cold-chain stock.

## Dispatch cards

Record dispatch card checks for KPI alignment, checklist sections, and responsive wrapping.

Dispatch layout checks keep logistics operations usable on varied screen widths.

## Dispatch detail

Record checks for dispatch list to detail navigation and fallback state handling.

Dispatch navigation checks protect the S2 evidence review flow.

## Report data boundaries

Record checks that reports use available mock API data and avoid unsupported calculations.

Report checks keep analytics grounded in the TB1 data contract.

## Report hierarchy

Record checks for KPI cards, status grouping, and empty state spacing in reports.

Report visual checks make management summaries readable during review.

## Buyer scope

Record checks that buyer users see portal data tied to their account scope only.

Portal scope checks protect role separation between buyer and internal users.

## Bilingual labels

Record checks for Spanish and English labels in shell, portal, profile, and status controls.

Language checks keep TB1 UX text consistent across user roles.

## Production build

Record the production build command and expected bundle output path.

Build checks prove the final Angular source compiles before release.

## Ignored artifacts

Record checks that node_modules, dist, .angular, logs, and private env files remain untracked.

Repository hygiene checks prevent local machine artifacts from entering the public repo.

## Mobile overflow

Record mobile checks for card grids, tables, side navigation, and action wrapping.

Mobile overflow checks avoid visual breaks during responsive review.


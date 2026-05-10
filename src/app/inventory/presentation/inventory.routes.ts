import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  { path: 'lots', loadComponent: () => import('./views/lots.page').then((m) => m.LotsPage) },
  { path: '', loadComponent: () => import('./views/inventory.page').then((m) => m.InventoryPage) },
];

export const STOCK_MOVEMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/stock-movements.page').then((m) => m.StockMovementsPage) },
];

import { Injectable, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { AnalyticsApi } from '@app/analytics/infrastructure/analytics-api';
import { Dispatch } from '@app/dispatch/domain/model';
import { InventoryLot } from '@app/inventory/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { CommercialReport, OperationsReport } from '@app/analytics/domain/model';

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private readonly api = inject(AnalyticsApi);

  commercial() {
    return forkJoin({
      orders: this.api.orders(),
    }).pipe(
      map(({ orders }): CommercialReport => {
        const byStatus = group(orders, (o) => o.status);
        const byPriority = group(orders, (o) => o.priority ?? 'low');
        return {
          byStatus: [...byStatus.entries()].map(([status, count]) => ({ status, count })),
          byPriority: [...byPriority.entries()].map(([priority, count]) => ({ priority, count })),
          blocked: orders.filter((o) => /block|cancel|reject/i.test(o.status)),
          totalRevenue: orders.reduce((a, o) => a + (o.total ?? 0), 0),
        };
      }),
    );
  }

  operations() {
    return forkJoin({
      products: this.api.products(),
      lots: this.api.lots(),
      dispatches: this.api.dispatches(),
    }).pipe(
      map(({ products, lots, dispatches }): OperationsReport => {
        const today = new Date();
        const inThirty = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return {
          lowStock: products.filter((p) => (p.stock ?? 0) <= (p.minStock ?? 0)),
          nearExpiry: lots.filter((l) => l.expiry && new Date(l.expiry) <= inThirty),
          activeDispatches: dispatches.filter((d) => !/delivered|completed/i.test(d.status)),
          byDispatchStatus: [...group(dispatches, (d) => d.status).entries()].map(([status, count]) => ({ status, count })),
        };
      }),
    );
  }

  snapshot() {
    return forkJoin({
      orders: this.api.orders(),
      dispatches: this.api.dispatches(),
      products: this.api.products(),
    });
  }
}

function group<T>(items: T[], by: (it: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = by(it);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

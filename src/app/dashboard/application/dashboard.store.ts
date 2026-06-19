import { Injectable, inject } from '@angular/core';
import { DashboardApi } from '@app/dashboard/infrastructure/dashboard-api';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly api = inject(DashboardApi);

  activity() { return this.api.activity(); }
  orders() { return this.api.orders(); }
  products() { return this.api.products(); }
  dispatches() { return this.api.dispatches(); }
  clients() { return this.api.clients(); }
  lots() { return this.api.lots(); }
}

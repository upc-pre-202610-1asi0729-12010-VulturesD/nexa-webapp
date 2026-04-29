import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsApi } from '../../infrastructure/clients-api';
import { Client } from '@app/clients/domain/model';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';

@Component({
  selector: 'nx-clients',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'nav.clients' | t }}</div>
          <div class="page-subtitle">{{ clients().length }} {{ 'clients.subtitle' | t }}</div>
        </div>
        <button class="btn btn-secondary" disabled title="Coming soon">
          <i class="pi pi-plus"></i> {{ 'clients.newClient' | t }}
        </button>
      </div>

      <div class="card" style="overflow:hidden">
        @if (loading()) {
          <div class="card-pad"><div class="skeleton" style="height:14px"></div></div>
        } @else if (clients().length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-users"></i></div>
            <div class="empty-state-title">{{ 'common.noResults' | t }}</div>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'clients.table.client' | t }}</th>
                <th>{{ 'clients.table.ruc' | t }}</th>
                <th>{{ 'clients.table.type' | t }}</th>
                <th>{{ 'clients.table.condition' | t }}</th>
                <th>{{ 'clients.table.credit' | t }}</th>
                <th>{{ 'clients.table.status' | t }}</th>
                <th>{{ 'clients.table.lastOrder' | t }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (c of clients(); track c.id) {
                <tr>
                  <td>
                    <div style="font-weight:500;font-size:13px">{{ c.name }}</div>
                    <div style="font-size:11px;color:#9CA3AF">{{ c.contact }} · {{ c.phone }}</div>
                    <div style="font-size:11px;color:#9CA3AF">{{ c.address }}</div>
                  </td>
                  <td><span class="text-mono">{{ c.ruc }}</span></td>
                  <td style="font-size:12px;color:#6B7280">{{ c.type }}</td>
                  <td style="font-size:12px">{{ c.condition }}</td>
                  <td style="min-width:140px">
                    @if (c.creditLimit) {
                      <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:3px">
                        <span>S/ {{ c.creditUsed | number:'1.0-0' }}</span>
                        <span>S/ {{ c.creditLimit | number:'1.0-0' }}</span>
                      </div>
                      <div class="credit-bar-wrap">
                        <div class="credit-bar" [style.width.%]="creditPct(c)" [style.background]="creditColor(c)"></div>
                      </div>
                    } @else {
                      <span style="font-size:12px;color:#9CA3AF">{{ 'clients.cash' | t }}</span>
                    }
                  </td>
                  <td>
                    <span [class]="'badge ' + (c.status === 'active' ? 'badge-green' : 'badge-orange')">
                      {{ (c.status === 'active' ? 'clients.active' : 'clients.observed') | t }}
                    </span>
                  </td>
                  <td style="font-size:12px;color:#6B7280">{{ c.lastOrder }}</td>
                  <td><button class="btn btn-ghost btn-sm">{{ 'clients.viewProfile' | t }}</button></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class ClientsPage {
  private readonly api = inject(ClientsApi);
  readonly loading = signal(true);
  readonly clients = signal<Client[]>([]);

  creditPct(c: Client): number {
    const lim = c.creditLimit || 0;
    if (!lim) return 0;
    return Math.min(100, ((c.creditUsed || 0) / lim) * 100);
  }
  creditColor(c: Client): string {
    const p = this.creditPct(c);
    if (p >= 100) return '#EF4444';
    if (p >= 80) return '#F97316';
    return '#22C55E';
  }

  constructor() {
    this.api.list().subscribe({
      next: (data) => { this.clients.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}

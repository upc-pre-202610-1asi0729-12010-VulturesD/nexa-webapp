import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrdersApi } from '../../infrastructure/orders-api';
import { Client } from '@app/clients/domain/model';
import { Order } from '@app/ordering/domain/model';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';

const STATUS_KEYS = ['validating', 'blocked', 'confirmed', 'preparing', 'dispatched', 'delivered'] as const;
type StatusKey = typeof STATUS_KEYS[number];

@Component({
  selector: 'nx-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'nav.orders' | t }}</div>
          <div class="page-subtitle">{{ orders().length }} {{ 'orders.subtitle' | t }}</div>
        </div>
        @if (canCreate()) {
          <a routerLink="/orders/new" class="btn btn-primary">
            <i class="pi pi-plus"></i> {{ 'nav.createOrder' | t }}
          </a>
        }
      </div>

      <div class="filter-bar">
        <div class="search-input">
          <i class="pi pi-search"></i>
          <input [(ngModel)]="search" [placeholder]="'orders.searchPlaceholder' | t" />
        </div>
        <button class="filter-chip" [class.active]="filter() === 'all'" (click)="filter.set('all')">{{ 'common.all' | t }}</button>
        @for (s of statusKeys; track s) {
          <button class="filter-chip" [class.active]="filter() === s" (click)="filter.set(s)">{{ ('orders.status.' + s) | t }}</button>
        }
      </div>

      <div class="card" style="overflow:hidden">
        @if (loading()) {
          <div class="card-pad"><div class="skeleton" style="height:14px"></div></div>
        } @else if (filtered().length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-shopping-cart"></i></div>
            <div class="empty-state-title">{{ 'common.noResults' | t }}</div>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'orders.table.order' | t }}</th>
                <th>{{ 'orders.table.client' | t }}</th>
                <th>{{ 'orders.table.date' | t }}</th>
                <th>{{ 'orders.table.total' | t }}</th>
                <th>{{ 'orders.table.status' | t }}</th>
                <th>{{ 'orders.table.priority' | t }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (o of filtered(); track o.id) {
                <tr style="cursor:pointer" (click)="goto(o.id)">
                  <td><span class="text-mono">{{ o.id }}</span></td>
                  <td>
                    <div style="font-weight:500;font-size:13px">{{ clientName(o.clientId) }}</div>
                    <div style="font-size:11px;color:#9CA3AF">{{ clientType(o.clientId) }}</div>
                  </td>
                  <td style="font-size:12px;color:#6B7280">{{ o.date }}</td>
                  <td style="font-weight:600;font-size:13px">S/ {{ o.total | number:'1.2-2' }}</td>
                  <td><span class="badge" [class]="'badge ' + statusBadge(o.status)">{{ ('orders.status.' + o.status) | t }}</span></td>
                  <td><span [class]="'badge-priority-' + (o.priority || 'low')">{{ ('priority.' + (o.priority || 'low')) | t }}</span></td>
                  <td><button class="btn btn-ghost btn-sm" (click)="goto(o.id); $event.stopPropagation()">{{ 'common.view' | t }}</button></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class OrdersPage {
  private readonly api = inject(OrdersApi);
  private readonly session = inject(IamStore);
  private readonly router = inject(Router);
  readonly loading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly statusKeys = STATUS_KEYS;
  readonly filter = signal<'all' | StatusKey>('all');
  search = '';

  readonly filtered = computed(() => {
    const q = (this.search || '').toLowerCase().trim();
    const f = this.filter();
    let arr = this.orders();
    if (f !== 'all') arr = arr.filter((o) => o.status === f);
    if (q) arr = arr.filter((o) => o.id.toLowerCase().includes(q) || this.clientName(o.clientId).toLowerCase().includes(q));
    return arr;
  });

  clientName(id: string): string {
    return this.clients().find((c) => c.id === id)?.name ?? id;
  }
  clientType(id: string): string {
    return this.clients().find((c) => c.id === id)?.type ?? '';
  }
  canCreate(): boolean {
    const r = this.session.roleKey();
    return r === 'commercial' || r === 'logistics';
  }
  goto(id: string): void { this.router.navigate(['/orders', id]); }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      validating: 'badge-amber', blocked: 'badge-red',
      confirmed: 'badge-blue', preparing: 'badge-amber',
      dispatched: 'badge-blue', delivered: 'badge-green',
      cancelled: 'badge-red', rejected: 'badge-red',
    };
    return map[s] || 'badge-gray';
  }

  constructor() {
    forkJoin({ orders: this.api.list(), clients: this.api.clients() }).subscribe({
      next: ({ orders, clients }) => {
        const u = this.session.user();
        const filtered = u?.roleKey === 'buyer' && u.clientId
          ? orders.filter((o) => o.clientId === u.clientId)
          : orders;
        this.orders.set(filtered);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

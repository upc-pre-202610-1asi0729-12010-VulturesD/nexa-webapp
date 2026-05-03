import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrdersApi } from '../../infrastructure/orders-api';
import { Client } from '@app/clients/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';

const FLOW = ['validating', 'confirmed', 'preparing', 'dispatched', 'delivered'] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OrderExt extends Order { createdByName?: string; createdByRole?: string; }

@Component({
  selector: 'nx-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="page">
      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:14px"></div></div>
      } @else if (!order()) {
        <div class="empty-state" style="padding:64px 20px;max-width:560px;margin:0 auto">
          <div class="empty-state-icon"><i class="pi pi-search"></i></div>
          <div class="empty-state-title">{{ 'common.noResults' | t }}</div>
          <div class="empty-state-desc">{{ 'nav.orderDetail' | t }}</div>
          <a routerLink="/orders" class="btn btn-primary" style="margin-top:16px">
            <i class="pi pi-arrow-left"></i> {{ 'nav.orders' | t }}
          </a>
        </div>
      } @else {
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
          <a routerLink="/orders" class="btn btn-ghost btn-sm">
            <i class="pi pi-arrow-left"></i> {{ 'nav.orders' | t }}
          </a>
          <div style="flex:1;min-width:200px">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <span class="page-title text-mono">{{ order()!.id }}</span>
              <span [class]="'badge ' + statusBadge(order()!.status)">{{ ('orders.status.' + order()!.status) | t }}</span>
              <span [class]="'badge-priority-' + (order()!.priority || 'low')">{{ ('priority.' + (order()!.priority || 'low')) | t }}</span>
            </div>
            <div class="page-subtitle">{{ clientName() }} · {{ order()!.date }}</div>
          </div>
          <button class="btn btn-ghost" (click)="print()"><i class="pi pi-print"></i> {{ 'orderDetail.print' | t }}</button>
          @if (order()!.status === 'validating') {
            <button class="btn btn-primary" (click)="confirmOrder()"><i class="pi pi-check"></i> {{ 'orderDetail.confirm' | t }}</button>
          }
          @if (order()!.status === 'blocked' || order()!.status === 'validating') {
            <button class="btn btn-ghost" style="color:#B91C1C" (click)="cancelOrder()"><i class="pi pi-times"></i> {{ 'orderDetail.cancel' | t }}</button>
          }
        </div>

        @if (order()!.notes) {
          <div class="banner banner-warning"><i class="pi pi-info-circle"></i><div>{{ order()!.notes }}</div></div>
        }

        <div class="order-client-grid">
          <div>
            <div class="card" style="overflow:hidden;margin-bottom:16px">
              <div class="card-header"><span class="card-title">{{ 'orderDetail.products' | t }}</span></div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ 'orderDetail.product' | t }}</th>
                    <th>{{ 'orderDetail.qty' | t }}</th>
                    <th>{{ 'orderDetail.price' | t }}</th>
                    <th>{{ 'orderDetail.subtotal' | t }}</th>
                    <th>{{ 'orderDetail.stock' | t }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (i of order()!.items; track i.productId) {
                    <tr>
                      <td>
                        <div style="font-weight:500;font-size:13px">{{ productName(i.productId) }}</div>
                        <div class="text-mono" style="font-size:10px;color:#9CA3AF">{{ productSku(i.productId) }}</div>
                      </td>
                      <td>{{ i.qty }} {{ productUnit(i.productId) }}</td>
                      <td>S/ {{ i.price | number:'1.2-2' }}</td>
                      <td style="font-weight:600">S/ {{ i.qty * i.price | number:'1.2-2' }}</td>
                      <td>
                        <span [class]="'badge ' + (i.stockOk !== false ? 'badge-green' : 'badge-red')">
                          {{ (i.stockOk !== false ? 'orderDetail.available' : 'orderDetail.partial') | t }}
                        </span>
                      </td>
                    </tr>
                  }
                  @if (order()!.items.length === 0) {
                    <tr><td colspan="5">
                      <div class="empty-state" style="padding:24px">
                        <div class="empty-state-icon"><i class="pi pi-box"></i></div>
                        <div class="empty-state-title">{{ 'common.noResults' | t }}</div>
                      </div>
                    </td></tr>
                  }
                </tbody>
              </table>
              <div style="padding:16px 20px;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between;font-weight:700;font-size:15px">
                <span>{{ 'orderDetail.total' | t }}</span>
                <span>S/ {{ order()!.total | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="card card-pad">
              <div class="card-title" style="margin-bottom:16px">{{ 'orderDetail.timeline' | t }}</div>
              <div class="timeline">
                @for (step of timeline(); track step.key) {
                  <div class="tl-item">
                    <div class="tl-spine"></div>
                    <div class="tl-dot" [style.background]="step.done ? '#DCFCE7' : '#F3F4F6'" [style.color]="step.done ? '#15803D' : '#9CA3AF'">
                      <i class="pi" [class.pi-check]="step.done" [class.pi-circle]="!step.done"></i>
                    </div>
                    <div class="tl-content">
                      <div class="tl-title" [style.color]="step.done ? '#1F2937' : '#9CA3AF'">{{ ('orders.status.' + step.key) | t }}</div>
                      <div class="tl-meta">{{ step.meta }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          @if (client(); as c) {
            <div class="card card-pad">
              @if (orderExt()?.createdByName) {
                <div style="margin-bottom:14px;padding:10px 12px;background:#F0F7FF;border:1px solid #BFDBFE;border-radius:8px">
                  <div style="font-size:11px;font-weight:600;color:#2563EB;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">{{ 'orderDetail.registeredBy' | t }}</div>
                  <div style="font-size:13px;font-weight:500;color:#1F2937">{{ orderExt()!.createdByName }}</div>
                  <div style="font-size:11px;color:#6B7280">{{ orderExt()!.createdByRole }}</div>
                </div>
              }
              <div class="card-title" style="margin-bottom:12px">{{ 'orderDetail.client' | t }}</div>
              <div style="font-weight:600">{{ c.name }}</div>
              <div style="font-size:12px;color:#6B7280">{{ c.ruc }}</div>
              <div class="divider" style="margin:14px 0"></div>
              <div style="font-size:12px;color:#6B7280">{{ 'orderDetail.contact' | t }}</div>
              <div style="font-size:13px">{{ c.contact }}</div>
              <div style="font-size:12px;color:#6B7280">{{ c.phone }}</div>
              <div class="divider" style="margin:14px 0"></div>
              <div style="font-size:12px;color:#6B7280">{{ 'orderDetail.address' | t }}</div>
              <div style="font-size:13px">{{ c.address }}</div>
              <div class="divider" style="margin:14px 0"></div>
              <div style="font-size:12px;color:#6B7280">{{ 'orderDetail.condition' | t }}</div>
              <div style="font-size:13px">{{ c.condition }}</div>
              @if (c.creditLimit) {
                <div class="divider" style="margin:14px 0"></div>
                <div style="font-size:12px;color:#6B7280;margin-bottom:6px">{{ 'orderDetail.creditUsed' | t }}</div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:3px">
                  <span>S/ {{ c.creditUsed | number:'1.0-0' }}</span>
                  <span>S/ {{ c.creditLimit | number:'1.0-0' }}</span>
                </div>
                <div class="credit-bar-wrap">
                  <div class="credit-bar" [style.width.%]="creditPct(c)" [style.background]="(c.creditUsed || 0) >= (c.creditLimit || 0) ? '#EF4444' : '#22C55E'"></div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class OrderDetailPage {
  private readonly api = inject(OrdersApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly clients = signal<Client[]>([]);
  readonly products = signal<Product[]>([]);

  readonly orderExt = computed(() => this.order() as OrderExt | null);
  readonly client = computed(() => {
    const o = this.order();
    return o ? this.clients().find((c) => c.id === o.clientId) ?? null : null;
  });

  readonly timeline = computed(() => {
    const o = this.order();
    if (!o) return [];
    const currentIdx = FLOW.indexOf(o.status as typeof FLOW[number]);
    return FLOW.map((key, i) => {
      let state: 'done' | 'active' | 'pending';
      if (currentIdx < 0) state = 'pending';
      else if (i < currentIdx) state = 'done';
      else if (i === currentIdx) state = 'active';
      else state = 'pending';
      return {
        key,
        done: state !== 'pending',
        meta: i === 0 ? o.date : state === 'active' ? o.date : state === 'done' ? o.date : '—',
      };
    });
  });

  clientName(): string {
    const o = this.order();
    if (!o) return '';
    return this.clients().find((c) => c.id === o.clientId)?.name ?? o.clientId;
  }
  productName(id: string): string { return this.products().find((p) => p.id === id)?.name ?? id; }
  productSku(id: string): string { return this.products().find((p) => p.id === id)?.sku ?? ''; }
  productUnit(id: string): string { return this.products().find((p) => p.id === id)?.unit ?? ''; }

  creditPct(c: Client): number {
    const lim = c.creditLimit || 0;
    if (!lim) return 0;
    return Math.min(100, ((c.creditUsed || 0) / lim) * 100);
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      validating: 'badge-amber', blocked: 'badge-red',
      confirmed: 'badge-blue', preparing: 'badge-amber',
      dispatched: 'badge-blue', delivered: 'badge-green',
      cancelled: 'badge-red', rejected: 'badge-red',
    };
    return map[s] || 'badge-gray';
  }

  print(): void { try { window.print(); } catch { /* noop */ } }

  confirmOrder(): void {
    const o = this.order();
    if (!o) return;
    this.order.set({ ...o, status: 'confirmed' });
  }
  cancelOrder(): void {
    const o = this.order();
    if (!o) return;
    this.order.set({ ...o, status: 'cancelled' });
    setTimeout(() => this.router.navigate(['/orders']), 1200);
  }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    forkJoin({
      order: this.api.byId(id),
      clients: this.api.clients(),
      products: this.api.products(),
    }).subscribe({
      next: ({ order, clients, products }) => {
        this.order.set(order);
        this.clients.set(clients);
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

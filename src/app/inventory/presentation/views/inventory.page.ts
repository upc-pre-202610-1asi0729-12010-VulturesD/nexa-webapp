import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { InventoryApi } from '../../infrastructure/inventory-api';
import { InventoryLot, Warehouse } from '@app/inventory/domain/model';
import { Product } from '@app/catalog/domain/model';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';
import { I18nService } from '@app/shared/infrastructure/services/i18n.service';

type StockFilter = 'all' | 'ok' | 'low' | 'out';

@Component({
  selector: 'nx-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'nav.inventory' | t }}</div>
          <div class="page-subtitle">Nexa Cold Chain · {{ 'inventory.subtitle' | t }} {{ currentTime }}</div>
        </div>
        <button class="btn btn-secondary" disabled>
          <i class="pi pi-plus"></i> {{ 'inventory.registerMovement' | t }}
        </button>
      </div>

      @if (expiringLots().length > 0) {
        <div class="banner banner-danger">
          <i class="pi pi-exclamation-triangle"></i>
          <div>
            <strong>{{ i18n.t('inventory.fefoAlert', { n: expiringLots().length }) }}</strong> —
            {{ expiringLotsLabel() }}.
            {{ 'inventory.fefoPriority' | t }}
          </div>
        </div>
      }

      <!-- Tabs -->
      <div style="display:flex;gap:2px;background:#F3F0EC;border-radius:10px;padding:4px;margin-bottom:20px;width:fit-content">
        <button class="btn btn-ghost btn-sm" [style.background]="tab() === 'overview' ? '#fff' : 'transparent'" [style.box-shadow]="tab() === 'overview' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'" style="border:none" (click)="tab.set('overview')">{{ 'inventory.tabs.overview' | t }}</button>
        <button class="btn btn-ghost btn-sm" [style.background]="tab() === 'lots' ? '#fff' : 'transparent'" [style.box-shadow]="tab() === 'lots' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'" style="border:none" (click)="tab.set('lots')">{{ 'inventory.tabs.lots' | t }}</button>
        <button class="btn btn-ghost btn-sm" [style.background]="tab() === 'movements' ? '#fff' : 'transparent'" [style.box-shadow]="tab() === 'movements' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'" style="border:none" (click)="tab.set('movements')">{{ 'inventory.tabs.movements' | t }}</button>
      </div>

      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:14px"></div></div>
      } @else if (tab() === 'overview') {

        <div style="margin-bottom:20px">
          <div class="section-label">{{ 'inventory.warehouses' | t }}</div>
          <div class="grid-2">
            @for (wh of warehouses(); track wh.id) {
              <div>
                <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                  <i class="pi pi-building" style="color:#9CA3AF"></i> {{ wh.name }}
                  <span style="font-size:11px;color:#9CA3AF;font-weight:400">· {{ wh.address }}</span>
                </div>
                <div class="grid-2" style="gap:10px">
                  @for (z of wh.zones || []; track z.id || z.name) {
                    <div class="card card-pad">
                      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
                        <div>
                          <div style="font-size:14px;font-weight:600">{{ z.name }}</div>
                          <div class="text-mono" style="font-size:11px">{{ z.temp }}</div>
                        </div>
                        <span class="badge badge-green"><i class="pi pi-check" style="font-size:9px"></i> {{ 'inventory.tempOk' | t }}</span>
                      </div>
                      <div style="height:6px;background:#F3F0EC;border-radius:9999px;margin-bottom:6px;overflow:hidden">
                        <div [style.width.%]="zonePct(z)" [style.background]="zoneColor(z)" style="height:100%;border-radius:9999px"></div>
                      </div>
                      <div style="font-size:11px;color:#6B7280;display:flex;justify-content:space-between">
                        <span>{{ i18n.t('inventory.usedOf', { used: z.used || 0 }) }}</span>
                        <span>{{ i18n.t('inventory.totalCapacity', { total: z.capacity || 0 }) }} ({{ zonePct(z) | number:'1.0-0' }}%)</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div class="card" style="overflow:hidden">
          <div class="card-header">
            <span class="card-title">{{ 'inventory.stockByProduct' | t }}</span>
            <div class="filter-bar" style="margin-bottom:0">
              <div class="search-input" style="min-width:180px">
                <i class="pi pi-search"></i>
                <input [(ngModel)]="stockSearch" [placeholder]="'common.search' | t" />
              </div>
              @for (f of stockFilters; track f) {
                <button class="filter-chip" [class.active]="stockFilter() === f" (click)="stockFilter.set(f)" style="font-size:11px;padding:5px 10px">
                  {{ filterLabel(f) }}
                </button>
              }
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'inventory.table.product' | t }}</th>
                <th>{{ 'inventory.table.sku' | t }}</th>
                <th>{{ 'inventory.table.category' | t }}</th>
                <th>{{ 'inventory.table.temp' | t }}</th>
                <th>{{ 'inventory.table.stock' | t }}</th>
                <th>{{ 'inventory.table.reserved' | t }}</th>
                <th>{{ 'inventory.table.available' | t }}</th>
                <th>{{ 'inventory.table.minimum' | t }}</th>
                <th>{{ 'inventory.table.warehouse' | t }}</th>
                <th>{{ 'inventory.table.status' | t }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredStock(); track p.id) {
                <tr>
                  <td style="font-weight:500;font-size:13px">{{ p.name }}</td>
                  <td><span class="text-mono">{{ p.sku }}</span></td>
                  <td style="font-size:12px;color:#6B7280">{{ p.category }}</td>
                  <td><span class="badge-temp" style="font-size:10px">{{ p.temp }}</span></td>
                  <td style="font-weight:600">{{ p.stock }} <span style="font-size:11px;color:#9CA3AF">{{ p.unit }}</span></td>
                  <td><span [style.color]="(p.reserved || 0) > 0 ? '#2563EB' : '#9CA3AF'">{{ p.reserved || 0 }} {{ p.unit }}</span></td>
                  <td><span style="font-weight:600" [style.color]="availColor(p)">{{ p.stock - (p.reserved || 0) }} {{ p.unit }}</span></td>
                  <td style="font-size:12px;color:#6B7280">{{ p.minStock || 0 }} {{ p.unit }}</td>
                  <td style="font-size:12px;color:#6B7280">{{ warehouseName(p.warehouse) }}</td>
                  <td><span [class]="'badge ' + stockBadge(p.status)">{{ stockLabel(p.status) }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      } @else if (tab() === 'lots') {
        <div class="card" style="overflow:hidden">
          <div class="card-header"><span class="card-title">{{ 'inventory.tabs.lots' | t }}</span></div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Lote</th><th>Producto</th><th>Vence</th><th>Stock</th><th>Almacén</th>
              </tr>
            </thead>
            <tbody>
              @for (l of sortedLots(); track l.id) {
                <tr>
                  <td><span class="text-mono">{{ l.id }}</span></td>
                  <td>{{ productName(l.productId) }}</td>
                  <td>{{ l.expiry }}</td>
                  <td>{{ l.qty }} ({{ l.qty - (l.reserved || 0) }} disp.)</td>
                  <td style="font-size:12px;color:#6B7280">{{ l.warehouse }} / {{ l.zone }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="card card-pad muted">{{ 'common.comingSoon' | t }}</div>
      }
    </div>
  `,
})
export class InventoryPage {
  private readonly api = inject(InventoryApi);
  readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly lots = signal<InventoryLot[]>([]);
  readonly tab = signal<'overview' | 'lots' | 'movements'>('overview');
  readonly stockFilter = signal<StockFilter>('all');
  readonly stockFilters: StockFilter[] = ['all', 'ok', 'low', 'out'];
  stockSearch = '';

  readonly currentTime = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date());

  readonly filteredStock = computed(() => {
    let p = this.products();
    const f = this.stockFilter();
    if (f !== 'all') p = p.filter((x) => x.status === f);
    const q = (this.stockSearch || '').toLowerCase();
    if (q) p = p.filter((x) => x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q));
    return p;
  });

  readonly sortedLots = computed(() => [...this.lots()].sort((a, b) => (a.expiry || '').localeCompare(b.expiry || '')));

  readonly expiringLots = computed(() => this.lots().filter((l) => this.daysUntil(l.expiry) <= 10));

  expiringLotsLabel(): string {
    return this.expiringLots().map((l) => `${this.productName(l.productId)} (${l.id})`).join(' · ');
  }

  daysUntil(date?: string): number {
    if (!date) return 9999;
    const d = new Date(date);
    if (isNaN(+d)) return 9999;
    return Math.ceil((+d - Date.now()) / (1000 * 60 * 60 * 24));
  }

  productName(id: string): string { return this.products().find((p) => p.id === id)?.name ?? id; }
  warehouseName(id?: string): string { return this.warehouses().find((w) => w.id === id)?.name ?? (id || ''); }

  zonePct(z: { capacity?: number; used?: number }): number {
    if (!z.capacity) return 0;
    return Math.min(100, ((z.used || 0) / z.capacity) * 100);
  }
  zoneColor(z: { capacity?: number; used?: number }): string {
    const p = this.zonePct(z) / 100;
    if (p >= 0.9) return '#EF4444';
    if (p >= 0.75) return '#F97316';
    return '#22C55E';
  }
  availColor(p: Product): string {
    const a = p.stock - (p.reserved || 0);
    if (a <= 0) return '#B91C1C';
    if (a < (p.minStock || 0)) return '#C2410C';
    return '#15803D';
  }

  stockBadge(s?: string): string {
    if (s === 'low') return 'badge-amber';
    if (s === 'out') return 'badge-red';
    return 'badge-green';
  }
  stockLabel(s?: string): string {
    if (s === 'low') return this.i18n.t('inventory.stockLow');
    if (s === 'out') return this.i18n.t('inventory.stockOut');
    return this.i18n.t('inventory.stockOk');
  }
  filterLabel(f: StockFilter): string {
    if (f === 'all') return this.i18n.t('common.all');
    if (f === 'ok') return 'OK';
    if (f === 'low') return this.i18n.t('inventory.stockLow');
    return this.i18n.t('inventory.stockOut');
  }

  constructor() {
    forkJoin({
      products: this.api.products(),
      warehouses: this.api.warehouses(),
      lots: this.api.lots(),
    }).subscribe({
      next: ({ products, warehouses, lots }) => {
        this.products.set(products);
        this.warehouses.set(warehouses);
        this.lots.set(lots);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

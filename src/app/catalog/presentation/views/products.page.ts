import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CatalogStore } from '@app/catalog/application/catalog.store';
import { Category, Product } from '@app/catalog/domain/model';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'nx-products',
    imports: [
        CommonModule,
        FormsModule,
        MatProgressBarModule,
    ],
    template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">Catálogo</div>
          <div class="page-subtitle">{{ products().length }} productos refrigerados autorizados</div>
        </div>
        <button class="btn btn-primary" (click)="router.navigate(['/orders/new'])">
          <i class="pi pi-file-edit" aria-hidden="true"></i> Crear pedido
        </button>
      </div>

      <div class="filter-bar catalog-management-filter-bar" role="toolbar" aria-label="Filtros de catálogo">
        <div class="search-input">
          <i class="pi pi-search" aria-hidden="true"></i>
          <input [(ngModel)]="search" placeholder="Buscar nombre, SKU, categoría o marca..." aria-label="Buscar nombre, SKU, categoría o marca" />
        </div>
        <div class="catalog-management-filter-scroll" aria-label="Filtros de catálogo">
          <button class="filter-chip" [class.active]="categoryFilter === 'all'" (click)="categoryFilter = 'all'" [attr.aria-pressed]="categoryFilter === 'all'">Todos</button>
          @for (cat of categoryNames(); track cat) {
            <button class="filter-chip" [class.active]="categoryFilter === cat" (click)="categoryFilter = cat" [attr.aria-pressed]="categoryFilter === cat">{{ cat }}</button>
          }
          @for (status of stockFilters; track status) {
            <button class="filter-chip" [class.active]="stockFilter === status" (click)="stockFilter = status" [attr.aria-pressed]="stockFilter === status">
              {{ status === 'all' ? 'Todo stock' : statusLabel(status) }}
            </button>
          }
          @for (type of coldTypes(); track type) {
            <button class="filter-chip" [class.active]="coldTypeFilter === type" (click)="coldTypeFilter = type" [attr.aria-pressed]="coldTypeFilter === type">
              {{ type === 'all' ? 'Toda cadena de frío' : coldTypeLabel(type) }}
            </button>
          }
          @for (brand of brands(); track brand) {
            <button class="filter-chip" [class.active]="brandFilter === brand" (click)="brandFilter = brand" [attr.aria-pressed]="brandFilter === brand">
              {{ brand === 'all' ? 'Todas las marcas' : brand }}
            </button>
          }
        </div>
        <span class="flow-note">{{ filteredSummary() }}</span>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" style="margin-bottom:16px"></mat-progress-bar>
        <div class="catalog-grid">
          @for (_ of [1,2,3,4,5,6,7,8]; track _) {
            <div class="card" style="overflow:hidden">
              <div class="skeleton" style="height:128px;border-radius:10px 10px 0 0"></div>
              <div class="card-pad"><div class="skeleton" style="height:14px;margin-bottom:8px"></div><div class="skeleton" style="height:12px;width:70%"></div></div>
            </div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-box"></i></div>
            <div class="empty-state-title">Sin productos</div>
            <div class="empty-state-desc">Ajusta búsqueda o categoría para ver productos disponibles.</div>
          </div>
        </div>
      } @else {
        <div class="catalog-grid" role="list" aria-label="Catálogo">
          @for (p of filtered(); track p.id) {
            <button class="card product-card" role="listitem" (click)="openDetail(p)" [attr.aria-label]="'Ver detalle de ' + p.name">
              <div class="product-placeholder" [class]="'product-placeholder cat-' + (p.cat || 'default')" style="position:relative">
                @if (p.imageUrl) {
                  <img class="catalog-product-image" [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
                } @else {
                  <div class="pp-icon"><i class="pi pi-box"></i></div>
                  <div class="pp-cat">{{ p.category }}</div>
                  <div class="pp-hint">Imagen del producto</div>
                }
                @if (p.status === 'out') {
                  <div style="position:absolute;inset:0;background:rgba(249,247,244,0.7);display:flex;align-items:center;justify-content:center">
                    <span class="badge badge-red">Sin stock</span>
                  </div>
                }
              </div>
              <div style="padding:12px;flex:1;text-align:left">
                <div style="font-size:13px;font-weight:500;color:#111827;line-height:1.3;margin-bottom:5px">{{ p.name }}</div>
                <div class="mono" style="font-size:10px;margin-bottom:8px">{{ p.sku }}</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  @if (p.coldType) { <span [class]="coldTypeBadge(p.coldType)">{{ coldTypeLabel(p.coldType) }}</span> }
                  @if (p.temp || p.temperatureRange) { <span class="badge-temp">{{ p.temperatureRange || p.temp }}</span> }
                  <span [class]="'badge ' + statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
                </div>
                @if (brandForProduct(p)) {
                  <div class="catalog-brand-line">Marca: {{ brandForProduct(p) }}</div>
                }
              </div>
              <div style="padding:10px 12px;border-top:1px solid #F3F0EC;display:flex;justify-content:space-between;align-items:center">
                <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700">S/ {{ p.price | number:'1.2-2' }}</span>
                <span style="font-size:11px;color:#6B7280">{{ available(p) }} {{ p.unit }} disp.</span>
              </div>
            </button>
          }
        </div>

        <div class="grid-3" style="margin-top:18px">
          @for (item of categorySummary(); track item.category) {
            <div class="card card-pad">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
                <div>
                  <div class="card-title">{{ item.category }}</div>
                  <div class="flow-note">{{ item.total }} productos</div>
                </div>
                <span [class]="'badge ' + (item.low ? 'badge-amber' : 'badge-green')">{{ item.low ? item.low + ' bajo stock' : 'OK' }}</span>
              </div>
            </div>
          }
        </div>
      }

      @if (detail(); as d) {
        <div class="modal-overlay" role="dialog" aria-modal="true" [attr.aria-label]="'Detalle de ' + d.name" (click)="closeDetail()">
          <div class="card product-detail-modal" (click)="$event.stopPropagation()">
            <div [class]="'product-placeholder cat-' + (d.cat || 'default')" style="height:160px;border-radius:0">
              @if (d.imageUrl) {
                <img class="catalog-product-image" [src]="d.imageUrl" [alt]="d.name" />
              } @else {
                <div class="pp-icon" style="font-size:40px"><i class="pi pi-box"></i></div>
                <div class="pp-cat">{{ d.category }}</div>
              }
            </div>
            <div style="padding:20px">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px">
                <div>
                  <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:4px">{{ d.name }}</div>
                  <div class="mono" style="font-size:11px;color:#9CA3AF">{{ d.sku }}</div>
                </div>
                <button class="btn btn-ghost btn-sm" (click)="closeDetail()" aria-label="Cerrar"><i class="pi pi-times"></i></button>
              </div>
              <div class="product-detail-grid">
                <div class="detail-tile"><div class="detail-label">Temperatura</div><div class="detail-value"><i class="pi pi-thermometer"></i> {{ d.temperatureRange || d.temp || 'N/D' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Unidad</div><div class="detail-value">{{ d.unit || 'N/D' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Stock disponible</div><div class="detail-value strong">{{ available(d) }} <span>{{ d.unit }}</span></div></div>
                <div class="detail-tile"><div class="detail-label">Precio</div><div class="detail-value price">S/ {{ d.price | number:'1.2-2' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Almacén</div><div class="detail-value">{{ d.warehouse || 'N/D' }} / {{ d.zone || 'N/D' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Estado</div><span [class]="'badge ' + statusBadge(d.status)">{{ statusLabel(d.status) }}</span></div>
                <div class="detail-tile"><div class="detail-label">Marca</div><div class="detail-value">{{ brandForProduct(d) || 'N/D' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Cadena de frío</div><div class="detail-value">{{ coldTypeLabel(d.coldType || 'chilled') }}</div></div>
              </div>
              @if (d.description || d.knowledge) {
                <div class="banner banner-info">
                  <i class="pi pi-info-circle"></i>
                  <span>{{ d.description || d.knowledge }}</span>
                </div>
              }
              <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn btn-ghost" (click)="closeDetail()">Cerrar</button>
                <button class="btn btn-primary" (click)="router.navigate(['/orders/new']); closeDetail()"><i class="pi pi-file-edit"></i> Crear pedido</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductsPage {
  private readonly store = inject(CatalogStore);
  readonly router = inject(Router);
  readonly loading = this.store.loading;
  readonly products = this.store.products;
  readonly categories = this.store.categories;
  readonly detail = signal<Product | null>(null);
  readonly stockFilters = ['all', 'ok', 'low', 'out'];
  search = '';
  categoryFilter = 'all';
  stockFilter = 'all';
  coldTypeFilter = 'all';
  brandFilter = 'all';

  categoryNames(): string[] {
    return [...new Set(this.products().map((p) => p.category).filter(Boolean))];
  }
  coldTypes(): string[] {
    return ['all', ...new Set(this.products().map((p) => p.coldType).filter((type): type is string => !!type))];
  }
  brands(): string[] {
    return ['all', ...new Set(this.products().map((p) => this.brandForProduct(p)).filter(Boolean))];
  }
  categorySummary(): Array<{ category: string; total: number; low: number }> {
    return this.categoryNames().map((category) => ({
      category,
      total: this.products().filter((product) => product.category === category).length,
      low: this.products().filter((product) => product.category === category && product.status === 'low').length,
    }));
  }
  filteredSummary(): string {
    return `${this.filtered().length} de ${this.products().length} productos visibles`;
  }
  filtered(): Product[] {
    const term = this.search.toLowerCase();
    return this.products().filter((p) => {
      const haystack = `${p.name} ${p.sku} ${p.category} ${this.brandForProduct(p)}`.toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (this.categoryFilter !== 'all' && p.category !== this.categoryFilter) return false;
      if (this.stockFilter !== 'all' && p.status !== this.stockFilter) return false;
      if (this.coldTypeFilter !== 'all' && p.coldType !== this.coldTypeFilter) return false;
      if (this.brandFilter !== 'all' && this.brandForProduct(p) !== this.brandFilter) return false;
      return true;
    });
  }
  available(p: Product): number { return Math.max(0, (p.stock ?? 0) - (p.reserved ?? 0)); }
  statusLabel(status?: string): string {
    return status === 'ok' ? 'Disponible' : status === 'low' ? 'Stock bajo' : status === 'out' ? 'Sin stock' : 'Disponible';
  }
  statusBadge(status?: string): string {
    return { ok: 'badge-green', low: 'badge-amber', out: 'badge-red' }[status || 'ok'] || 'badge-gray';
  }
  coldTypeLabel(type?: string): string {
    return type === 'frozen' ? 'Congelado' : type === 'ambient' ? 'Ambiente' : 'Refrigerado';
  }
  coldTypeBadge(type?: string): string {
    return type === 'frozen' ? 'badge badge-blue' : type === 'ambient' ? 'badge badge-gray' : 'badge badge-cyan';
  }
  brandForProduct(product: Product): string {
    return product.brand || product.brandName || 'Marca pendiente';
  }
  openDetail(p: Product): void { this.detail.set(p); }
  closeDetail(): void { this.detail.set(null); }

  constructor() {
    this.store.load();
  }
}

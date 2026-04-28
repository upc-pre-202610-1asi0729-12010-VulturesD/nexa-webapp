import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductsApi } from '../../infrastructure/products-api';
import { Category, Product } from '@app/catalog/domain/model';

@Component({
  selector: 'nx-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">Catálogo</div>
          <div class="page-subtitle">{{ products().length }} productos · Lima Norte y Callao</div>
        </div>
        <button class="btn btn-primary" (click)="router.navigate(['/orders/new'])">
          <i class="pi pi-file-edit"></i> Crear pedido
        </button>
      </div>

      <div class="filter-bar" role="toolbar" aria-label="Filtros">
        <div class="search-input">
          <i class="pi pi-search"></i>
          <input [(ngModel)]="search" placeholder="Buscar nombre o SKU..." />
        </div>
        <button class="filter-chip" [class.active]="categoryFilter === ''" (click)="categoryFilter = ''">Todos</button>
        @for (cat of categoryNames(); track cat) {
          <button class="filter-chip" [class.active]="categoryFilter === cat" (click)="categoryFilter = cat">{{ cat }}</button>
        }
      </div>

      @if (loading()) {
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
                <div class="pp-icon"><i class="pi pi-box"></i></div>
                <div class="pp-cat">{{ p.category }}</div>
                <div class="pp-hint">Imagen del producto</div>
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
                  @if (p.temp) { <span class="badge-temp">{{ p.temp }}</span> }
                  <span [class]="'badge ' + statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
                </div>
              </div>
              <div style="padding:10px 12px;border-top:1px solid #F3F0EC;display:flex;justify-content:space-between;align-items:center">
                <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700">S/ {{ p.price | number:'1.2-2' }}</span>
                <span style="font-size:11px;color:#6B7280">{{ available(p) }} {{ p.unit }} disp.</span>
              </div>
            </button>
          }
        </div>
      }

      @if (detail(); as d) {
        <div class="modal-overlay" role="dialog" aria-modal="true" [attr.aria-label]="'Detalle de ' + d.name" (click)="closeDetail()">
          <div class="card product-detail-modal" (click)="$event.stopPropagation()">
            <div [class]="'product-placeholder cat-' + (d.cat || 'default')" style="height:160px;border-radius:0">
              <div class="pp-icon" style="font-size:40px"><i class="pi pi-box"></i></div>
              <div class="pp-cat">{{ d.category }}</div>
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
                <div class="detail-tile"><div class="detail-label">Temperatura</div><div class="detail-value"><i class="pi pi-thermometer"></i> {{ d.temp || 'N/D' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Unidad</div><div class="detail-value">{{ d.unit || 'N/D' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Stock disponible</div><div class="detail-value strong">{{ available(d) }} <span>{{ d.unit }}</span></div></div>
                <div class="detail-tile"><div class="detail-label">Precio</div><div class="detail-value price">S/ {{ d.price | number:'1.2-2' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Almacén</div><div class="detail-value">{{ d.warehouse || 'N/D' }} / {{ d.zone || 'N/D' }}</div></div>
                <div class="detail-tile"><div class="detail-label">Estado</div><span [class]="'badge ' + statusBadge(d.status)">{{ statusLabel(d.status) }}</span></div>
              </div>
              <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn btn-ghost" (click)="closeDetail()">Cerrar</button>
                <button class="btn btn-primary" (click)="router.navigate(['/orders/new']); closeDetail()"><i class="pi pi-file-edit"></i> Crear pedido</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductsPage {
  private readonly api = inject(ProductsApi);
  readonly router = inject(Router);
  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly detail = signal<Product | null>(null);
  search = '';
  categoryFilter = '';

  categoryNames(): string[] {
    return [...new Set(this.products().map((p) => p.category).filter(Boolean))];
  }
  filtered(): Product[] {
    const term = this.search.toLowerCase();
    return this.products().filter((p) => {
      if (term && !`${p.name} ${p.sku}`.toLowerCase().includes(term)) return false;
      if (this.categoryFilter && p.category !== this.categoryFilter) return false;
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
  openDetail(p: Product): void { this.detail.set(p); }
  closeDetail(): void { this.detail.set(null); }

  constructor() {
    forkJoin({ products: this.api.list(), categories: this.api.categories() }).subscribe({
      next: ({ products, categories }) => {
        this.products.set(products);
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

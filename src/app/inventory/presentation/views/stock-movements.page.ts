import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { InventoryQueriesStore } from '@app/inventory/application/inventory-queries.store';
import { StockMovement, Warehouse } from '@app/inventory/domain/model';
import { Product } from '@app/catalog/domain/model';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { IamStore } from '@app/iam/application/iam.store';

@Component({
    selector: 'nx-stock-movements',
    imports: [FormsModule, TranslatePipe],
    template: `
    <div class="page">
      <div class="page-header"><div><div class="page-title">{{ 'inventory.movements.title' | t }}</div><div class="page-subtitle">{{ 'inventory.movements.subtitle' | t }}</div></div>@if (canManage()) { <button class="btn btn-primary" type="button" (click)="openForm()"><i class="pi pi-plus"></i>{{ 'inventory.registerMovement' | t }}</button> }</div>

      @if (showForm()) {
        <form class="flow-panel flow-panel-pad movement-form" (ngSubmit)="saveMovement()">
          <div class="editor-heading span-full"><strong>{{ 'inventory.registerMovement' | t }}</strong><span>{{ 'inventory.form.updatesStock' | t }}</span></div>
          <label>{{ 'inventory.table.product' | t }}<select [(ngModel)]="productId" name="productId" required>@for (product of products(); track product.id) { <option [value]="product.id">{{ product.name }}</option> }</select></label>
          <label>{{ 'inventory.table.warehouse' | t }}<select [(ngModel)]="warehouse" name="warehouse">@for (item of warehouses(); track item.id) { <option [value]="item.name">{{ item.name }}</option> }</select></label>
          <label>{{ 'inventory.table.type' | t }}<select [(ngModel)]="movementType" name="movementType"><option value="entry">{{ 'inventory.movementType.entry' | t }}</option><option value="exit">{{ 'inventory.movementType.exit' | t }}</option><option value="adjustment">{{ 'inventory.movementType.adjustment' | t }}</option><option value="reservation_release">{{ 'inventory.movementType.reservation_release' | t }}</option></select></label>
          <label>{{ 'inventory.table.qty' | t }}<input [(ngModel)]="quantity" name="quantity" type="number" min="-999" required></label>
          <label>{{ 'inventory.table.lot' | t }}<input [(ngModel)]="lotId" name="lotId"></label>
          <label>{{ 'inventory.table.expiry' | t }}<input [(ngModel)]="expirationDate" name="expirationDate" type="date"></label>
          <label>{{ 'inventory.form.temperatureReading' | t }}<input [(ngModel)]="temperatureReading" name="temperatureReading" type="number" min="-30" max="20" step="0.1"></label>
          <label class="span-full">{{ 'inventory.table.note' | t }}<textarea [(ngModel)]="note" name="note" rows="2"></textarea></label>
          @if (actionError()) { <div class="banner banner-danger span-full" role="alert">{{ actionError() }}</div> }
          <div class="form-actions span-full"><button class="btn btn-secondary" type="button" [disabled]="saving()" (click)="showForm.set(false)">{{ 'common.cancel' | t }}</button><button class="btn btn-primary" type="submit" [disabled]="saving() || !productId || quantity === 0">{{ (saving() ? 'common.saving' : 'common.save') | t }}</button></div>
        </form>
      }

      <div class="card">
        @if (loading()) {
          <div class="card-pad"><div class="skeleton" style="height:14px"></div></div>
        } @else if (movements().length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-sync"></i></div>
            <div class="empty-state-title">{{ 'inventory.movements.empty' | t }}</div>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr><th>{{ 'inventory.table.date' | t }}</th><th>{{ 'inventory.table.type' | t }}</th><th>{{ 'inventory.table.product' | t }}</th><th>{{ 'inventory.table.lot' | t }}</th><th>{{ 'inventory.table.qty' | t }}</th><th>{{ 'inventory.table.order' | t }}</th><th>{{ 'inventory.table.user' | t }}</th><th>{{ 'inventory.table.note' | t }}</th></tr>
            </thead>
            <tbody>
              @for (m of movements(); track m.id) {
                <tr>
                  <td>{{ m.date }}</td>
                  <td><span class="badge" [class]="typeClass(m.type)">{{ movementTypeLabel(m.type) }}</span></td>
                  <td>{{ productName(m.productId || '') }}</td>
                  <td><span class="text-mono">{{ m.lotId }}</span></td>
                  <td><strong>{{ m.qty }}</strong></td>
                  <td><span class="text-mono">{{ m.orderId || '—' }}</span></td>
                  <td>{{ m.user }}</td>
                  <td class="muted">{{ m.note }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .movement-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;align-items:end;margin-bottom:18px}.movement-form label{display:grid;gap:7px;color:#334155;font-size:12px;font-weight:800}.movement-form input,.movement-form select,.movement-form textarea{width:100%;min-height:42px;padding:8px 11px;border:1px solid #cbd5e1;border-radius:8px;box-sizing:border-box;background:#fff}.span-full{grid-column:1/-1}.editor-heading{display:flex;justify-content:space-between;gap:12px}.editor-heading span{color:#64748b;font-size:12px}.form-actions{display:flex;justify-content:flex-end;gap:10px}@media(max-width:900px){.movement-form{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.movement-form{grid-template-columns:1fr}}
  `]
})
export class StockMovementsPage {
  private readonly api = inject(InventoryQueriesStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);
  readonly loading = signal(true);
  readonly movements = signal<StockMovement[]>([]);
  readonly products = signal<Product[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly actionError = signal('');
  readonly canManage = computed(() => ['owner', 'logistics'].includes(this.session.roleKey() || ''));
  productId = '';
  warehouse = '';
  movementType = 'entry';
  quantity = 1;
  lotId = '';
  expirationDate = '';
  temperatureReading = 4;
  note = '';

  productName(id: string): string {
    return this.products().find((p) => p.id === id)?.name ?? id;
  }

  typeClass(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('in') || t === 'entry' || t === 'entrada') return 'badge-green';
    if (t.includes('out') || t === 'salida') return 'badge-blue';
    if (t.includes('adjust') || t === 'ajuste') return 'badge-amber';
    return 'badge-gray';
  }

  movementTypeLabel(type: string): string { return this.i18n.t(`inventory.movementType.${type}`); }

  openForm(): void {
    this.productId = this.products()[0]?.id || '';
    this.warehouse = this.warehouses()[0]?.name || '';
    this.movementType = 'entry';
    this.quantity = 1;
    this.lotId = '';
    this.expirationDate = '';
    this.temperatureReading = 4;
    this.note = '';
    this.actionError.set('');
    this.showForm.set(true);
  }

  saveMovement(): void {
    if (!this.productId || !this.quantity) return;
    this.saving.set(true);
    this.actionError.set('');
    this.api.createMovement({ productId: this.productId, warehouse: this.warehouse, type: this.movementType,
      quantity: this.quantity, lotId: this.lotId || undefined, expirationDate: this.expirationDate || undefined,
      temperatureReading: this.temperatureReading, note: this.note, user: this.session.user()?.name || '' }).subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: (error: { error?: { details?: string[]; message?: string }; message?: string }) => {
        this.saving.set(false);
        this.actionError.set(error.error?.details?.[0] || error.error?.message || error.message || this.i18n.t('inventory.movements.saveError'));
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    forkJoin({ movements: this.api.movements(), products: this.api.products(), warehouses: this.api.warehouses() }).subscribe({
      next: ({ movements, products, warehouses }) => { this.movements.set(movements); this.products.set(products); this.warehouses.set(warehouses); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  constructor() {
    this.load();
  }
}

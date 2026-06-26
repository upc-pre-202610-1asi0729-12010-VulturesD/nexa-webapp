import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionsStore } from '@app/dashboard/application/promotions.store';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { Product } from '@app/catalog/domain/model';
import { Promotion } from '@app/dashboard/domain/model';

@Component({
  selector: 'nx-promotions-manager',
  imports: [CommonModule, FormsModule, NexaIconComponent],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">Promotions</div>
          <div class="page-subtitle">Commercial campaign planning for buyer visibility, pricing rules, and catalog activation.</div>
        </div>
        <div class="promotions-header-actions">
          <button class="btn btn-primary" type="button" (click)="openCreateModal()">
            <nx-icon name="pi-plus" aria-hidden="true" style="margin-right: 6px;"></nx-icon> Add promotion
          </button>
        </div>
      </div>

      <section class="scenario-card">
        <div class="scenario-icon">
          <nx-icon name="pi-megaphone"></nx-icon>
        </div>
        <div>
          <strong>Buyer visibility scenario</strong>
          <p>Chilled cheese rotation, charcuterie packs, and frozen seafood planning connect Catalog visibility with Sales validation.</p>
        </div>
      </section>

      @if (loading()) {
        <div class="flow-panel flow-panel-pad">
          <div class="skeleton" style="height:32px; margin-bottom:12px"></div>
          <div class="skeleton" style="height:16px; width:70%"></div>
        </div>
      } @else if (error()) {
        <div class="banner banner-info">
          <nx-icon name="pi-exclamation-triangle"></nx-icon>
          <span>{{ error() }}</span>
        </div>
      } @else {
        <!-- KPI Row 1 -->
        <div class="grid-4" role="region" aria-label="KPIs">
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-megaphone" aria-hidden="true" style="color: #64748b;"></i> Campaigns</div>
            <div class="kpi-value">{{ campaignsCount() }}</div>
            <div class="kpi-sub">Workspace commercial campaign records</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-check-circle" style="color:#16A34A" aria-hidden="true"></i> Active</div>
            <div class="kpi-value" style="color:#16A34A">{{ activeCount() }}</div>
            <div class="kpi-sub">Visible to buyer or commercial teams</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B" aria-hidden="true"></i> Scheduled</div>
            <div class="kpi-value" style="color:#F59E0B">{{ scheduledCount() }}</div>
            <div class="kpi-sub">Ready for validity window</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-box" style="color:#2563EB" aria-hidden="true"></i> Real catalog</div>
            <div class="kpi-value" style="color:#2563EB">{{ realCatalogCount() }}</div>
            <div class="kpi-sub">Campaigns linked to catalog/category scope</div>
          </div>
        </div>

        <!-- Mix Metrics Row -->
        <div class="metrics-grid">
          <div class="metric-panel">
            <div class="metric-panel-header">
              <span class="metric-panel-title">Campaign Status Mix</span>
              <span class="metric-panel-meta">{{ activeCount() + scheduledCount() }} ready or planned</span>
            </div>
            <div class="metric-row">
              <span class="metric-row-label">Active</span>
              <div class="metric-row-bar-wrapper">
                <div class="metric-row-bar green" [style.width.%]="activePercent()"></div>
              </div>
              <span class="metric-row-value">{{ activeCount() }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-row-label">Draft</span>
              <div class="metric-row-bar-wrapper">
                <div class="metric-row-bar blue" [style.width.%]="draftPercent()"></div>
              </div>
              <span class="metric-row-value">{{ draftCount() }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-row-label">Inactive</span>
              <div class="metric-row-bar-wrapper">
                <div class="metric-row-bar gray" [style.width.%]="inactivePercent()"></div>
              </div>
              <span class="metric-row-value">{{ inactiveCount() }}</span>
            </div>
          </div>

          <div class="metric-panel">
            <div class="metric-panel-header">
              <span class="metric-panel-title">Commercial Scope</span>
              <span class="metric-panel-meta">{{ buyerVisibleCount() }} buyer-visible now</span>
            </div>
            <div class="metric-row">
              <span class="metric-row-label" style="width: 100px;">Buyer Portal</span>
              <div class="metric-row-bar-wrapper">
                <div class="metric-row-bar blue" [style.width.%]="100"></div>
              </div>
              <span class="metric-row-value" style="width: 60px;">{{ campaignsCount() }} 100%</span>
            </div>
          </div>

          <div class="metric-panel">
            <div class="metric-panel-header">
              <span class="metric-panel-title">Rule Type</span>
              <span class="metric-panel-meta">Pricing without guessing</span>
            </div>
            <div class="metric-row">
              <span class="metric-row-label" style="width: 120px;">Percentage Discount</span>
              <div class="metric-row-bar-wrapper">
                <div class="metric-row-bar blue" [style.width.%]="100"></div>
              </div>
              <span class="metric-row-value" style="width: 60px;">{{ campaignsCount() }} 100%</span>
            </div>
          </div>
        </div>

        <!-- Lower KPIs Row -->
        <div class="lower-kpis-grid">
          <div class="lower-kpi-card">
            <div class="lower-kpi-icon"><i class="pi pi-eye"></i></div>
            <div class="lower-kpi-copy">
              <strong>{{ buyerVisibleCount() }}</strong>
              <span>Buyer-visible campaigns<br>Active and published to Buyer Portal</span>
            </div>
          </div>
          <div class="lower-kpi-card">
            <div class="lower-kpi-icon"><i class="pi pi-box"></i></div>
            <div class="lower-kpi-copy">
              <strong>{{ campaignProductsCount() }}</strong>
              <span>Products with campaign<br>Catalog SKUs selected in promotions</span>
            </div>
          </div>
          <div class="lower-kpi-card">
            <div class="lower-kpi-icon"><i class="pi pi-file-edit"></i></div>
            <div class="lower-kpi-copy">
              <strong>{{ draftCount() }}</strong>
              <span>Needs Sales review<br>Draft, standby, or inactive records</span>
            </div>
          </div>
        </div>

        @if (!promotions().length) {
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-database" aria-hidden="true"></i></div>
            <div class="empty-state-title">Campaign workspace empty</div>
            <div class="empty-state-desc">No promotion campaigns have been created in the system yet.</div>
          </div>
        } @else {
          <div class="promotions-grid">
            @for (promo of promotions(); track promo.id) {
              <article class="promo-card">
                <div>
                  <div class="promo-card-top">
                    <span class="promo-status-badge" [class]="statusClass(promo.status)">
                      ● {{ promo.status | titlecase }}
                    </span>
                    <span class="promo-visibility-label">{{ visibilityLabel(promo.visibility) }}</span>
                  </div>
                  <h2>{{ promo.name }}</h2>
                  <div class="promo-discount-sub">{{ promo.discountLabel }}</div>
                  <p class="promo-description">{{ promo.description }}</p>
                </div>
                <div class="promo-rule-box">
                  <span class="promo-rule-header">Rule shown to Sales and Buyer Portal</span>
                  <span class="promo-rule-applied">{{ promo.discountLabel || '8% discount applied' }}</span>
                </div>
              </article>
            }
          </div>
        }
      }
    </div>

    <!-- Create Promotion Modal -->
    @if (showCreateModal()) {
      <div class="modal-overlay" (click)="closeModal()"></div>
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Add New Promotion</h3>
          <button type="button" class="btn-close" (click)="closeModal()">
            <nx-icon name="pi-times"></nx-icon>
          </button>
        </div>
        <form (ngSubmit)="submitPromotion()" class="modal-form">
          <div class="form-row">
            <label>Code
              <input [(ngModel)]="formCode" name="formCode" required placeholder="e.g. PROMO-COLD-004" class="form-control" />
            </label>
            <label>Name
              <input [(ngModel)]="formName" name="formName" required placeholder="e.g. Summer discount" class="form-control" />
            </label>
          </div>
          <div class="form-row">
            <label>Discount Label
              <input [(ngModel)]="formDiscountLabel" name="formDiscountLabel" required placeholder="e.g. 10% commercial adjustment" class="form-control" />
            </label>
            <label>Visibility
              <select [(ngModel)]="formVisibility" name="formVisibility" class="form-control">
                <option value="buyer_portal">Buyer Portal</option>
                <option value="client_specific">Client Specific</option>
                <option value="internal">Internal</option>
              </select>
            </label>
          </div>
          <div class="form-row">
            <label>Status
              <select [(ngModel)]="formStatus" name="formStatus" class="form-control">
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label>Notes
              <input [(ngModel)]="formNotes" name="formNotes" placeholder="e.g. Subject to validation." class="form-control" />
            </label>
          </div>
          <label>Description
            <textarea [(ngModel)]="formDescription" name="formDescription" placeholder="Campaign planning details..." class="form-control" rows="2"></textarea>
          </label>
          <div class="products-selector">
            <span class="selector-title">Select Catalog Products</span>
            <div class="products-grid">
              @for (prod of products(); track prod.id) {
                <label class="prod-checkbox">
                  <input type="checkbox" [checked]="selectedProductIds.has(prod.id)" (change)="toggleProductSelection(prod.id)" />
                  <span>{{ prod.id }} - {{ prod.name }}</span>
                </label>
              }
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              @if (submitting()) { Creating... } @else { Create Promotion }
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [`
    .promotions-header-actions {
      display: flex;
      gap: 10px;
    }
    .scenario-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      margin: 0 0 18px;
      padding: 16px;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      background: #eff6ff;
      font-size: 13px;
    }
    .scenario-icon {
      width: 42px;
      height: 42px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      color: #1d4ed8;
      flex-shrink: 0;
    }
    .scenario-card strong {
      display: block;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .scenario-card p {
      margin: 0;
      color: #475569;
      line-height: 1.55;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 18px;
    }
    .card.kpi-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      padding: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .kpi-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .kpi-label i {
      margin-right: 6px;
    }
    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .kpi-sub {
      font-size: 11px;
      color: #94a3b8;
    }
    
    /* Mix metrics section */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 18px;
    }
    .metric-panel {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .metric-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .metric-panel-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-panel-meta {
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
    }
    .metric-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 12px;
    }
    .metric-row-label {
      width: 80px;
      color: #475569;
      font-weight: 600;
      flex-shrink: 0;
    }
    .metric-row-bar-wrapper {
      flex: 1;
      height: 6px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
      position: relative;
    }
    .metric-row-bar {
      height: 100%;
      border-radius: 999px;
    }
    .metric-row-bar.green { background: #22c55e; }
    .metric-row-bar.blue { background: #3b82f6; }
    .metric-row-bar.gray { background: #cbd5e1; }
    .metric-row-value {
      width: 40px;
      text-align: right;
      font-weight: 700;
      color: #0f172a;
      flex-shrink: 0;
    }
    
    /* Lower KPIs */
    .lower-kpis-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .lower-kpi-card {
      display: flex;
      align-items: center;
      gap: 14px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      padding: 14px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .lower-kpi-icon {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }
    .lower-kpi-copy strong {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      display: block;
      margin-bottom: 2px;
    }
    .lower-kpi-copy span {
      font-size: 11px;
      color: #64748b;
    }
    
    /* Promotion card grid */
    .promotions-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
    }
    .promo-card {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #ffffff;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 220px;
      box-shadow: 0 6px 16px rgba(15,23,42,0.03);
      box-sizing: border-box;
    }
    .promo-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .promo-status-badge {
      display: inline-flex;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .promo-status-badge.active {
      background: #dcfce7;
      color: #15803d;
    }
    .promo-status-badge.scheduled {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .promo-status-badge.inactive {
      background: #f1f5f9;
      color: #475569;
    }
    .promo-visibility-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .promo-card h2 {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
    }
    .promo-discount-sub {
      font-size: 13px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .promo-description {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 16px;
    }
    .promo-rule-box {
      border: 1px solid #dbeafe;
      border-radius: 8px;
      background: #f8fbff;
      padding: 10px 12px;
      font-size: 11px;
    }
    .promo-rule-header {
      font-size: 9px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: block;
    }
    .promo-rule-applied {
      font-size: 12px;
      font-weight: 800;
      color: #1e3a8a;
    }
    
    /* Modal dialog */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15,23,42,0.4);
      backdrop-filter: blur(4px);
      z-index: 999;
    }
    .modal-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(650px, 92%);
      max-height: 90vh;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(15,23,42,0.22);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
    }
    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid #edf2f7;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .btn-close {
      border: 0;
      background: transparent;
      font-size: 18px;
      color: #64748b;
      cursor: pointer;
    }
    .modal-form {
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-sizing: border-box;
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
    .modal-form label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }
    .form-control {
      width: 100%;
      height: 40px;
      border: 1px solid #cbd8ea;
      border-radius: 8px;
      padding: 0 12px;
      font-size: 13px;
      box-sizing: border-box;
    }
    .form-control:focus {
      outline: 0;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    }
    textarea.form-control {
      height: auto;
      padding: 10px 12px;
    }
    .products-selector {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      background: #f8fafc;
    }
    .selector-title {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      display: block;
      margin-bottom: 8px;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      max-height: 140px;
      overflow-y: auto;
      padding: 4px;
    }
    .prod-checkbox {
      display: flex !important;
      flex-direction: row !important;
      align-items: center;
      gap: 8px;
      font-size: 12px !important;
      font-weight: 500 !important;
      cursor: pointer;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #edf2f7;
    }
  `]
})
export class PromotionsManagerPage {
  private readonly store = inject(PromotionsStore);

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly promotions = this.store.promotions;
  readonly products = this.store.products;
  readonly productsCount = this.store.productsCount;

  readonly campaignsCount = computed(() => this.promotions().length);
  readonly activeCount = computed(() => this.promotions().filter(p => p.status === 'active').length);
  readonly scheduledCount = computed(() => this.promotions().filter(p => p.status === 'scheduled').length);
  readonly inactiveCount = computed(() => this.promotions().filter(p => p.status === 'inactive' || p.status === 'paused' || p.status === 'draft').length);
  readonly draftCount = computed(() => this.promotions().filter(p => p.status === 'draft' || p.status === 'scheduled').length);
  readonly realCatalogCount = computed(() => this.productsCount());

  // percentages for bars
  readonly activePercent = computed(() => this.campaignsCount() ? (this.activeCount() / this.campaignsCount()) * 100 : 0);
  readonly draftPercent = computed(() => this.campaignsCount() ? (this.draftCount() / this.campaignsCount()) * 100 : 0);
  readonly inactivePercent = computed(() => this.campaignsCount() ? (this.inactiveCount() / this.campaignsCount()) * 100 : 0);

  readonly buyerVisibleCount = computed(() => this.promotions().filter(p => p.visibility === 'buyer_portal').length);
  readonly campaignProductsCount = computed(() => {
    const ids = new Set<string>();
    this.promotions().forEach(p => p.productIds?.forEach(id => ids.add(id)));
    return ids.size;
  });

  // Modal form states
  readonly showCreateModal = signal(false);
  readonly submitting = signal(false);

  formCode = '';
  formName = '';
  formDiscountLabel = '';
  formVisibility = 'buyer_portal';
  formStatus = 'active';
  formNotes = '';
  formDescription = '';
  selectedProductIds = new Set<string>();

  constructor() {
    this.store.load();
  }

  statusClass(status: string): string {
    if (status === 'active') return 'active';
    if (status === 'scheduled') return 'scheduled';
    return 'inactive';
  }

  visibilityLabel(visibility: string): string {
    if (visibility === 'buyer_portal') return 'Buyer Portal';
    if (visibility === 'client_specific') return 'Client Specific';
    return 'Internal';
  }

  openCreateModal(): void {
    // initialize defaults
    this.formCode = `PROMO-COLD-00${this.promotions().length + 1}`;
    this.formName = '';
    this.formDiscountLabel = '';
    this.formVisibility = 'buyer_portal';
    this.formStatus = 'active';
    this.formNotes = '';
    this.formDescription = '';
    this.selectedProductIds.clear();
    this.showCreateModal.set(true);
  }

  closeModal(): void {
    this.showCreateModal.set(false);
  }

  toggleProductSelection(productId: string): void {
    if (this.selectedProductIds.has(productId)) {
      this.selectedProductIds.delete(productId);
    } else {
      this.selectedProductIds.add(productId);
    }
  }

  submitPromotion(): void {
    if (!this.formCode || !this.formName || !this.formDiscountLabel) return;
    this.submitting.set(true);

    const payload = {
      code: this.formCode,
      name: this.formName,
      campaign: 'General',
      description: this.formDescription || 'No buyer-facing description configured yet.',
      discountLabel: this.formDiscountLabel,
      visibility: this.formVisibility,
      commercialRule: this.formDiscountLabel,
      adjustmentType: 'percentage',
      targetSegment: 'all',
      notes: this.formNotes || 'No notes configured.',
      catalogScope: 'all',
      startsOn: new Date().toISOString().split('T')[0],
      endsOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: this.formStatus,
      productIds: Array.from(this.selectedProductIds)
    };

    this.store.createPromotion(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showCreateModal.set(false);
      },
      error: () => {
        this.submitting.set(false);
        alert('Failed to create promotion. Make sure the code is unique.');
      }
    });
  }
}

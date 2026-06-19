import { Component, inject, signal, computed } from '@angular/core';

import { PromotionsStore } from '@app/dashboard/application/promotions.store';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-promotions-manager',
    imports: [NexaIconComponent],
    template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">Promotions</div>
          <div class="page-subtitle">Commercial campaign planning for buyer visibility, pricing rules, and catalog activation.</div>
        </div>
      </div>

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
        <div class="grid-3" style="margin-bottom:18px" role="region" aria-label="KPIs">
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-megaphone" aria-hidden="true"></i> Campaigns</div>
            <div class="kpi-value">{{ promotions().length }}</div>
            <div class="kpi-sub">Local commercial planning records</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-check-circle" style="color:#16A34A" aria-hidden="true"></i> Active</div>
            <div class="kpi-value" style="color:#16A34A">{{ activeCount() }}</div>
            <div class="kpi-sub">Visible to buyer or commercial teams</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-box" style="color:#2563EB" aria-hidden="true"></i> Real catalog</div>
            <div class="kpi-value" style="color:#2563EB">{{ productsCount() }}</div>
            <div class="kpi-sub">Products loaded from backend catalog</div>
          </div>
        </div>

        @if (!promotions().length) {
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-database" aria-hidden="true"></i></div>
            <div class="empty-state-title">Campaign workspace empty</div>
            <div class="empty-state-desc">No promotion campaigns have been created in the system yet.</div>
          </div>
        } @else {
          <div class="grid-3">
            @for (promo of promotions(); track promo.id) {
              <article class="flow-panel flow-panel-pad" style="display:flex; flex-direction:column; justify-content:space-between">
                <div>
                  <div class="flow-row-between" style="align-items:flex-start">
                    <span class="badge" [class]="statusClass(promo.status)">
                      {{ promo.status }}
                    </span>
                    <span class="flow-pill" style="font-size:12px; padding:3px 8px; background:#f1f5f9; border-radius:12px; color:#475569">{{ visibilityLabel(promo.visibility) }}</span>
                  </div>
                  <h2 style="margin:12px 0 6px; font-size:18px; font-weight:700; color:#1e293b">{{ promo.name }}</h2>
                  <p class="muted-text" style="color:#64748b; font-size:14px; margin:0">{{ promo.description }}</p>
                </div>
                <div>
                  <div class="divider" style="margin:12px 0; border-top:1px solid #e2e8f0"></div>
                  <div class="mini-row" style="display:flex; justify-content:space-between; font-size:13px; color:#334155">
                    <span>Commercial rule</span>
                    <strong style="color:#1d4ed8">{{ promo.discountLabel }}</strong>
                  </div>
                  <div class="flow-note" style="margin-top:8px; font-size:12px; color:#94a3b8; font-style:italic">{{ promo.notes }}</div>
                </div>
              </article>
            }
          </div>
        }
      }
    </div>
  `
})
export class PromotionsManagerPage {
  private readonly store = inject(PromotionsStore);

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly promotions = this.store.promotions;
  readonly productsCount = this.store.productsCount;

  readonly activeCount = this.store.activeCount;

  constructor() {
    this.store.load();
  }

  statusClass(status: string): string {
    if (status === 'active') return 'badge-green';
    if (status === 'scheduled') return 'badge-blue';
    return 'badge-gray';
  }

  visibilityLabel(visibility: string): string {
    return visibility.replace(/_/g, ' ');
  }
}

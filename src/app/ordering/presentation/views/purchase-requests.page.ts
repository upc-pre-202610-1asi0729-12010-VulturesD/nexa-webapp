import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PurchaseRequestsStore } from '@app/ordering/application/purchase-requests.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-purchase-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">Purchase Requests</div>
          <div class="page-subtitle">Buyer request inbox for commercial review before confirmed purchase orders.</div>
        </div>
        <button class="btn btn-primary" (click)="go('/orders/new')">
          <nx-icon name="pi-plus"></nx-icon> Manual Order Entry
        </button>
      </div>

      @if (loading()) {
        <div class="flow-panel flow-panel-pad">
          <div class="skeleton" style="height:24px; margin-bottom: 12px;"></div>
          <div class="skeleton" style="height:16px; width: 60%"></div>
        </div>
      } @else if (error()) {
        <div class="banner banner-info">
          <nx-icon name="pi-exclamation-triangle"></nx-icon>
          <span>{{ error() }}</span>
        </div>
      } @else if (!requests().length) {
        <div class="empty-state">
          <div class="empty-state-icon"><nx-icon name="pi-inbox"></nx-icon></div>
          <div class="empty-state-title">No request records loaded</div>
          <div class="empty-state-desc">The B2B purchase request queue is currently empty.</div>
        </div>
      } @else {
        <div class="flow-stack">
          @for (request of sortedRequests(); track request.id) {
            <article class="flow-panel flow-panel-pad">
              <div class="flow-row-between" style="align-items:flex-start">
                <div>
                  <div class="flow-row" style="margin-bottom:6px">
                    <span class="mono" style="font-weight:800;color:#1D4ED8">{{ request.id }}</span>
                    <span class="badge" [class]="statusClass(request.status)">{{ statusLabel(request.status) }}</span>
                  </div>
                  <h2 style="margin:0; font-size: 18px; font-weight: 700; color: #1e293b;">{{ clientName(request.clientId) }}</h2>
                  <p class="muted-text" style="margin: 6px 0 0; color: #64748b; font-size: 14px;">{{ request.comments || 'No comments provided.' }}</p>
                </div>
                <span class="badge" [class]="priorityClass(request.priority)">{{ request.priority || 'normal' }}</span>
              </div>
              <div class="divider" style="margin:12px 0; border-top: 1px solid #e2e8f0;"></div>
              <div class="flow-row" style="justify-content:space-between;gap:12px;flex-wrap:wrap; font-size: 13px; color: #475569;">
                <span>Delivery: <strong>{{ request.requestedDeliveryDate }}</strong></span>
                <span>Items: <strong>{{ request.items.length || 0 }}</strong></span>
                <span>Documents: <strong>{{ request.documentProfile || 'standard_docs' }}</strong></span>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .priority-high { background: #fee2e2; color: #991b1b; }
    .priority-normal { background: #f1f5f9; color: #334155; }
    .priority-low { background: #f0fdf4; color: #166534; }
  `]
})
export class PurchaseRequestsPage {
  private readonly store = inject(PurchaseRequestsStore);
  private readonly router = inject(Router);

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly requests = this.store.requests;
  readonly clients = this.store.clients;

  readonly sortedRequests = this.store.sortedRequests;

  constructor() {
    this.store.load();
  }

  clientName(clientId: string): string {
    return this.store.clientName(clientId);
  }

  statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  statusClass(status: string): string {
    if (/submitted|in_review/i.test(status)) return 'badge-amber';
    if (/approved|completed|converted/i.test(status)) return 'badge-green';
    if (/rejected|cancelled/i.test(status)) return 'badge-red';
    return 'badge-gray';
  }

  priorityClass(priority: string): string {
    const p = (priority || 'normal').toLowerCase();
    if (p === 'high' || p === 'urgent') return 'priority-high';
    if (p === 'low') return 'priority-low';
    return 'priority-normal';
  }

  go(path: string): void {
    void this.router.navigate([path]);
  }
}

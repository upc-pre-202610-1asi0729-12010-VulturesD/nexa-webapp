import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessDocumentsStore } from '@app/dashboard/application/business-documents.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-business-documents-center',
  standalone: true,
  imports: [CommonModule, TranslatePipe, NexaIconComponent],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">Business Documents</div>
          <div class="page-subtitle">Invoice records loaded from the Nexa backend invoicing endpoints.</div>
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
            <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B" aria-hidden="true"></i> Pending</div>
            <div class="kpi-value" style="color:#F59E0B">{{ pendingCount() }}</div>
            <div class="kpi-sub">Invoices awaiting payment confirmation</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-check" style="color:#16A34A" aria-hidden="true"></i> Accepted</div>
            <div class="kpi-value" style="color:#16A34A">{{ acceptedCount() }}</div>
            <div class="kpi-sub">Invoices marked as paid</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-wallet" style="color:#2563EB" aria-hidden="true"></i> Total billed</div>
            <div class="kpi-value" style="color:#2563EB">S/ {{ totalAmount().toFixed(2) }}</div>
            <div class="kpi-sub">Current backend invoice amount</div>
          </div>
        </div>

        <div class="filter-bar" style="margin-bottom:18px; display:flex; gap:8px">
          @for (filter of ['all', 'pending', 'accepted']; track filter) {
            <button
              type="button"
              class="filter-chip"
              [class.active]="statusFilter() === filter"
              (click)="statusFilter.set(filter)">
              {{ filter === 'all' ? 'All invoices' : (filter | titlecase) }}
            </button>
          }
        </div>

        <section class="flow-panel">
          <div class="flow-panel-head">
            <div>
              <div class="flow-title">Invoices</div>
              <div class="flow-subtitle">Mapped from '/api/v1/invoices'; payment references are available in the Payments page.</div>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Purchase Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                </tr>
              </thead>
              <tbody>
                @for (doc of filteredDocuments(); track doc.id) {
                  <tr>
                    <td>
                      <div style="font-weight:800; color: #1e293b;">{{ doc.label || doc.id }}</div>
                      <div class="flow-note" style="font-size:12px; color:#64748b">{{ doc.fileName }}</div>
                    </td>
                    <td><span class="mono" style="font-family:monospace">{{ doc.orderId }}</span></td>
                    <td>{{ clientName(doc.clientId) }}</td>
                    <td style="font-weight:700">S/ {{ doc.amount.toFixed(2) }}</td>
                    <td>
                      <span class="badge" [class]="documentStatusBadge(doc.status)">{{ doc.status }}</span>
                    </td>
                    <td>
                      <span class="badge" [class]="orderStatusBadge(doc.orderId)">
                        {{ orderStatusLabel(doc.orderId) }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6">
                      <div class="empty-state compact" style="padding: 24px;">
                        <div class="empty-state-icon"><i class="pi pi-file" aria-hidden="true"></i></div>
                        <div class="empty-state-title">No invoices found</div>
                        <div class="empty-state-desc">No backend invoice records match this filter.</div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `
})
export class BusinessDocumentsCenterPage {
  private readonly store = inject(BusinessDocumentsStore);

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly documents = this.store.documents;
  readonly clients = this.store.clients;
  readonly orders = this.store.orders;

  readonly statusFilter = this.store.statusFilter;

  readonly filteredDocuments = this.store.filteredDocuments;
  readonly pendingCount = this.store.pendingCount;
  readonly acceptedCount = this.store.acceptedCount;
  readonly totalAmount = this.store.totalAmount;

  constructor() {
    this.store.load();
  }

  clientName(clientId: string): string {
    return this.store.clientName(clientId);
  }

  orderStatusBadge(orderId: string): string {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return 'badge-gray';
    const s = order.status;
    const map: Record<string, string> = {
      validating: 'badge-amber',
      blocked: 'badge-red',
      preparing: 'badge-blue',
      confirmed: 'badge-blue',
      dispatched: 'badge-purple',
      delivered: 'badge-green',
      cancelled: 'badge-gray',
    };
    return map[s] ?? 'badge-gray';
  }

  orderStatusLabel(orderId: string): string {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return 'Order pending';
    return order.status.replace(/_/g, ' ');
  }

  documentStatusBadge(status: string): string {
    return status === 'accepted' ? 'badge-green' : 'badge-amber';
  }
}

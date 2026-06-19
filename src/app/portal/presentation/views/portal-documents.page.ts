import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BuyerDocument, PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-portal-documents',
    imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <header class="portal-page-header">
        <div>
          <h1 class="portal-page-title">{{ 'portal.nav.documents' | t }}</h1>
          <p class="portal-page-subtitle">{{ sectionSubtitleCopy() }}</p>
        </div>
      </header>

      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!user()?.clientId || !snapshot()?.client) {
        <div class="flow-panel">
          <div class="empty-state">
            <div class="empty-state-icon"><nx-icon name="pi-lock"></nx-icon></div>
            <div class="empty-state-title">{{ 'portal.empty.noClientTitle' | t }}</div>
          </div>
        </div>
      } @else {
        @if (snapshot(); as data) {
          <section class="flow-panel">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ 'portal.documents.order' | t }}</th>
                    <th>{{ 'portal.documents.document' | t }}</th>
                    <th>{{ 'orders.table.status' | t }}</th>
                    <th>{{ 'portal.documents.visible' | t }}</th>
                    <th>{{ 'portal.documents.action' | t }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (document of visibleDocuments(data); track document.id) {
                    <tr>
                      <td><strong class="text-mono">{{ document.orderId || ('portal.documents.pendingOrder' | t) }}</strong></td>
                      <td>
                        <div style="font-weight:800">{{ documentCode(document) }}</div>
                        <div class="flow-note">{{ document.fileName || document.id }}</div>
                      </td>
                      <td><span class="flow-pill" [ngClass]="statusClass(document.status)">{{ statusLabel(document.status) }}</span></td>
                      <td>{{ document.visibleToBuyer ? ('common.yes' | t) : ('common.pending' | t) }}</td>
                      <td>
                        <div class="flow-row">
                          <button type="button" class="secondary-btn btn-sm" [disabled]="!document.visibleToBuyer">{{ 'portal.documents.download' | t }}</button>
                          <a [routerLink]="['/portal/purchase-orders', document.orderId]" class="btn btn-ghost btn-sm">{{ 'portal.documents.tracking' | t }}</a>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }
      }
    </div>
  `
})
export class PortalDocumentsPage {
  private readonly store = inject(PortalStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);

  constructor() {
    const user = this.user();
    if (!user?.clientId) {
      this.loading.set(false);
      return;
    }

    this.store.load(user.clientId).subscribe({
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  sectionSubtitleCopy(): string {
    const snapshot = this.snapshot();
    if (snapshot) {
      return this.i18n.t('portal.sections.documents.subtitle', { count: this.visibleDocuments(snapshot).length });
    }
    return '';
  }

  documentCode(document: BuyerDocument): string {
    return document.label || document.type;
  }

  visibleDocuments(snapshot: PortalSnapshot): BuyerDocument[] {
    return snapshot.documents.filter((document) => document.visibleToBuyer !== false);
  }

  statusLabel(status: string): string {
    return this.i18n.t(`portal.status.${status}`);
  }

  statusClass(status: string): string {
    if (/available|accepted|active|delivered|confirmed|paid/i.test(status)) return 'flow-pill-green';
    if (/pending|review|validating|preparing/i.test(status)) return 'flow-pill-amber';
    if (/blocked|cancel/i.test(status)) return 'flow-pill-red';
    return 'flow-pill-blue';
  }
}

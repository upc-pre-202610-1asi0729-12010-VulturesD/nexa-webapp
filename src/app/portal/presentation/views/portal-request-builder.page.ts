import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { PortalCartStore } from '@app/portal/application/portal-cart.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-portal-request-builder',
    imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'portal.nav.requestBuilder' | t }}</h1>
          <p class="page-subtitle">{{ 'portal.builder.subtitle' | t }}</p>
        </div>
      </div>

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
          <div class="flow-grid-12">
            <section class="flow-panel span-7">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.builder.requestItems' | t }}</div>
                  <div class="flow-subtitle">{{ cart.count() }} {{ 'portal.builder.unitsSelected' | t }}</div>
                </div>
                <a routerLink="/portal/product-catalog" class="secondary-btn btn-sm">
                  <nx-icon name="pi-plus"></nx-icon>
                  <span>{{ 'portal.builder.addProducts' | t }}</span>
                </a>
              </div>
              <div class="flow-panel-pad flow-stack">
                @for (item of cart.items(); track item.productId) {
                  <div class="mini-row">
                    <div>
                      <strong>{{ item.name }}</strong>
                      <div class="flow-note">{{ item.sku }} · S/ {{ item.price | number:'1.2-2' }} / {{ item.unit || ('portal.units.default' | t) }}</div>
                    </div>
                    <div class="flow-row">
                      <button type="button" class="btn btn-ghost btn-sm" (click)="cart.setQty(item.productId, item.qty - 1)">-</button>
                      <strong style="min-width: 32px; text-align: center;">{{ item.qty }}</strong>
                      <button type="button" class="btn btn-ghost btn-sm" (click)="cart.setQty(item.productId, item.qty + 1)">+</button>
                    </div>
                  </div>
                }
                @if (!cart.items().length) {
                  <div class="empty-state request-builder-empty">
                    <div class="empty-state-title">{{ 'portal.emptyCart' | t }}</div>
                    <div class="empty-state-desc">{{ 'portal.emptyCartDesc' | t }}</div>
                  </div>
                }
              </div>
            </section>

            <aside class="flow-panel span-5">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.builder.deliveryTitle' | t }}</div>
                  <div class="flow-subtitle">{{ clientDisplayName(data.client) }}</div>
                </div>
              </div>
              <div class="flow-panel-pad flow-stack">
                <label class="portal-field">
                  <span>{{ 'portal.builder.deliveryAddress' | t }}</span>
                  <select [value]="selectedAddressId()" (change)="onAddressChange($event)">
                    @for (address of data.deliveryAddresses; track address.id) {
                      <option [value]="address.id">{{ deliveryOptionLabel(address) }}</option>
                    }
                  </select>
                </label>
                <label class="portal-field">
                  <span>{{ 'portal.builder.deliveryDate' | t }}</span>
                  <input type="date" [value]="requestedDeliveryDate()" (change)="onDateChange($event)" />
                </label>
                <label class="portal-field">
                  <span>{{ 'portal.builder.commercialNotes' | t }}</span>
                  <textarea rows="4" [value]="comments()" (change)="onCommentsChange($event)" [placeholder]="'portal.requestNotesPlaceholder' | t"></textarea>
                </label>
                <div class="flow-row-between">
                  <span>{{ 'portal.total' | t }}</span>
                  <strong>S/ {{ cart.total() | number:'1.2-2' }}</strong>
                </div>
                <button type="button" class="primary-btn" [disabled]="!cart.items().length" (click)="submitRequest()">
                  <nx-icon name="pi-send"></nx-icon>
                  <span>{{ 'portal.actions.submitRequest' | t }}</span>
                </button>
              </div>
            </aside>
          </div>
        }
      }
    </div>
  `
})
export class PortalRequestBuilderPage {
  private readonly store = inject(PortalStore);
  private readonly router = inject(Router);
  readonly cart = inject(PortalCartStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);

  readonly selectedAddressId = signal('');
  readonly requestedDeliveryDate = signal(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  readonly comments = signal('');

  constructor() {
    const user = this.user();
    if (!user?.clientId) {
      this.loading.set(false);
      return;
    }

    this.store.load(user.clientId).subscribe({
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        if (snapshot.deliveryAddresses.length) {
          this.selectedAddressId.set(snapshot.deliveryAddresses[0].id);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  clientDisplayName(client: any): string {
    return client?.commercialName || client?.name || this.user()?.clientId || this.i18n.t('portal.noClientShort');
  }

  deliveryOptionLabel(address: any): string {
    return address.window ? `${address.label} - ${address.window}` : address.label;
  }

  onAddressChange(event: Event): void {
    this.selectedAddressId.set((event.target as HTMLSelectElement).value);
  }

  onDateChange(event: Event): void {
    this.requestedDeliveryDate.set((event.target as HTMLInputElement).value);
  }

  onCommentsChange(event: Event): void {
    this.comments.set((event.target as HTMLTextAreaElement).value);
  }

  submitRequest(): void {
    if (!this.cart.items().length) return;
    this.cart.clear();
    void this.router.navigate(['/portal/purchase-requests', 'PR-2026-0001']);
  }
}

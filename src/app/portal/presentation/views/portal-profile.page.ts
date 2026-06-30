import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { Client } from '@app/clients/domain/model';
import { PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-portal-profile',
    imports: [FormsModule, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <header class="portal-page-header">
        <div>
          <div class="flow-eyebrow">{{ 'portal.profile.buyerPortal' | t }}</div>
          <h1 class="portal-page-title">{{ 'portal.nav.profile' | t }}</h1>
          <p class="portal-page-subtitle">{{ 'portal.sections.profile.subtitle' | t }}</p>
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
          <section class="profile-hero buyer-profile-hero">
            <div class="profile-avatar-xl">
              <span>{{ user()?.initials }}</span>
            </div>
            <div class="profile-hero-copy">
              <span class="flow-pill flow-pill-blue">{{ 'portal.profile.buyerRole' | t }}</span>
              <h2>{{ user()?.name || 'Buyer account' }}</h2>
              <p>{{ user()?.email }} · {{ user()?.clientId }}</p>
            </div>
            <div class="profile-hero-actions">
              <button type="button" class="secondary-btn-light" (click)="switchAccount()">
                <nx-icon name="pi-users"></nx-icon>
                <span>{{ 'portal.profile.switchAccount' | t }}</span>
              </button>
              <button type="button" class="btn-logout-contrast" (click)="logout()">
                <nx-icon name="pi-sign-out"></nx-icon>
                <span>{{ 'common.logout' | t }}</span>
              </button>
            </div>
          </section>

          <div class="flow-grid-12">
            <section class="flow-panel span-6">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.profile.accountSummary' | t }}</div>
                  <div class="flow-subtitle">{{ 'portal.profile.accountSummarySub' | t }}</div>
                </div>
              </div>
              <div class="flow-panel-pad profile-form-grid" style="display: grid; gap: 14px; padding: 20px;">
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'profile.name' | t }}</span>
                  <input [value]="user()?.name || ''" disabled style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC; color: #0F172A;" />
                </label>
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'profile.email' | t }}</span>
                  <input [value]="user()?.email || ''" disabled style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC; color: #0F172A;" />
                </label>
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'portal.profile.clientIdentifier' | t }}</span>
                  <input [value]="user()?.clientId || 'Pending'" disabled style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC; color: #0F172A;" />
                </label>
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'profile.role' | t }}</span>
                  <input [value]="user()?.roleName || 'B2B Buyer'" disabled style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC; color: #0F172A;" />
                </label>
              </div>
            </section>

            <aside class="flow-panel span-6">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.profile.currentActivity' | t }}</div>
                  <div class="flow-subtitle">{{ 'portal.profile.currentActivitySub' | t }}</div>
                </div>
              </div>
              <div class="flow-panel-pad buyer-kpi-grid profile-activity-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; padding: 20px;">
                <div class="credit-summary-box" style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; background: #F8FAFC;">
                  <div class="mini-row" style="display: flex; justify-content: space-between; font-weight: 700; font-size: 13px;">
                    <span>{{ 'portal.nav.orders' | t }}</span>
                    <strong>{{ data.myOrders.length }}</strong>
                  </div>
                  <div class="flow-note" style="margin-top: 6px; font-size: 11px; color: #64748B;">{{ 'portal.profile.ordersLoaded' | t }}</div>
                </div>
                <div class="credit-summary-box" style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; background: #F8FAFC;">
                  <div class="mini-row" style="display: flex; justify-content: space-between; font-weight: 700; font-size: 13px;">
                    <span>{{ 'portal.nav.documents' | t }}</span>
                    <strong>{{ data.documents.length }}</strong>
                  </div>
                  <div class="flow-note" style="margin-top: 6px; font-size: 11px; color: #64748B;">{{ 'portal.profile.documentsLoaded' | t }}</div>
                </div>
              </div>
            </aside>

            <section class="flow-panel span-12" style="margin-top: 22px;">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.profile.companyTitle' | t }}</div>
                  <div class="flow-subtitle">{{ 'portal.profile.companySub' | t }}</div>
                </div>
              </div>
              <div class="flow-panel-pad profile-form-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; padding: 20px;">
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'clients.table.client' | t }}</span>
                  <input [value]="data.client?.name || '-'" disabled style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC; color: #0F172A;" />
                </label>
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'clients.table.ruc' | t }}</span>
                  <input [value]="data.client?.ruc || '-'" disabled style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC; color: #0F172A;" />
                </label>
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'portal.profile.primaryContact' | t }}</span>
                  <input [(ngModel)]="profileForm.contact" style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #FFFFFF; color: #0F172A;" />
                </label>
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'profile.phone' | t }}</span>
                  <input [(ngModel)]="profileForm.phone" style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #FFFFFF; color: #0F172A;" />
                </label>
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'orderDetail.address' | t }}</span>
                  <input [(ngModel)]="profileForm.deliveryAddress" style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #FFFFFF; color: #0F172A;" />
                </label>
                <label class="portal-field" style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">{{ 'portal.profile.deliveryReference' | t }}</span>
                  <input [(ngModel)]="profileForm.deliveryReference" style="padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #FFFFFF; color: #0F172A;" />
                </label>
                <div class="banner banner-info span-full" style="margin: 0; grid-column: span 2; display: flex; gap: 10px; align-items: center; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 12px; border-radius: 8px; color: #1E40AF;">
                  <nx-icon name="pi-info-circle"></nx-icon>
                  <div>{{ 'portal.profile.persistedProfile' | t }}</div>
                </div>
                @if (saveError()) {
                  <div class="banner banner-danger span-full" style="margin: 0; grid-column: span 2;"><nx-icon name="pi-times-circle"></nx-icon><span>{{ saveError() }}</span></div>
                }
                @if (saveSuccess()) {
                  <div class="banner banner-success span-full" style="margin: 0; grid-column: span 2;"><nx-icon name="pi-check-circle"></nx-icon><span>{{ 'portal.profile.saveSuccess' | t }}</span></div>
                }
                <div style="grid-column: span 2; display: flex; justify-content: flex-end;">
                  <button type="button" class="btn-primary" (click)="saveProfile()" [disabled]="saving()">
                    @if (saving()) { <nx-icon name="pi-spin pi-spinner"></nx-icon><span>{{ 'common.saving' | t }}</span> }
                    @else { <nx-icon name="pi-save"></nx-icon><span>{{ 'common.save' | t }}</span> }
                  </button>
                </div>
              </div>
            </section>
          </div>
        }
      }
    </div>
  `
})
export class PortalProfilePage {
  private readonly store = inject(PortalStore);
  private readonly router = inject(Router);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal(false);
  readonly snapshot = signal<PortalSnapshot | null>(null);
  readonly profileForm = {
    contact: '',
    phone: '',
    deliveryAddress: '',
    deliveryReference: '',
  };

  constructor() {
    const user = this.user();
    if (!user?.clientId) {
      this.loading.set(false);
      return;
    }

    this.store.load(user.clientId).subscribe({
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        this.resetProfileForm(snapshot.client ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  switchAccount(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }

  logout(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }

  saveProfile(): void {
    const snapshot = this.snapshot();
    const client = snapshot?.client;
    if (!snapshot || !client) return;
    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.store.updateBuyerClient({
      ...client,
      contact: this.profileForm.contact,
      phone: this.profileForm.phone,
      address: this.profileForm.deliveryAddress,
      deliveryAddress: this.profileForm.deliveryAddress,
      deliveryReference: this.profileForm.deliveryReference,
    }).subscribe({
      next: (updated) => {
        this.snapshot.set({ ...snapshot, client: updated });
        this.resetProfileForm(updated);
        this.saving.set(false);
        this.saveSuccess.set(true);
      },
      error: (error) => {
        this.saving.set(false);
        this.saveError.set(error?.error?.details?.[0] || error?.error?.message || error?.message || this.i18n.t('portal.profile.saveError'));
      },
    });
  }

  private resetProfileForm(client: Client | null): void {
    this.profileForm.contact = client?.contact || '';
    this.profileForm.phone = client?.phone || '';
    this.profileForm.deliveryAddress = client?.deliveryAddress || client?.address || '';
    this.profileForm.deliveryReference = client?.deliveryReference || '';
  }
}

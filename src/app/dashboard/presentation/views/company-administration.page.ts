import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyAdministrationStore } from '@app/dashboard/application/company-administration.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-company-administration',
  standalone: true,
  imports: [CommonModule, TranslatePipe, NexaIconComponent],
  template: `
    <div class="company-admin-page page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">Company Administration</div>
          <div class="page-subtitle">Company administration workspace for users, subscription scope, and operational permissions.</div>
        </div>
      </div>

      <div class="banner banner-info" style="margin-bottom: 20px;">
        <i class="pi pi-info-circle" aria-hidden="true" style="margin-right: 8px;"></i>
        <div>Authentication remains enforced. Company users and subscription settings are available in read-only workspace mode.</div>
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
        <div class="flow-grid-12">
          <section class="flow-panel span-5">
            <div class="flow-panel-head">
              <div>
                <div class="flow-title">Company Identity</div>
                <div class="flow-subtitle">Read-only local application identity.</div>
              </div>
            </div>
            <div class="flow-panel-pad form-grid" style="display: flex; flex-direction: column; gap: 12px;">
              <label class="field span-full">
                <span class="field-label" style="font-weight: 600; font-size: 13px; color: #475569; display: block; margin-bottom: 4px;">Legal name</span>
                <input class="plain-input" [value]="company.legalName" disabled style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;" />
              </label>
              <label class="field">
                <span class="field-label" style="font-weight: 600; font-size: 13px; color: #475569; display: block; margin-bottom: 4px;">Display name</span>
                <input class="plain-input" [value]="company.name" disabled style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;" />
              </label>
              <label class="field">
                <span class="field-label" style="font-weight: 600; font-size: 13px; color: #475569; display: block; margin-bottom: 4px;">Country</span>
                <input class="plain-input" [value]="company.country" disabled style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;" />
              </label>
              <label class="field">
                <span class="field-label" style="font-weight: 600; font-size: 13px; color: #475569; display: block; margin-bottom: 4px;">Plan</span>
                <input class="plain-input" [value]="company.subscriptionPlan" disabled style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;" />
              </label>
              <label class="field">
                <span class="field-label" style="font-weight: 600; font-size: 13px; color: #475569; display: block; margin-bottom: 4px;">Seats</span>
                <input class="plain-input" [value]="company.seats" disabled style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;" />
              </label>
            </div>
          </section>

          <section class="flow-panel span-7">
            <div class="flow-panel-head">
              <div>
                <div class="flow-title">Team Access</div>
                <div class="flow-subtitle">Team roster for operational access review.</div>
              </div>
            </div>
            <div class="flow-panel-pad">
              @if (users().length) {
                <div class="team-access-list" style="display: flex; flex-direction: column; gap: 12px;">
                  @for (member of users(); track member.id) {
                    <article class="team-access-card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="avatar" style="width: 40px; height: 40px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">
                          {{ getUserInitials(member.fullName) }}
                        </div>
                        <div class="team-access-main" style="display: flex; flex-direction: column;">
                          <strong style="font-size: 14px; color: #1e293b;">{{ member.fullName }}</strong>
                          <span style="font-size: 12px; color: #64748b;">{{ member.profile | titlecase }}</span>
                          <small style="font-size: 11px; color: #94a3b8;">{{ member.email }}</small>
                        </div>
                      </div>
                      <span class="badge badge-green">Active</span>
                    </article>
                  }
                </div>
              } @else {
                <div class="empty-state compact">
                  <div class="empty-state-icon"><i class="pi pi-users" aria-hidden="true"></i></div>
                  <div class="empty-state-title">Team roster unavailable</div>
                  <div class="empty-state-desc">Run the backend server to load company users.</div>
                </div>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `
})
export class CompanyAdministrationPage {
  private readonly store = inject(CompanyAdministrationStore);

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly users = this.store.users;
  readonly company = this.store.company;

  constructor() {
    this.store.load();
  }

  getUserInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
  }
}

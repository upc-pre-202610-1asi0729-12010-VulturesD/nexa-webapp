import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService, Lang } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { WorkspaceSetupStore } from '@app/tenant-management/application/workspace-setup.store';

interface Preference {
  key: string;
  label: string;
  value: string;
  editable: boolean;
  control?: string;
}

@Component({
  selector: 'nx-profile',
  imports: [CommonModule, FormsModule, TranslatePipe, NexaIconComponent],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'profile.title' | t }}</div>
          <div class="page-subtitle">{{ 'profile.workspace.subtitle' | t }}</div>
        </div>
        <div class="profile-account-actions">
          <button class="btn btn-secondary" type="button" (click)="endSession()">
            <nx-icon name="pi-users" aria-hidden="true"></nx-icon> {{ 'profile.workspace.switchAccount' | t }}
          </button>
          <button class="btn btn-ghost" type="button" (click)="endSession()">
            <nx-icon name="pi-sign-out" aria-hidden="true"></nx-icon> {{ 'common.logout' | t }}
          </button>
        </div>
      </div>

      <section class="profile-hero">
        <div class="profile-avatar-xl">
          <span>{{ user()?.initials || 'NX' }}</span>
        </div>
        <div class="profile-hero-copy">
          <div class="flow-pill" [class]="roleToneClass()">{{ roleLabel() | t }}</div>
          <h1>{{ user()?.name || 'Nexa user' }}</h1>
          <p>{{ workspaceName() }} · {{ workspaceUrl() }} · {{ user()?.email }}</p>
        </div>
      </section>

      <section class="scenario-card">
        <div class="scenario-icon"><nx-icon name="pi-user"></nx-icon></div>
        <div>
          <strong>{{ 'profile.workspace.identity' | t }}</strong>
          <p>{{ 'profile.workspace.identityDescription' | t }}</p>
        </div>
      </section>

      @if (saved) {
        <div class="flow-note saved-note banner banner-success" style="margin-bottom: 18px;">
          <nx-icon name="pi-check-circle"></nx-icon><span>{{ 'profile.savedSuccess' | t }}</span>
        </div>
      }
      @if (saveError) {
        <div class="flow-note profile-error banner banner-danger" style="margin-bottom: 18px;">
          <nx-icon name="pi-times-circle"></nx-icon><span>{{ saveError }}</span>
        </div>
      }

      <div class="profile-grid">
        <section class="flow-panel span-8 profile-account-panel" [class.editing]="editingAccount()">
          <div class="flow-panel-head">
            <div>
              <div class="flow-title">{{ 'profile.personalInfo' | t }}</div>
              <div class="flow-subtitle">{{ 'profile.workspace.accountDescription' | t }}</div>
            </div>
            @if (!editingAccount()) {
              <button class="btn btn-secondary" type="button" (click)="editingAccount.set(true)">
                {{ 'profile.workspace.editAccount' | t }}
              </button>
            }
          </div>
          <form class="flow-panel-pad form-grid profile-account-grid" (ngSubmit)="saveProfile()">
            <label class="field">
              <span class="field-label">{{ 'profile.name' | t }}</span>
              <input [(ngModel)]="name" name="name" class="plain-input" [disabled]="!editingAccount()" />
            </label>
            <label class="field">
              <span class="field-label">{{ 'profile.email' | t }}</span>
              <input class="plain-input" [value]="user()?.email" disabled />
            </label>
            <label class="field">
              <span class="field-label">{{ 'profile.role' | t }}</span>
              <input class="plain-input" [value]="roleLabel() | t" disabled />
            </label>
            <label class="field">
              <span class="field-label">{{ 'profile.phone' | t }}</span>
              <input [(ngModel)]="phone" name="phone" class="plain-input" [disabled]="!editingAccount()" />
            </label>
            <label class="field">
              <span class="field-label">{{ 'profile.workspace.workspaceSlug' | t }}</span>
              <input class="plain-input" [value]="workspaceSlug()" disabled />
            </label>
            <label class="field">
              <span class="field-label">{{ 'profile.workspace.membershipStatus' | t }}</span>
              <input class="plain-input" [value]="'active'" disabled />
            </label>
            @if (editingAccount()) {
              <div class="profile-form-actions span-full">
                <button class="btn btn-secondary" type="button" (click)="cancelEdit()">{{ 'common.cancel' | t }}</button>
                <button class="btn btn-primary" type="submit" [disabled]="saving()">
                  {{ saving() ? ('profile.workspace.saving' | t) : ('profile.saveChanges' | t) }}
                </button>
              </div>
            }
          </form>
        </section>

        <section class="flow-panel span-4 profile-preferences-panel" [class.editing]="editingPreferences()">
          <div class="flow-panel-head">
            <div>
              <div class="flow-title">{{ 'profile.preferences' | t }}</div>
              <div class="flow-subtitle">{{ 'profile.workspace.preferencesDescription' | t }}</div>
            </div>
            @if (!editingPreferences()) {
              <button class="btn btn-secondary" type="button" (click)="editingPreferences.set(true)">
                {{ 'profile.workspace.editPreferences' | t }}
              </button>
            }
          </div>
          <form class="flow-panel-pad flow-stack" (ngSubmit)="savePreferences()">
            @for (preference of preferences(); track preference.key) {
              <div class="mini-row preference-row" [class.editing]="editingPreferences() && preference.editable">
                <span>{{ preference.label }}</span>
                @if (editingPreferences() && preference.control === 'language') {
                  <select [(ngModel)]="langDraft" name="langDraft" class="plain-input inline-preference-control">
                    <option value="en">{{ 'profile.langEn' | t }}</option>
                    <option value="es">{{ 'profile.langEs' | t }}</option>
                  </select>
                } @else if (editingPreferences() && preference.control === 'notifications') {
                  <select [(ngModel)]="notifDraft" name="notifDraft" class="plain-input inline-preference-control">
                    <option [value]="true">{{ 'profile.workspace.enabled' | t }}</option>
                    <option [value]="false">{{ 'profile.workspace.disabled' | t }}</option>
                  </select>
                } @else {
                  <strong>{{ preference.value }}</strong>
                }
              </div>
            }
            @if (editingPreferences()) {
              <div class="profile-form-actions" style="margin-top: 12px;">
                <button class="btn btn-secondary" type="button" (click)="cancelEdit()">{{ 'common.cancel' | t }}</button>
                <button class="btn btn-primary" type="submit" [disabled]="saving()">
                  {{ saving() ? ('profile.workspace.saving' | t) : ('profile.workspace.savePreferences' | t) }}
                </button>
              </div>
            }
          </form>
        </section>

        <section class="flow-panel span-12" style="grid-column: 1 / -1;">
          <div class="flow-panel-head">
            <div>
              <div class="flow-title">{{ 'profile.workspace.operationalScope' | t }}</div>
              <div class="flow-subtitle">{{ 'profile.workspace.scopeDescription' | t }}</div>
            </div>
          </div>
          <div class="flow-panel-pad permission-grid">
            @for (permission of permissions(); track permission) {
              <div class="permission-chip">
                <nx-icon name="pi-check-circle" style="color: #16a34a; margin-right: 6px;"></nx-icon>
                {{ ('profile.workspace.permissions.' + permission) | t }}
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .profile-hero {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
      padding: 24px;
      border: 1px solid #dbe5f2;
      border-radius: 18px;
      background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
      box-shadow: 0 12px 28px rgba(15,23,42,.045);
    }
    .profile-avatar-xl {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #dbeafe;
      color: #1d4ed8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .profile-hero-copy h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 6px 0;
      color: #0f172a;
    }
    .profile-hero-copy p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
    .flow-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      border: 1px solid #bfdbfe;
      background: #eff6ff;
      color: #1d4ed8;
      width: max-content;
    }
    .flow-pill.role-pill-logistics {
      border-color: #bbf7d0;
      background: #f0fdf4;
      color: #15803d;
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
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 18px;
      align-items: start;
    }
    .span-8 {
      grid-column: span 8;
    }
    .span-4 {
      grid-column: span 4;
    }
    .flow-panel {
      border: 1px solid #dbe5f2;
      border-radius: 18px;
      background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
      box-shadow: 0 12px 28px rgba(15,23,42,.045);
      transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .flow-panel.editing {
      border-color: #93c5fd !important;
      background: radial-gradient(circle at 100% 0%, rgba(37,99,235,.08), transparent 30%), linear-gradient(180deg, #ffffff, #f8fbff) !important;
      box-shadow: 0 4px 20px -2px rgba(37,99,235,.08) !important;
    }
    .flow-panel-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px;
      border-bottom: 1px solid #edf2f7;
    }
    .flow-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .flow-subtitle {
      font-size: 11px;
      color: #64748b;
    }
    .flow-panel-pad {
      padding: 18px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .field {
      display: grid;
      gap: 6px;
    }
    .field-label {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }
    .plain-input {
      width: 100%;
      height: 40px;
      border: 1px solid #cbd8ea;
      border-radius: 11px;
      padding: 0 12px;
      background: linear-gradient(180deg, #ffffff, #f8fbff);
      font-size: 13px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
      box-sizing: border-box;
    }
    .plain-input:focus {
      outline: 0;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,.12);
    }
    .plain-input:disabled {
      background: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;
      border-color: #cbd8ea;
      box-shadow: none;
    }
    .preference-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 48px;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .preference-row.editing {
      border-color: #93c5fd;
      background: #eff6ff;
      box-shadow: inset 0 0 0 1px #dbeafe;
    }
    .inline-preference-control {
      width: min(190px, 55%);
      height: 32px;
      font-size: 12px;
    }
    .profile-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 12px;
    }
    .span-full {
      grid-column: span 2;
    }
    .permission-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .permission-chip {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      font-weight: 700;
      font-size: 12px;
    }
    @media (max-width: 1180px) {
      .span-8, .span-4 {
        grid-column: span 12;
      }
    }
    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .span-full {
        grid-column: span 1;
      }
    }
  `]
})
export class ProfilePage {
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly setupStore = inject(WorkspaceSetupStore);

  readonly user = this.session.user;
  readonly lang = this.i18n.lang;
  readonly tenantSetup = this.setupStore.setup;

  readonly workspaceName = computed(() => this.tenantSetup()?.tenant.name ?? 'ICISA Distribuciones');
  readonly workspaceUrl = computed(() => this.tenantSetup()?.tenant.workspaceUrl ?? `${this.workspaceSlug()}.nexa.com.pe`);
  readonly workspaceSlug = computed(() => this.tenantSetup()?.tenant.slug ?? this.user()?.workspaceSlug ?? 'icisa');

  readonly roleLabel = computed(() => {
    const user = this.user();
    if (!user) return 'tenant.companyAdmin.roles.Viewer';
    const role = user.roleKey;
    if (role === 'owner') return 'tenant.companyAdmin.roles.CompanyOwner';
    if (role === 'logistics') return 'tenant.companyAdmin.roles.LogisticsManager';
    if (role === 'commercial') return 'tenant.companyAdmin.roles.CommercialCoordinator';
    if (role === 'buyer') return 'tenant.companyAdmin.roles.B2BBuyer';
    return 'tenant.companyAdmin.roles.Viewer';
  });

  readonly roleToneClass = computed(() => {
    const user = this.user();
    return user?.roleKey === 'logistics' ? 'role-pill-logistics' : 'flow-pill-blue';
  });

  readonly permissions = computed(() => {
    const user = this.user();
    if (!user) return [];
    const role = user.roleKey;
    if (role === 'logistics') return ['inventory', 'dispatch', 'deliveryEvidence', 'analytics'];
    if (role === 'owner') return ['companyAdministration', 'workspaceSetup', 'teammates', 'businessRules'];
    return ['catalog', 'orders', 'manualOrder', 'documents'];
  });

  readonly preferences = computed<Preference[]>(() => {
    const user = this.user();
    const notificationsLabel = this.notif()
      ? this.i18n.t('profile.workspace.enabled')
      : this.i18n.t('profile.workspace.disabled');
    const langLabel = user?.preferredLanguage === 'es' ? '🇵🇪 Español' : '🇺🇸 English';

    return [
      { key: 'language', label: this.i18n.t('profile.language'), value: langLabel, editable: true, control: 'language' },
      { key: 'notifications', label: this.i18n.t('profile.workspace.criticalNotifications'), value: notificationsLabel, editable: true, control: 'notifications' },
      { key: 'role', label: this.i18n.t('profile.role'), value: this.i18n.t(this.roleLabel()), editable: false },
      { key: 'plan', label: this.i18n.t('profile.workspace.planAccess'), value: 'Standard', editable: false },
      { key: 'workspace', label: this.i18n.t('profile.workspace.workspaceSlug'), value: this.workspaceSlug(), editable: false },
    ];
  });

  name = '';
  phone = '';
  notif = signal(true);
  langDraft: Lang = 'en';
  notifDraft = true;

  readonly editingAccount = signal(false);
  readonly editingPreferences = signal(false);
  saved = false;
  saveError = '';
  readonly saving = signal(false);

  constructor() {
    this.session.refreshProfile().subscribe({
      next: (profile) => {
        this.name = profile.name;
        this.phone = profile.phone;
        this.notif.set(profile.criticalNotificationsEnabled);
        this.langDraft = profile.preferredLanguage;
        this.notifDraft = profile.criticalNotificationsEnabled;
        this.i18n.set(profile.preferredLanguage);
        if (profile.workspaceSlug) {
          this.setupStore.load(profile.workspaceSlug);
        }
      },
      error: () => { this.saveError = this.i18n.t('profile.saveFailed'); },
    });
  }

  setLang(lang: Lang): void { this.i18n.set(lang); }

  endSession(): void {
    this.session.clear();
    this.router.navigate(['/login']);
  }

  cancelEdit(): void {
    const profile = this.user();
    if (profile) {
      this.name = profile.name;
      this.phone = profile.phone;
      this.notif.set(profile.criticalNotificationsEnabled);
      this.langDraft = profile.preferredLanguage;
      this.notifDraft = profile.criticalNotificationsEnabled;
    }
    this.editingAccount.set(false);
    this.editingPreferences.set(false);
  }

  saveProfile(): void {
    this.persistProfile(() => this.editingAccount.set(false));
  }

  savePreferences(): void {
    this.persistProfile(() => this.editingPreferences.set(false));
  }

  private persistProfile(callback: () => void): void {
    const current = this.user();
    if (!current || this.saving()) return;
    this.saving.set(true);
    this.saved = false;
    this.saveError = '';
    
    // update notif signal
    this.notif.set(this.notifDraft);

    this.session.updateProfile({
      fullName: this.name,
      email: current.email,
      phone: this.phone,
      preferredLanguage: this.langDraft,
      criticalNotificationsEnabled: this.notifDraft,
    }).subscribe({
      next: () => {
        this.saved = true;
        this.saving.set(false);
        this.i18n.set(this.langDraft);
        callback();
        setTimeout(() => { this.saved = false; }, 2200);
      },
      error: (error: HttpErrorResponse) => {
        const details = error.error?.details;
        this.saveError = Array.isArray(details) && details.length
          ? String(details[0])
          : this.i18n.t('profile.saveFailed');
        this.saving.set(false);
      },
    });
  }
}

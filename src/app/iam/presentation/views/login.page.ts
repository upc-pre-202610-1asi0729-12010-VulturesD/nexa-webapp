import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IamStore } from '@app/iam/application/iam.store';
import { TenantManagementApi } from '@app/tenant-management/infrastructure/tenant-management-api';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService, Lang } from '@app/shared/presentation/services/i18n.service';

interface TenantPreview {
  name: string;
  slug: string;
  workspaceUrl: string;
  plan: string;
  status: string;
}

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'live.com',
]);

@Component({
  selector: 'nx-login',
  imports: [FormsModule, TranslatePipe, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-wrap">
        <aside class="auth-left">
          <div class="auth-left-content">
            <div class="auth-logo"><img src="assets/img/nexa.svg" alt="Nexa" /></div>
            <div class="auth-tagline">{{ 'auth.tagline' | t }}</div>
            <div class="auth-desc">{{ 'auth.desc' | t }}</div>
            <div class="auth-pills" aria-label="Nexa operations">
              <span class="auth-pill">{{ 'auth.pillCatalog' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillStock' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillOrder' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillDelivery' | t }}</span>
            </div>
          </div>
          <div class="auth-footer-left">
            <a class="auth-back-link" href="https://upc-pre-202610-1asi0729-12010-vulturesd.github.io/nexa-website/" target="_blank" rel="noopener noreferrer">{{ 'auth.backToSite' | t }}</a>
            <span>{{ 'auth.rights' | t }}</span>
          </div>
        </aside>

        <section class="auth-right">
          <div class="lang-selector" role="group" [attr.aria-label]="'common.language' | t">
            <button type="button" class="lang-opt" [class.active]="lang() === 'es'" [attr.aria-pressed]="lang() === 'es'" (click)="setLang('es')">ES</button>
            <button type="button" class="lang-opt" [class.active]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="setLang('en')">EN</button>
          </div>

          <div class="auth-form-title">{{ 'auth.workspaceLogin.title' | t }}</div>
          <div class="auth-form-sub">{{ 'auth.workspaceLogin.subtitle' | t }}</div>

          <form class="workspace-login-form" (ngSubmit)="submit()">
            @if (tenant(); as currentTenant) {
              <section class="tenant-preview" [class.tenant-preview--suspended]="currentTenant.status === 'suspended'">
                <div class="tenant-preview-mark">{{ tenantInitials(currentTenant.name) }}</div>
                <div class="tenant-preview-body">
                  <div class="tenant-preview-eyebrow">{{ 'auth.workspacePreview' | t }}</div>
                  <div class="tenant-preview-name">{{ currentTenant.name }}</div>
                  <div class="tenant-preview-meta">
                    <span>{{ currentTenant.workspaceUrl }}</span>
                    <span>{{ currentTenant.plan }}</span>
                    <span class="status-badge">{{ ('auth.tenantStatus.' + currentTenant.status) | t }}</span>
                  </div>
                </div>
              </section>
            }

            @if (registrationSuccess()) {
              <div class="state-success" role="status">
                <i class="pi pi-check-circle" aria-hidden="true"></i>
                <div>{{ 'auth.workspaceLogin.registrationSubmitted' | t }}</div>
                <button type="button" [attr.aria-label]="'common.close' | t" (click)="registrationSuccess.set(false)"><i class="pi pi-times" aria-hidden="true"></i></button>
              </div>
            }

            @if (error(); as currentError) {
              <div class="state-alert" role="alert">
                <i class="pi pi-times-circle" aria-hidden="true"></i>
                <div><strong>{{ currentError }}</strong><br />{{ 'auth.workspaceLogin.tryAgain' | t }}</div>
              </div>
            } @else if (warning(); as currentWarning) {
              <div class="state-warn" role="status">
                <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
                <div>{{ currentWarning }}</div>
              </div>
            }

            <div class="field workspace-field">
              <label class="workspace-label" for="workspace-slug">{{ 'auth.workspaceLogin.workspaceLabel' | t }}</label>
              <div class="field-input" [class.error]="!!error()">
                <i class="pi pi-building" aria-hidden="true"></i>
                <input id="workspace-slug" name="workspaceSlug" [(ngModel)]="workspaceSlug" (ngModelChange)="onWorkspaceChange($event)" type="text" autocomplete="organization" autocapitalize="none" spellcheck="false" [placeholder]="'auth.workspaceLogin.workspacePlaceholder' | t" [disabled]="loading()" />
              </div>
              <div class="workspace-helper">{{ 'auth.workspaceLogin.workspaceHelper' | t }}</div>
            </div>

            <div class="field workspace-field">
              <label class="workspace-label" for="corporate-email">{{ 'auth.workspaceLogin.emailLabel' | t }}</label>
              <div class="field-input" [class.error]="!!error()">
                <i class="pi pi-envelope" aria-hidden="true"></i>
                <input id="corporate-email" name="email" [(ngModel)]="email" (ngModelChange)="onEmailChange($event)" type="email" autocomplete="email" autocapitalize="none" spellcheck="false" [placeholder]="'auth.workspaceLogin.emailPlaceholder' | t" [disabled]="loading()" />
              </div>
            </div>

            <div class="field workspace-field">
              <label class="workspace-label" for="workspace-password">{{ 'auth.workspaceLogin.passwordLabel' | t }}</label>
              <div class="field-input" [class.error]="!!error()">
                <i class="pi pi-lock" aria-hidden="true"></i>
                <input id="workspace-password" name="password" [(ngModel)]="password" [type]="showPass ? 'text' : 'password'" autocomplete="current-password" placeholder="********" [disabled]="loading()" />
                <button class="password-toggle" type="button" (click)="showPass = !showPass" [attr.aria-label]="'auth.workspaceLogin.togglePassword' | t"><i [class]="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true"></i></button>
              </div>
            </div>

            <div class="workspace-form-links"><a routerLink="/auth/recover" class="auth-link">{{ 'auth.forgot' | t }}</a></div>
            <button class="btn-full btn-primary-full" type="submit" [disabled]="loading()">
              @if (loading()) { <span class="spinner" aria-hidden="true"></span>{{ 'auth.verifying' | t }} }
              @else { {{ 'auth.workspaceLogin.cta' | t }} }
            </button>
            <div class="register-company-cta">
              <span>{{ 'auth.workspaceLogin.companyAccessPrompt' | t }}</span>
              <a routerLink="/tenant-management/register-organization">{{ 'auth.workspaceLogin.registerCompany' | t }}</a>
            </div>
          </form>
        </section>
      </div>
    </div>
  `,
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly session = inject(IamStore);
  private readonly tenantApi = inject(TenantManagementApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18nService);
  private workspaceLookupId = 0;

  readonly lang = this.i18n.lang;
  readonly tenant = signal<TenantPreview | null>(null);
  readonly warning = signal<string | null>(null);
  readonly registrationSuccess = signal(this.route.snapshot.queryParamMap.get('registration') === 'submitted');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  workspaceSlug = '';
  email = '';
  password = '';
  showPass = false;

  setLang(lang: Lang): void { this.i18n.set(lang); }

  onWorkspaceChange(value: string): void {
    this.workspaceSlug = value;
    this.error.set(null);
    const slug = this.normalizeSlug(value);
    const lookupId = ++this.workspaceLookupId;
    this.tenant.set(null);
    this.refreshWarning();
    if (!slug) return;

    this.tenantApi.tenantPreview(slug).subscribe({
      next: (tenant) => {
        if (lookupId !== this.workspaceLookupId) return;
        this.tenant.set(tenant);
        this.refreshWarning();
      },
      error: () => {
        if (lookupId !== this.workspaceLookupId) return;
        this.tenant.set(null);
      },
    });
  }

  onEmailChange(value: string): void {
    this.email = value;
    this.error.set(null);
    this.refreshWarning();
  }

  tenantInitials(name: string): string {
    return name.trim().slice(0, 2).toUpperCase();
  }

  submit(): void {
    const slug = this.normalizeSlug(this.workspaceSlug);
    if (!slug || !this.email.trim() || !this.password) {
      this.error.set(this.i18n.t('auth.workspaceLogin.missingFields'));
      return;
    }
    if (this.isPersonalEmail(this.email)) {
      this.error.set(this.i18n.t('auth.workspaceLogin.personalEmailWarning'));
      return;
    }
    if (this.tenant()?.status === 'suspended') {
      void this.router.navigate(['/auth/blocked'], { queryParams: { workspace: slug } });
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.session.login(this.email.trim(), this.password, slug).subscribe({
      next: (user) => {
        if (!user) {
          this.loading.set(false);
          this.error.set(this.i18n.t('auth.workspaceLogin.invalidCredentials'));
          return;
        }
        this.session.set(user);
        this.loading.set(false);
        void this.router.navigateByUrl(this.targetFor(user.roleKey, user.scope));
      },
      error: (failure: HttpErrorResponse) => {
        this.loading.set(false);
        const connectivityFailure = failure.status === 0 || failure.status === 404 || failure.status >= 500;
        this.error.set(this.i18n.t(connectivityFailure
          ? 'auth.workspaceLogin.apiUnavailable'
          : 'auth.workspaceLogin.invalidCredentials'));
      },
    });
  }

  private targetFor(roleKey: string, scope: string): string {
    const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '';
    if (redirect.startsWith('/dashboard') || redirect.startsWith('/portal') || redirect.startsWith('/operations')) return redirect;
    if (scope === 'portal' || roleKey === 'buyer') return '/portal/home';
    if (roleKey === 'owner') return '/operations/company-administration';
    return roleKey === 'logistics' ? '/dashboard/operations' : '/dashboard/commercial';
  }

  private refreshWarning(): void {
    if (this.isPersonalEmail(this.email)) {
      this.warning.set(this.i18n.t('auth.workspaceLogin.personalEmailWarning'));
      return;
    }
    this.warning.set(this.tenant()?.status === 'suspended'
      ? this.i18n.t('auth.workspaceLogin.suspendedWorkspace')
      : null);
  }

  private isPersonalEmail(email: string): boolean {
    return PERSONAL_EMAIL_DOMAINS.has(email.trim().toLowerCase().split('@')[1] ?? '');
  }

  private normalizeSlug(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
}

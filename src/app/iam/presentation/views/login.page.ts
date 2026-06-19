import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '@app/iam/application/iam.store';
import { WorkspaceUsersStore } from '@app/iam/application/workspace-users.store';
import { I18nService, Lang } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { User } from '@app/iam/domain/model/user.model';

@Component({
  selector: 'nx-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-wrap">
        <!-- Left brand panel -->
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

        <!-- Right form panel -->
        <section class="auth-right">
          <div class="lang-selector" role="group" [attr.aria-label]="'common.language' | t">
            <button type="button" class="lang-opt" [class.active]="lang() === 'es'" [attr.aria-pressed]="lang() === 'es'" (click)="setLang('es')">ES</button>
            <button type="button" class="lang-opt" [class.active]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="setLang('en')">EN</button>
          </div>

          <div class="auth-form-title">{{ 'auth.welcome' | t }}</div>
          <div class="auth-form-sub">{{ 'auth.subtitle' | t }}</div>

          <!-- Quick access cards -->
          <div class="profile-section-label">{{ 'auth.quickAccess' | t }}</div>
          <div class="profile-list">
            @for (p of workspaceUsers(); track p.email) {
              <button type="button" class="profile-card" [class.active]="email === p.email" [attr.aria-pressed]="email === p.email" (click)="pickProfile(p)">
                <div class="profile-avatar-sm">{{ p.initials }}</div>
                <div class="profile-info">
                  <div class="profile-name">{{ p.name }}</div>
                  <div class="profile-role">{{ p.roleName }} · {{ profileScopeLabel(p) }}</div>
                </div>
                @if (email === p.email) { <i class="pi pi-check-circle profile-check" aria-hidden="true"></i> }
              </button>
            } @empty {
              <div class="profile-empty">{{ 'auth.noUsers' | t }}</div>
            }
          </div>

          @if (error()) {
            <div class="state-alert">
              <i class="pi pi-times-circle"></i>
              <div><strong>{{ error() }}</strong><br>{{ 'auth.wrongCredsDesc' | t }}</div>
            </div>
          }

          <div class="field">
            <label class="field-label" for="login-email">{{ 'auth.email' | t }}</label>
            <div class="field-input" [class.error]="!!error()">
              <i class="pi pi-envelope" aria-hidden="true"></i>
              <input id="login-email" type="email" [(ngModel)]="email" [placeholder]="'auth.email' | t" [disabled]="loading()" autocomplete="email" />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="login-password">{{ 'auth.password' | t }}</label>
            <div class="field-input" [class.error]="!!error()">
              <i class="pi pi-lock" aria-hidden="true"></i>
              <input id="login-password" [type]="showPass ? 'text' : 'password'" [(ngModel)]="password" placeholder="••••••••" [disabled]="loading()" autocomplete="current-password" />
              <button class="password-toggle" type="button" (click)="showPass = !showPass" [attr.aria-label]="showPass ? ('auth.hidePassword' | t) : ('auth.showPassword' | t)">
                <i [class]="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div style="text-align:right;margin-bottom:20px">
            <a href="#" class="link" style="font-size:12px">{{ 'auth.forgot' | t }}</a>
          </div>

          <button type="button" class="btn-full btn-primary-full" (click)="submit()" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner" aria-hidden="true"></span> {{ 'auth.verifying' | t }}
            } @else {
              {{ 'auth.signIn' | t }}
            }
          </button>
        </section>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly session = inject(IamStore);
  private readonly router = inject(Router);
  private readonly workspace = inject(WorkspaceUsersStore);
  private readonly i18n = inject(I18nService);

  readonly lang = this.i18n.lang;

  email = '';
  password = '';
  showPass = false;
  loading = signal(false);
  error = signal<string | null>(null);
  readonly workspaceUsers = this.workspace.users;

  constructor() {
    this.workspace.load();
  }

  setLang(l: Lang): void { this.i18n.set(l); }

  pickProfile(u: User): void {
    this.email = u.email;
    this.password = 'NexaAccess2026!';
    this.error.set(null);
  }

  profileScopeLabel(u: User): string {
    return u.scope === 'portal' ? 'Buyer Portal' : u.department;
  }

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set(this.i18n.t('auth.wrongCreds'));
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.session.login(this.email, this.password).subscribe({
      next: (user) => {
        if (!user) {
          this.loading.set(false);
          this.error.set(this.i18n.t('auth.wrongCreds'));
          return;
        }
        this.session.set(user);
        setTimeout(() => {
          this.loading.set(false);
          this.router.navigate([user.scope === 'portal' || user.roleKey === 'buyer' ? '/portal/home' : '/dashboard']);
        }, 400);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(this.i18n.t('auth.wrongCreds'));
      },
    });
  }

}

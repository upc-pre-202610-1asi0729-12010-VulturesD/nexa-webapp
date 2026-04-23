import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { AuthApi } from '../../infrastructure/auth-api';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService, Lang } from '@app/shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';
import { User } from '@app/iam/domain/model/user.model';

@Component({
  selector: 'nx-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-wrap">
        <!-- Left brand panel -->
        <aside class="auth-left">
          <div class="auth-left-content">
            <div class="auth-logo"><img src="assets/img/nexa.svg" alt="Nexa" /></div>
            <div class="auth-tagline">{{ 'auth.tagline' | t }}</div>
            <div class="auth-desc">{{ 'auth.desc' | t }}</div>
            <div class="auth-pills">
              <span class="auth-pill">{{ 'auth.pillCatalog' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillStock' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillOrder' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillDelivery' | t }}</span>
            </div>
          </div>
          <div class="auth-footer-left">
            <a class="auth-back-link" href="#" rel="noopener">{{ 'auth.backToSite' | t }}</a>
            <span>{{ 'auth.rights' | t }}</span>
          </div>
        </aside>

        <!-- Right form panel -->
        <section class="auth-right">
          <div class="lang-selector">
            <button class="lang-opt" [class.active]="lang() === 'es'" (click)="setLang('es')">ES</button>
            <button class="lang-opt" [class.active]="lang() === 'en'" (click)="setLang('en')">EN</button>
          </div>

          <div class="auth-form-title">{{ 'auth.welcome' | t }}</div>
          <div class="auth-form-sub">{{ 'auth.subtitle' | t }}</div>

          <!-- Quick access cards -->
          <div class="profile-section-label">{{ 'auth.quickAccess' | t }}</div>
          <div class="profile-list">
            @for (p of opsUsers(); track p.email) {
              <div class="profile-card" [class.active]="email === p.email" (click)="pickProfile(p)">
                <div class="profile-avatar-sm">{{ p.initials }}</div>
                <div class="profile-info">
                  <div class="profile-name">{{ p.name }}</div>
                  <div class="profile-role">{{ p.roleName }} · {{ p.department }}</div>
                </div>
                @if (email === p.email) { <i class="pi pi-check-circle" style="color:#2563EB"></i> }
              </div>
            }
          </div>

          @if (error()) {
            <div class="state-alert">
              <i class="pi pi-times-circle"></i>
              <div><strong>{{ error() }}</strong><br>{{ 'auth.wrongCredsDesc' | t }}</div>
            </div>
          }

          <div class="field" style="margin-bottom:16px">
            <label class="field-label">{{ 'auth.email' | t }}</label>
            <div class="field-input" [class.error]="!!error()">
              <i class="pi pi-envelope"></i>
              <input type="email" [(ngModel)]="email" [placeholder]="'auth.email' | t" [disabled]="loading()" autocomplete="email" />
            </div>
          </div>

          <div class="field" style="margin-bottom:8px">
            <label class="field-label">{{ 'auth.password' | t }}</label>
            <div class="field-input" [class.error]="!!error()">
              <i class="pi pi-lock"></i>
              <input [type]="showPass ? 'text' : 'password'" [(ngModel)]="password" placeholder="••••••••" [disabled]="loading()" autocomplete="current-password" />
              <i class="pi" [class.pi-eye-slash]="showPass" [class.pi-eye]="!showPass" style="cursor:pointer;color:#9CA3AF" (click)="showPass = !showPass"></i>
            </div>
          </div>

          <div style="text-align:right;margin-bottom:20px">
            <a href="#" class="link" style="font-size:12px">{{ 'auth.forgot' | t }}</a>
          </div>

          <button class="btn-full btn-primary-full" (click)="submit()" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span> {{ 'auth.verifying' | t }}
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
  private readonly auth = inject(AuthApi);
  private readonly session = inject(IamStore);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);

  readonly lang = this.i18n.lang;

  email = '';
  password = '';
  showPass = false;
  loading = signal(false);
  error = signal<string | null>(null);
  readonly opsUsers = signal<User[]>([]);

  constructor() {
    this.http.get<User[]>('api/v1/users').pipe(catchError(() => of([] as User[]))).subscribe((users) => {
      this.opsUsers.set((users || []).filter((u) => u.scope === 'ops'));
    });
  }

  setLang(l: Lang): void { this.i18n.set(l); }

  pickProfile(u: User): void {
    this.email = u.email;
    this.password = u.password || 'demo1234';
    this.error.set(null);
  }

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set(this.i18n.t('auth.wrongCreds'));
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
        if (!user) {
          this.loading.set(false);
          this.error.set(this.i18n.t('auth.wrongCreds'));
          return;
        }
        this.session.set(user);
        setTimeout(() => {
          this.loading.set(false);
          this.router.navigate([user.roleKey === 'buyer' ? '/portal' : '/dashboard']);
        }, 400);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(this.i18n.t('auth.wrongCreds'));
      },
    });
  }
}

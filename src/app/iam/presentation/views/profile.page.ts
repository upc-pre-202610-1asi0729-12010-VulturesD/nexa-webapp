import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService, Lang } from '@app/shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';

@Component({
  selector: 'nx-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'profile.title' | t }}</div>
          <div class="page-subtitle">{{ 'profile.subtitle' | t }}</div>
        </div>
      </div>

      <div class="grid-2" style="align-items:start;gap:20px">
        <!-- Personal info -->
        <div class="card card-pad">
          <div class="card-title" style="margin-bottom:20px">{{ 'profile.personalInfo' | t }}</div>
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
            <div class="profile-avatar">{{ user()?.initials || 'NX' }}</div>
            <div>
              <div style="font-weight:600;font-size:14px">{{ name || user()?.name }}</div>
              <div style="font-size:12px;color:#6B7280">{{ user()?.roleName }}</div>
              <div style="font-size:12px;color:#9CA3AF">Frío Pacífico S.A.C.</div>
            </div>
          </div>

          <div class="field" style="margin-bottom:16px">
            <label class="field-label">{{ 'profile.name' | t }}</label>
            <div class="field-input"><i class="pi pi-user"></i><input type="text" [(ngModel)]="name" /></div>
          </div>
          <div class="field" style="margin-bottom:16px">
            <label class="field-label">{{ 'profile.email' | t }}</label>
            <div class="field-input" style="background:#F9F7F4"><i class="pi pi-envelope"></i><input type="email" [ngModel]="user()?.email" disabled style="color:#9CA3AF" /></div>
            <span class="field-hint">{{ 'profile.emailLocked' | t }}</span>
          </div>
          <div class="field" style="margin-bottom:16px">
            <label class="field-label">{{ 'profile.role' | t }}</label>
            <div class="field-input" style="background:#F9F7F4"><i class="pi pi-id-card"></i><input type="text" [ngModel]="user()?.roleName" disabled style="color:#9CA3AF" /></div>
          </div>
          <div class="field" style="margin-bottom:20px">
            <label class="field-label">{{ 'profile.phone' | t }}</label>
            <div class="field-input"><i class="pi pi-phone"></i><input type="tel" [(ngModel)]="phone" placeholder="+51 999 000 000" /></div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center" (click)="saveInfo()">
            <i class="pi pi-check"></i> {{ 'profile.saveChanges' | t }}
          </button>
          @if (saved) {
            <div class="banner banner-success" style="margin-top:12px;margin-bottom:0">
              <i class="pi pi-check-circle"></i><span>{{ 'profile.savedSuccess' | t }}</span>
            </div>
          }
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- Preferences -->
          <div class="card card-pad">
            <div class="card-title" style="margin-bottom:16px">{{ 'profile.preferences' | t }}</div>
            <div style="margin-bottom:16px">
              <div class="field-label" style="margin-bottom:8px">{{ 'profile.language' | t }}</div>
              <div style="display:flex;gap:6px">
                <button class="lang-opt" [class.active]="lang() === 'es'" (click)="setLang('es')">🇵🇪 Español</button>
                <button class="lang-opt" [class.active]="lang() === 'en'" (click)="setLang('en')">🇺🇸 English</button>
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid #F3F0EC">
              <div>
                <div style="font-size:13px;font-weight:500;color:#374151">{{ 'profile.notifications' | t }}</div>
                <div style="font-size:12px;color:#9CA3AF;margin-top:2px">{{ 'profile.notifDesc' | t }}</div>
              </div>
              <button class="switch" [class.active]="notif" (click)="notif = !notif" role="switch" [attr.aria-checked]="notif"><span></span></button>
            </div>
          </div>

          <!-- Security -->
          <div class="card card-pad">
            <div class="card-title" style="margin-bottom:16px">{{ 'profile.security' | t }}</div>
            <div class="card-title" style="font-size:13px;font-weight:500;margin-bottom:12px;color:#374151">{{ 'profile.changePassword' | t }}</div>
            @if (pwError) {
              <div class="state-alert" style="padding:10px 12px;font-size:12px">
                <i class="pi pi-times-circle"></i><span>{{ pwError }}</span>
              </div>
            }
            <div class="field" style="margin-bottom:12px">
              <label class="field-label">{{ 'profile.currentPassword' | t }}</label>
              <div class="field-input"><i class="pi pi-lock"></i><input type="password" [(ngModel)]="curPass" placeholder="••••••••" /></div>
            </div>
            <div class="field" style="margin-bottom:12px">
              <label class="field-label">{{ 'profile.newPassword' | t }}</label>
              <div class="field-input"><i class="pi pi-lock"></i><input type="password" [(ngModel)]="newPass" placeholder="••••••••" /></div>
            </div>
            <div class="field" style="margin-bottom:16px">
              <label class="field-label">{{ 'profile.confirmPassword' | t }}</label>
              <div class="field-input" [class.error]="!!pwError"><i class="pi pi-lock"></i><input type="password" [(ngModel)]="confPass" placeholder="••••••••" /></div>
            </div>
            <button class="btn btn-ghost" style="width:100%;justify-content:center" (click)="savePw()">
              <i class="pi pi-shield"></i> {{ 'profile.changePassword' | t }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfilePage {
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly lang = this.i18n.lang;
  name = this.user()?.name || '';
  phone = '';
  notif = true;
  saved = false;
  curPass = '';
  newPass = '';
  confPass = '';
  pwError = '';

  setLang(lang: Lang): void { this.i18n.set(lang); }

  saveInfo(): void { this.saved = true; }

  savePw(): void {
    this.pwError = '';
    if (!this.curPass || !this.newPass) return;
    if (this.newPass !== this.confPass) {
      this.pwError = this.i18n.t('profile.passwordMismatch');
      return;
    }
    this.curPass = '';
    this.newPass = '';
    this.confPass = '';
    this.saved = true;
  }
}

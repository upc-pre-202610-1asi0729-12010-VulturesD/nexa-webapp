import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrganizationRegistrationStore } from '@app/tenant-management/application/organization-registration.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

@Component({
  selector: 'nx-registration-pending',
  imports: [RouterLink, TranslatePipe, NexaIconComponent],
  template: `
    <main class="pending-page">
      <section class="pending-panel" aria-labelledby="pending-title">
        <div class="pending-icon"><nx-icon name="pi-clock"></nx-icon></div>
        <h1 id="pending-title">{{ 'tenant.registration.pending.title' | t }}</h1>
        <p>{{ 'tenant.registration.pending.desc' | t }}</p>
        <div class="pending-meta">
          <span>{{ externalId }}</span>
          @if (registration?.companyName) { <small>{{ registration?.companyName }}</small> }
          <strong>{{ workspaceUrl() }}</strong>
          <em>{{ 'tenant.registration.pending.reviewTime' | t }}</em>
          <small>{{ emailCopy() }}</small>
        </div>
        <div class="pending-steps">
          <span>{{ 'tenant.registration.pending.stepReview' | t }}</span>
          <span>{{ 'tenant.registration.pending.stepActivate' | t }}</span>
          <span>{{ 'tenant.registration.pending.stepInvite' | t }}</span>
        </div>
        <a routerLink="/login" class="pending-link">{{ 'tenant.registration.pending.backToLogin' | t }}</a>
      </section>
    </main>
  `,
  styles: [`
    .pending-page { min-height:100dvh; display:grid; place-items:center; padding:32px 16px; background:#f7fbff; }
    .pending-panel { width:min(100%,560px); display:grid; gap:14px; border:1px solid #dbe3ef; border-radius:24px; background:white; padding:28px; box-shadow:0 24px 60px rgba(15,23,42,.10); box-sizing:border-box; }
    .pending-icon { width:52px; height:52px; display:flex; align-items:center; justify-content:center; border-radius:16px; background:#eff6ff; color:#1d4ed8; --nexa-icon-size:22px; }
    h1 { margin:0; color:#0f172a; font-size:24px; } p { margin:0; color:#475569; line-height:1.6; }
    .pending-meta { display:grid; gap:6px; padding:14px; border:1px solid #bfdbfe; border-radius:14px; background:#eff6ff; overflow-wrap:anywhere; }
    .pending-meta span,.pending-meta em,.pending-meta small { color:#475569; font-style:normal; font-size:13px; } .pending-meta strong { color:#0f172a; }
    .pending-steps { display:grid; gap:8px; } .pending-steps span { padding:10px 12px; border:1px solid #e2e8f0; border-radius:12px; color:#334155; font-size:13px; background:#f8fafc; }
    .pending-link { width:fit-content; padding:12px 16px; border-radius:12px; background:#1d4ed8; color:white; font-weight:700; font-size:14px; }
  `],
})
export class RegistrationPendingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(OrganizationRegistrationStore);
  private readonly i18n = inject(I18nService);
  readonly externalId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly registration = this.store.submittedRegistration();

  workspaceUrl(): string {
    return this.registration?.workspaceSlug ? `${this.registration.workspaceSlug}.nexa.com.pe` : this.externalId;
  }

  emailCopy(): string {
    return this.registration?.adminEmail
      ? this.i18n.t('tenant.registration.pending.emailCopy', { email: this.registration.adminEmail })
      : '';
  }
}

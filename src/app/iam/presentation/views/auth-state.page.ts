import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IamStore } from '@app/iam/application/iam.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService, Lang } from '@app/shared/presentation/services/i18n.service';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

type AuthStateMode = 'recover' | 'blocked' | 'forbidden';

@Component({
  selector: 'nx-auth-state',
  imports: [FormsModule, RouterLink, TranslatePipe, NexaIconComponent],
  templateUrl: './auth-state.page.html',
  styleUrl: './auth-state.page.scss',
})
export class AuthStatePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly mode = (this.route.snapshot.data['mode'] || 'recover') as AuthStateMode;
  readonly lang = this.i18n.lang;
  readonly sent = signal(false);
  readonly requestedScope = computed(() => this.route.snapshot.queryParamMap.get('required') === 'portal' ? 'Portal B2B' : 'Nexa Ops');
  email = '';

  setLang(lang: Lang): void { this.i18n.set(lang); }

  sendRecovery(): void {
    if (!this.email.trim()) return;
    this.sent.set(true);
  }

  goToWorkspace(): void {
    const user = this.session.user();
    const path = user?.roleKey === 'owner'
      ? '/operations/company-administration'
      : user?.roleKey === 'buyer' || user?.scope === 'portal'
        ? '/portal/home'
        : user?.roleKey === 'viewer' ? '/profile' : '/dashboard';
    void this.router.navigateByUrl(path);
  }
}

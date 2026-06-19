import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService, Lang } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { PortalCartStore } from '@app/portal/application/portal-cart.store';

interface PortalNavItem {
  labelKey: string;
  icon: string;
  path: string;
  exact?: boolean;
}

const PORTAL_NAV: PortalNavItem[] = [
  { labelKey: 'portal.nav.home', icon: 'pi-home', path: '/portal/home', exact: true },
  { labelKey: 'portal.nav.catalog', icon: 'pi-box', path: '/portal/product-catalog' },
  { labelKey: 'portal.nav.requestBuilder', icon: 'pi-shopping-cart', path: '/portal/request-builder' },
  { labelKey: 'portal.nav.requests', icon: 'pi-inbox', path: '/portal/purchase-requests' },
  { labelKey: 'portal.nav.orders', icon: 'pi-truck', path: '/portal/purchase-orders' },
  { labelKey: 'portal.nav.documents', icon: 'pi-file-check', path: '/portal/business-documents' },
  { labelKey: 'portal.nav.payments', icon: 'pi-credit-card', path: '/portal/payment-methods' },
  { labelKey: 'portal.nav.premium', icon: 'pi-sparkles', path: '/portal/premium' },
  { labelKey: 'portal.nav.profile', icon: 'pi-user-edit', path: '/portal/profile' },
];

@Component({
  selector: 'nx-portal-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, NexaIconComponent],
  template: `
    <div class="buyer-app-shell">
      <header class="buyer-topbar">
        <a class="buyer-brand" routerLink="/portal/home" aria-label="Nexa">
          <img src="assets/img/nexa.svg" alt="Nexa" />
        </a>

        <nav class="buyer-nav" [attr.aria-label]="'portal.nav.main' | t">
          @for (item of primaryNav(); track item.path) {
            <a
              class="buyer-nav-link"
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }">
              <nx-icon [name]="item.icon"></nx-icon>
              <span>{{ item.labelKey | t }}</span>
            </a>
          }
        </nav>

        <div class="buyer-topbar-actions">
          <div class="buyer-lang" role="group" [attr.aria-label]="'common.language' | t">
            <button type="button" [class.active]="lang() === 'es'" [attr.aria-pressed]="lang() === 'es'" (click)="setLang('es')">ES</button>
            <button type="button" [class.active]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="setLang('en')">EN</button>
          </div>
          <button type="button" class="buyer-cart-btn" (click)="cart.toggle()" [attr.aria-label]="cartLabel()">
            <nx-icon name="pi-shopping-cart"></nx-icon>
            <span>{{ 'portal.cart' | t }}</span>
            @if (cart.count()) {
              <strong aria-live="polite">{{ cart.count() }}</strong>
            }
          </button>
          <button type="button" class="buyer-avatar-btn" (click)="go('/portal/profile')" [title]="user()?.name || ''">
            <span class="avatar">{{ user()?.initials }}</span>
          </button>
          <button type="button" class="buyer-menu-btn" [attr.aria-label]="'portal.nav.more' | t" (click)="menuOpen.set(!menuOpen())">
            <nx-icon name="pi-bars"></nx-icon>
          </button>
        </div>
      </header>

      @if (menuOpen()) {
        <div class="buyer-menu-panel">
          @for (item of nav; track item.path) {
            <button type="button" class="buyer-menu-item" [class.active]="isActive(item)" (click)="go(item.path)">
              <nx-icon [name]="item.icon"></nx-icon>
              <span>{{ item.labelKey | t }}</span>
            </button>
          }
          <button type="button" class="buyer-menu-item danger" (click)="logout()">
            <nx-icon name="pi-sign-out"></nx-icon>
            <span>{{ 'common.logout' | t }}</span>
          </button>
        </div>
      }

      <main class="buyer-main" [attr.aria-label]="'common.mainContent' | t">
        <router-outlet />
      </main>

      @if (cart.isOpen()) {
        <button type="button" class="drawer-overlay" (click)="cart.close()" [attr.aria-label]="'portal.cartClose' | t"></button>
        <aside class="drawer open" role="dialog" [attr.aria-label]="'portal.cart' | t" aria-modal="true">
          <div class="drawer-header">
            <div class="drawer-title">{{ 'portal.cart' | t }} ({{ cart.count() }})</div>
            <button type="button" class="btn btn-ghost btn-sm" (click)="cart.close()" [attr.aria-label]="'portal.cartClose' | t">
              <nx-icon name="pi-times"></nx-icon>
            </button>
          </div>
          <div class="drawer-body">
            @if (!cart.items().length) {
              <div class="empty-state">
                <div class="empty-state-icon"><nx-icon name="pi-shopping-cart"></nx-icon></div>
                <div class="empty-state-title">{{ 'portal.emptyCart' | t }}</div>
                <div class="empty-state-desc">{{ 'portal.emptyCartDesc' | t }}</div>
              </div>
            }
            @for (item of cart.items(); track item.productId) {
              <article class="cart-line">
                <div class="cart-line-visual" [class]="'cart-line-visual cat-' + (item.cat || 'default')">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.name" loading="lazy" />
                  } @else {
                    <nx-icon name="pi-box"></nx-icon>
                  }
                </div>
                <div class="cart-line-main">
                  <strong>{{ item.name }}</strong>
                  <span>S/ {{ item.price | number:'1.2-2' }} / {{ item.unit || ('portal.units.default' | t) }}</span>
                  <div class="cart-line-controls">
                    <button type="button" class="btn btn-ghost btn-sm" (click)="cart.setQty(item.productId, item.qty - 1)" [attr.aria-label]="'portal.cartDecrease' | t">-</button>
                    <span>{{ item.qty }}</span>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="cart.setQty(item.productId, item.qty + 1)" [attr.aria-label]="'portal.cartIncrease' | t">+</button>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="cart.remove(item.productId)" [attr.aria-label]="'portal.cartRemove' | t">
                      <nx-icon name="pi-trash"></nx-icon>
                    </button>
                  </div>
                </div>
                <strong>S/ {{ item.qty * item.price | number:'1.2-2' }}</strong>
              </article>
            }
          </div>
          @if (cart.items().length) {
            <div class="drawer-footer">
              <div class="flow-row-between">
                <span>{{ 'portal.total' | t }}</span>
                <strong>S/ {{ cart.total() | number:'1.2-2' }}</strong>
              </div>
              <button type="button" class="primary-btn" (click)="goRequestBuilder()">
                <nx-icon name="pi-send"></nx-icon>
                <span>{{ 'portal.submitRequest' | t }}</span>
              </button>
            </div>
          }
        </aside>
      }

      <footer class="buyer-footer">
        <span>{{ 'portal.footer.rights' | t }}</span>
        <nav [attr.aria-label]="'portal.footer.legal' | t">
          <a routerLink="/portal/legal/terms">{{ 'portal.footer.terms' | t }}</a>
          <a routerLink="/portal/legal/privacy">{{ 'portal.footer.privacy' | t }}</a>
          <a routerLink="/portal/support">{{ 'portal.footer.support' | t }}</a>
        </nav>
      </footer>

      <nav class="buyer-mobile-nav" [attr.aria-label]="'common.mobileNav' | t">
        @for (item of mobileNav(); track item.path) {
          <button type="button" class="buyer-mobile-item" [class.active]="isActive(item)" (click)="go(item.path)">
            <nx-icon [name]="item.icon"></nx-icon>
            <span>{{ item.labelKey | t }}</span>
          </button>
        }
      </nav>
    </div>
  `,
})
export class PortalShellComponent {
  private readonly router = inject(Router);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);
  readonly cart = inject(PortalCartStore);

  readonly nav = PORTAL_NAV;
  readonly user = this.session.user;
  readonly lang = this.i18n.lang;
  readonly menuOpen = signal(false);
  readonly primaryNav = computed(() => this.nav);
  readonly mobileNav = computed(() => [this.nav[0], this.nav[1], this.nav[3], this.nav[5], this.nav[8]]);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  isActive(item: PortalNavItem): boolean {
    const current = this.url();
    return current === item.path || (!item.exact && current.startsWith(`${item.path}/`));
  }

  setLang(lang: Lang): void {
    this.i18n.set(lang);
  }

  go(path: string): void {
    this.menuOpen.set(false);
    this.cart.close();
    void this.router.navigate([path]);
  }

  goRequestBuilder(): void {
    this.cart.close();
    this.go('/portal/request-builder');
  }

  cartLabel(): string {
    return `${this.i18n.t('portal.cart')} (${this.cart.count()})`;
  }

  logout(): void {
    this.session.clear();
    this.menuOpen.set(false);
    this.cart.close();
    void this.router.navigate(['/login']);
  }
}

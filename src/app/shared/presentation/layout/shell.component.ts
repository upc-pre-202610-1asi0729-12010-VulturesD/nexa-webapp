import { Component, computed, inject, signal } from '@angular/core';

import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IamStore } from '@app/iam/application/iam.store';
import { RoleKey } from '@app/iam/domain/model/user.model';
import { ShellStore } from '@app/shared/application/shell.store';
import { I18nService, Lang } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

interface NavItem {
  labelKey: string;
  icon: string;
  path: string;
  roles: RoleKey[];
  sectionKey: string;
  exact?: boolean;
  badge?: 'pendingOrders';
}

const NAV: NavItem[] = [
  { labelKey: 'nav.dashboard',           icon: 'pi-th-large',    path: '/dashboard',  roles: ['commercial', 'logistics'], sectionKey: 'nav.main', exact: true },
  { labelKey: 'nav.portal',              icon: 'pi-home',        path: '/portal',     roles: ['buyer'],                   sectionKey: 'nav.buyer', exact: true },
  { labelKey: 'nav.catalog',             icon: 'pi-box',         path: '/products',   roles: ['commercial'],              sectionKey: 'nav.main' },

  // Commercial
  { labelKey: 'nav.requests',            icon: 'pi-inbox',       path: '/commercial/purchase-requests', roles: ['commercial'], sectionKey: 'nav.commercial' },
  { labelKey: 'nav.orders',              icon: 'pi-file-edit',   path: '/orders',     roles: ['commercial'],              sectionKey: 'nav.commercial', badge: 'pendingOrders' },
  { labelKey: 'nav.createOrder',         icon: 'pi-plus-circle', path: '/orders/new', roles: ['commercial'],              sectionKey: 'nav.commercial', exact: true },
  { labelKey: 'nav.clients',             icon: 'pi-users',       path: '/clients',    roles: ['commercial'],              sectionKey: 'nav.commercial' },
  { labelKey: 'nav.documents',           icon: 'pi-file-check',  path: '/commercial/business-documents', roles: ['commercial'], sectionKey: 'nav.commercial' },

  // Operations / Logistics
  { labelKey: 'nav.inventory',           icon: 'pi-database',    path: '/inventory',  roles: ['logistics'],               sectionKey: 'nav.operations', exact: true },
  { labelKey: 'nav.dispatchBoard',       icon: 'pi-send',        path: '/dispatches', roles: ['logistics'],               sectionKey: 'nav.operations' },
  { labelKey: 'nav.proofOfDelivery',     icon: 'pi-camera',      path: '/proof-of-delivery', roles: ['logistics'],        sectionKey: 'nav.operations' },
  { labelKey: 'nav.operationalAnalytics',icon: 'pi-chart-bar',   path: '/analytics',  roles: ['logistics'],               sectionKey: 'nav.operations' },
  { labelKey: 'nav.documents',           icon: 'pi-file-check',  path: '/operations/business-documents', roles: ['logistics'], sectionKey: 'nav.operations' },
  { labelKey: 'nav.promotions',          icon: 'pi-megaphone',   path: '/operations/promotions', roles: ['logistics'],      sectionKey: 'nav.operations' },
  { labelKey: 'nav.customerPortals',     icon: 'pi-upload',      path: '/customer-portals', roles: ['logistics'],         sectionKey: 'nav.operations' },
  { labelKey: 'nav.companyAdministration',icon: 'pi-building',   path: '/operations/company-administration', roles: ['logistics'], sectionKey: 'nav.operations' },
  { labelKey: 'nav.profile',             icon: 'pi-user-edit',   path: '/profile',    roles: ['commercial', 'logistics'], sectionKey: 'nav.operations', exact: true },
];

@Component({
    selector: 'nx-shell',
    imports: [
    RouterOutlet,
    RouterLink,
    TranslatePipe,
    NexaIconComponent,
    MatSidenavModule,
    MatToolbarModule
],
    template: `
    <mat-sidenav-container id="ops-app" class="app-shell">
      <mat-sidenav class="sidebar" mode="side" opened>
        <div class="sidebar-logo">
          <img src="assets/img/nexa.svg" alt="Nexa" />
        </div>
        <nav class="sidebar-nav" [attr.aria-label]="'nav.main' | t">
          @for (group of groupedNav(); track group.sectionKey) {
            <div class="nav-section">{{ group.sectionKey | t }}</div>
            @for (item of group.items; track item.path) {
              <a
                class="nav-item"
                [routerLink]="item.path"
                [class.active]="isActive(item)"
                [attr.aria-current]="isActive(item) ? 'page' : null">
                <nx-icon [name]="item.icon"></nx-icon>
                <span>{{ item.labelKey | t }}</span>
                @if (badgeCount(item) > 0) {
                  <span class="nav-count" [attr.aria-label]="badgeCount(item) + ' ' + ('common.pending' | t)">{{ badgeCount(item) }}</span>
                }
              </a>
            }
          }
        </nav>
        <div class="sidebar-footer">
          <button type="button" class="user-chip" (click)="go('/profile')" [title]="'nav.profile' | t">
            <div class="avatar">{{ user()?.initials }}</div>
            <div style="flex:1; min-width:0;text-align:left">
              <div class="user-name">{{ user()?.name }}</div>
              <div class="user-role">{{ user()?.roleName }}</div>
            </div>
          </button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="main">
        <mat-toolbar class="topbar">
          <button
            class="topbar-icon-btn ops-menu-trigger"
            type="button"
            [attr.aria-label]="'common.mobileNav' | t"
            [attr.aria-expanded]="mobileMenuOpen()"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())">
            <nx-icon name="pi-bars"></nx-icon>
          </button>
          <div class="topbar-company" aria-label="Company identity">
            <div class="company-mark">{{ companyInitials }}</div>
            <div class="topbar-company-copy">
              <div class="topbar-company-name">{{ companyLegalName }}</div>
              <div class="topbar-company-meta">{{ companyDisplayName }}</div>
            </div>
          </div>
          <div class="topbar-right">
            <div style="display:flex;gap:2px;margin-right:4px" role="group" [attr.aria-label]="'common.language' | t">
              <button type="button" class="lang-opt" [class.active]="lang() === 'es'" [attr.aria-pressed]="lang() === 'es'" (click)="setLang('es')">ES</button>
              <button type="button" class="lang-opt" [class.active]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="setLang('en')">EN</button>
            </div>
            <button type="button" class="topbar-icon-btn" [title]="'common.notifications' | t" [attr.aria-label]="'common.notifications' | t">
              <nx-icon name="pi-bell"></nx-icon>
              <span class="notif-dot" aria-hidden="true"></span>
            </button>
            <a class="avatar" routerLink="/profile" [title]="user()?.name || ''">{{ user()?.initials }}</a>
          </div>
        </mat-toolbar>
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>

    @if (mobileMenuOpen()) {
      <div class="ops-mobile-menu-backdrop" (click)="mobileMenuOpen.set(false)" aria-hidden="true"></div>
    }

    <nav class="ops-mobile-menu" [class.open]="mobileMenuOpen()" [attr.aria-label]="'nav.main' | t">
      @for (item of nav(); track item.path) {
        <button
          type="button"
          class="ops-mobile-menu-item"
          [class.active]="isActive(item)"
          [attr.aria-current]="isActive(item) ? 'page' : null"
          (click)="go(item.path)">
          <nx-icon [name]="item.icon"></nx-icon>
          <span>{{ item.labelKey | t }}</span>
          @if (badgeCount(item) > 0) {
            <span class="nav-count">{{ badgeCount(item) }}</span>
          }
        </button>
      }
      <button type="button" class="ops-mobile-menu-item ops-mobile-menu-item-danger" (click)="logout()">
        <nx-icon name="pi-sign-out"></nx-icon>
        <span>{{ 'common.logout' | t }}</span>
      </button>
    </nav>

    <nav class="mobile-nav" [attr.aria-label]="'common.mobileNav' | t">
      <div class="mobile-nav-inner">
        @for (item of mobileItems(); track item.path) {
          <button
            type="button"
            class="mobile-nav-item"
            [class.active]="isActive(item)"
            [attr.aria-current]="isActive(item) ? 'page' : null"
            (click)="go(item.path)">
            <nx-icon [name]="item.icon"></nx-icon>
            <span>{{ item.labelKey | t }}</span>
            @if (badgeCount(item) > 0) {
              <span class="mobile-nav-count">{{ badgeCount(item) }}</span>
            }
          </button>
        }
      </div>
    </nav>
  `,
    styles: [`
    .lang-switch { display: flex; gap: 6px; padding: 0 12px 10px; }
    .lang-opt { padding: 4px 10px; border-radius: 6px; border: 1px solid #E5E7EB; font-size: 11px; font-weight: 600; color: #6B7280; cursor: pointer; background: #fff; }
    .lang-opt.active { background: #EFF6FF; border-color: #BFDBFE; color: #2563EB; }
  `]
})
export class ShellComponent {
  private readonly session = inject(IamStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly shellStore = inject(ShellStore);

  readonly user = this.session.user;
  readonly lang = this.i18n.lang;
  readonly mobileMenuOpen = signal(false);
  readonly companyLegalName = 'Importaciones y Comercio Internacional S.A.';
  readonly companyDisplayName = 'Nexa';
  readonly companyInitials = 'IC';
  readonly pendingOrders = this.shellStore.pendingOrders;

  readonly nav = computed<NavItem[]>(() => {
    const role = this.session.roleKey();
    if (!role) return [];
    return NAV.filter((n) => n.roles.includes(role)).map((n) => {
      if (n.path === '/dashboard') {
        return {
          ...n,
          path: role === 'logistics' ? '/dashboard/operations' : '/dashboard/commercial',
        };
      }
      return n;
    });
  });

  readonly mobileItems = computed(() => this.nav().slice(0, 5));

  readonly groupedNav = computed(() => {
    const items = this.nav();
    const map = new Map<string, NavItem[]>();
    for (const it of items) {
      const k = it.sectionKey;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    }
    return [...map.entries()].map(([sectionKey, items]) => ({ sectionKey, items }));
  });

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly topbarTitleKey = computed(() => {
    const u = this.url();
    const match = NAV.find((n) => u === n.path || u.startsWith(n.path + '/'));
    return match?.labelKey ?? 'nav.dashboard';
  });

  isActive(item: NavItem): boolean {
    const u = this.url();
    if (item.path === '/orders') {
      return u === '/orders' || (u.startsWith('/orders/') && u !== '/orders/new');
    }
    return u === item.path || (!item.exact && u.startsWith(item.path + '/'));
  }

  badgeCount(item: NavItem): number {
    return item.badge === 'pendingOrders' ? this.pendingOrders() : 0;
  }

  setLang(l: Lang): void { this.i18n.set(l); }

  go(path: string): void {
    this.mobileMenuOpen.set(false);
    void this.router.navigate([path]);
  }

  logout(): void {
    this.session.clear();
    this.mobileMenuOpen.set(false);
    this.router.navigate(['/login']);
  }
}

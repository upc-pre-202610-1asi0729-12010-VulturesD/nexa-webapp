import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IamStore } from '@app/iam/application/iam.store';
import { RoleKey } from '@app/iam/domain/model/user.model';
import { ShellStore } from '@app/shared/application/shell.store';
import { I18nService, Lang } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { CommunicationsStore } from '@app/shared/communications/application/communications.store';
import { WorkspaceSetupStore } from '@app/tenant-management/application/workspace-setup.store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

interface NavItem {
  labelKey: string;
  icon: string;
  path: string;
  queryParams?: Record<string, string>;
  roles: RoleKey[];
  sectionKey: string;
  exact?: boolean;
  badge?: 'pendingOrders';
  action?: 'logout';
}

const NAV: NavItem[] = [
  // Logistics - Workspace section
  { labelKey: 'nav.salesDashboard',      icon: 'pi-th-large',    path: '/dashboard',  roles: ['commercial'],              sectionKey: 'nav.workspace', exact: true },
  { labelKey: 'nav.dashboard',           icon: 'pi-th-large',    path: '/dashboard',  roles: ['logistics'],               sectionKey: 'nav.workspace', exact: true },
  { labelKey: 'nav.inventory',           icon: 'pi-database',    path: '/inventory',  roles: ['logistics'],               sectionKey: 'nav.workspace', exact: true },
  { labelKey: 'nav.dispatchBoard',       icon: 'pi-send',        path: '/dispatches', roles: ['logistics'],               sectionKey: 'nav.workspace' },
  { labelKey: 'nav.proofOfDelivery',     icon: 'pi-camera',      path: '/proof-of-delivery', roles: ['logistics'],        sectionKey: 'nav.workspace' },
  { labelKey: 'nav.operationalAnalytics',icon: 'pi-chart-line',  path: '/analytics',  roles: ['logistics'],               sectionKey: 'nav.workspace' },
  { labelKey: 'nav.catalog',             icon: 'pi-box',         path: '/products',   roles: ['commercial'],              sectionKey: 'nav.workspace' },
  { labelKey: 'nav.documents',           icon: 'pi-file-check',  path: '/operations/business-documents', roles: ['logistics'], sectionKey: 'nav.workspace' },

  // Commercial - Sales section
  { labelKey: 'nav.requests',            icon: 'pi-inbox',       path: '/commercial/purchase-requests', roles: ['commercial'], sectionKey: 'nav.commercial' },
  { labelKey: 'nav.orders',              icon: 'pi-file-edit',   path: '/orders',     roles: ['commercial'],              sectionKey: 'nav.commercial', badge: 'pendingOrders' },
  { labelKey: 'nav.createOrder',         icon: 'pi-plus-circle', path: '/orders/new', roles: ['commercial'],              sectionKey: 'nav.commercial', exact: true },
  { labelKey: 'nav.clients',             icon: 'pi-users',       path: '/clients',    roles: ['commercial'],              sectionKey: 'nav.commercial' },
  { labelKey: 'nav.documents',           icon: 'pi-file-check',  path: '/commercial/business-documents', roles: ['commercial'], sectionKey: 'nav.commercial' },

  // Owner - Company section
  { labelKey: 'nav.promotions',          icon: 'pi-megaphone',   path: '/operations/promotions', roles: ['owner', 'logistics'], sectionKey: 'nav.company' },
  { labelKey: 'tenant.companyAdmin.sections.overview', icon: 'pi-building', path: '/operations/company-administration', queryParams: { section: 'overview' }, roles: ['owner'], sectionKey: 'nav.company', exact: true },
  { labelKey: 'tenant.companyAdmin.sections.workspaces', icon: 'pi-sitemap', path: '/operations/company-administration', queryParams: { section: 'workspaces' }, roles: ['owner'], sectionKey: 'nav.company' },
  { labelKey: 'tenant.companyAdmin.sections.teammates', icon: 'pi-users', path: '/operations/company-administration', queryParams: { section: 'teammates' }, roles: ['owner'], sectionKey: 'nav.company' },
  { labelKey: 'tenant.companyAdmin.sections.rules', icon: 'pi-shield', path: '/operations/company-administration', queryParams: { section: 'rules' }, roles: ['owner'], sectionKey: 'nav.company' },
  { labelKey: 'tenant.companyAdmin.sections.customFields', icon: 'pi-list-check', path: '/operations/company-administration', queryParams: { section: 'custom-fields' }, roles: ['owner'], sectionKey: 'nav.company' },
  { labelKey: 'tenant.companyAdmin.sections.billing', icon: 'pi-credit-card', path: '/operations/company-administration', queryParams: { section: 'billing' }, roles: ['owner'], sectionKey: 'nav.company' },
  { labelKey: 'tenant.companyAdmin.sections.preferences', icon: 'pi-cog', path: '/operations/company-administration', queryParams: { section: 'preferences' }, roles: ['owner'], sectionKey: 'nav.company' },

  // Account section
  { labelKey: 'nav.profile',             icon: 'pi-user',        path: '/profile',    roles: ['commercial', 'logistics', 'owner', 'viewer'], sectionKey: 'nav.account', exact: true },
  { labelKey: 'nav.logout',              icon: 'pi-sign-out',    path: '/login',      roles: ['commercial', 'logistics', 'owner', 'viewer'], sectionKey: 'nav.account', action: 'logout' },
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
      <mat-sidenav class="sidebar workspace-sidebar" mode="side" opened>
        <div class="workspace-identity">
          <div class="workspace-brand">
            <img src="assets/img/nexa.svg" alt="Nexa" />
            <span>Workspace</span>
          </div>
          <div class="workspace-card">
            <div class="company-mark workspace-mark">{{ companyInitials() }}</div>
            <div class="workspace-copy">
              <strong>{{ companyLegalName() }}</strong>
              <span>{{ workspaceUrl() }}</span>
            </div>
          </div>
          <div class="workspace-role">
            <nx-icon name="pi-id-card" aria-hidden="true"></nx-icon>
            <span>{{ roleLabel() | t }}</span>
          </div>
        </div>

        <nav class="sidebar-nav workspace-nav" [attr.aria-label]="'nav.main' | t">
          @for (group of groupedNav(); track group.sectionKey) {
            <div class="nav-section">{{ group.sectionKey | t }}</div>
            @for (item of group.items; track item.labelKey) {
              @if (item.action === 'logout') {
                <button
                  type="button"
                  class="nav-item workspace-nav-item danger"
                  (click)="logout()">
                  <nx-icon [name]="item.icon"></nx-icon>
                  <span>{{ item.labelKey | t }}</span>
                </button>
              } @else {
                <a
                  class="nav-item workspace-nav-item"
                  [routerLink]="item.path"
                  [queryParams]="item.queryParams"
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
          }
        </nav>
        <div class="sidebar-footer">
          <button type="button" class="user-chip workspace-user" (click)="go('/profile')" [title]="'nav.profile' | t">
            <div class="avatar">{{ user()?.initials }}</div>
            <div style="flex:1; min-width:0;text-align:left">
              <div class="user-name">{{ user()?.name }}</div>
              <div class="user-role">{{ roleLabel() | t }}</div>
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
            <div class="company-mark">{{ companyInitials() }}</div>
            <div class="topbar-company-copy">
              <div class="topbar-company-name">{{ companyLegalName() }}</div>
              <div class="topbar-company-meta">{{ workspaceUrl() }} · {{ roleLabel() | t }}</div>
            </div>
          </div>
          <div class="topbar-right">
            <div style="display:flex;gap:2px;margin-right:4px" role="group" [attr.aria-label]="'common.language' | t">
              <button type="button" class="lang-opt" [class.active]="lang() === 'es'" [attr.aria-pressed]="lang() === 'es'" (click)="setLang('es')">ES</button>
              <button type="button" class="lang-opt" [class.active]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="setLang('en')">EN</button>
            </div>
            <div class="notification-shell">
              <button
                type="button"
                class="topbar-icon-btn"
                [title]="'common.notifications' | t"
                [attr.aria-label]="'common.notifications' | t"
                [attr.aria-expanded]="notificationsOpen()"
                (click)="notificationsOpen.set(!notificationsOpen())">
                <nx-icon name="pi-bell"></nx-icon>
                @if (unreadNotifications() > 0) {
                  <span class="notif-dot" aria-hidden="true"></span>
                }
              </button>
              @if (notificationsOpen()) {
                <section class="notification-popover">
                  <header>
                    <strong>{{ 'common.notifications' | t }}</strong>
                    <span>{{ unreadNotifications() }} {{ 'common.pending' | t }}</span>
                  </header>
                  <div class="notification-list">
                    @for (item of notifications(); track item.id) {
                      <button type="button" class="notification-item" [class.unread]="!item.read" (click)="markNotificationRead(item.id)">
                        <strong>{{ item.title }}</strong>
                        <span>{{ item.body }}</span>
                      </button>
                    } @empty {
                      <div class="notification-empty">{{ 'communications.noNotifications' | t }}</div>
                    }
                  </div>
                </section>
              }
            </div>
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
      <div class="mobile-workspace-card">
        <strong>{{ companyLegalName() }}</strong>
        <span>{{ workspaceUrl() }} · {{ roleLabel() | t }}</span>
      </div>
      @for (item of nav(); track item.labelKey) {
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
        @for (item of mobileItems(); track item.labelKey) {
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
    .notification-shell { position: relative; }
    .notification-popover {
      position: absolute;
      top: 42px;
      right: 0;
      width: min(340px, calc(100vw - 32px));
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 18px 45px rgba(15, 23, 42, .14);
      z-index: 80;
      overflow: hidden;
    }
    .notification-popover header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border-bottom: 1px solid #edf2f7;
      font-size: 12px;
    }
    .notification-popover header span { color: #64748b; }
    .notification-list { display: grid; max-height: 330px; overflow: auto; }
    .notification-item {
      display: grid;
      gap: 4px;
      width: 100%;
      padding: 12px 14px;
      border: 0;
      border-bottom: 1px solid #edf2f7;
      background: #fff;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }
    .notification-item.unread { background: #f8fbff; }
    .notification-item strong { color: #0f172a; font-size: 12px; }
    .notification-item span, .notification-empty { color: #64748b; font-size: 11px; line-height: 1.4; }
    .notification-empty { padding: 16px; text-align: center; }
  `]
})
export class ShellComponent implements OnInit {
  private readonly session = inject(IamStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly shellStore = inject(ShellStore);
  private readonly communications = inject(CommunicationsStore);
  private readonly setupStore = inject(WorkspaceSetupStore);

  readonly user = this.session.user;
  readonly lang = this.i18n.lang;
  readonly mobileMenuOpen = signal(false);
  readonly notificationsOpen = signal(false);

  readonly tenantSetup = this.setupStore.setup;
  readonly companyLegalName = computed(() => this.tenantSetup()?.tenant.name ?? 'ICISA Cold Chain');
  readonly workspaceSlug = computed(() => this.tenantSetup()?.tenant.slug ?? this.user()?.workspaceSlug ?? 'icisa');
  readonly workspaceUrl = computed(() => this.tenantSetup()?.tenant.workspaceUrl ?? `${this.workspaceSlug()}.nexa.com.pe`);
  readonly companyDisplayName = computed(() => this.tenantSetup()?.tenant.legalName ?? 'Importaciones y Comercio Internacional S.A.');
  readonly companyInitials = computed(() => (this.companyLegalName() || 'IC').substring(0, 2).toUpperCase());

  readonly pendingOrders = this.shellStore.pendingOrders;
  readonly notifications = this.communications.recentNotifications;
  readonly unreadNotifications = this.communications.unreadCount;

  readonly roleLabel = computed(() => {
    const user = this.user();
    if (!user) return 'tenant.companyAdmin.roles.Viewer';
    const role = user.roleKey;
    if (role === 'owner') return 'tenant.companyAdmin.roles.CompanyOwner';
    if (role === 'logistics') return 'tenant.companyAdmin.roles.LogisticsManager';
    if (role === 'commercial') return 'auth.scopeOps';
    if (role === 'buyer') return 'tenant.companyAdmin.roles.B2BBuyer';
    return 'tenant.companyAdmin.roles.Viewer';
  });

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

  readonly mobileItems = computed<NavItem[]>(() => {
    const items = this.nav();
    const role = this.session.roleKey();
    if (role === 'owner') {
      return [
        { labelKey: 'tenant.companyAdmin.sections.overview', icon: 'pi-building', path: '/operations/company-administration', queryParams: { section: 'overview' }, roles: ['owner'] as RoleKey[], sectionKey: 'nav.company' },
        { labelKey: 'nav.profile', icon: 'pi-user-edit', path: '/profile', roles: ['owner'] as RoleKey[], sectionKey: 'nav.account' }
      ] as NavItem[];
    }
    return items.slice(0, 5);
  });

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

  ngOnInit(): void {
    this.communications.load();
    const slug = this.user()?.workspaceSlug;
    if (slug) {
      this.setupStore.load(slug);
    }
  }

  isActive(item: NavItem): boolean {
    const u = this.url();
    if (item.queryParams) {
      const targetSection = item.queryParams['section'] || 'overview';
      try {
        const urlObj = new URL(u, 'http://localhost');
        const section = urlObj.searchParams.get('section') || 'overview';
        return urlObj.pathname.startsWith(item.path) && section === targetSection;
      } catch {
        return u.startsWith(item.path) && u.includes(targetSection);
      }
    }
    const pathname = u.split('?')[0];
    if (item.path === '/orders') {
      return pathname === '/orders' || (pathname.startsWith('/orders/') && pathname !== '/orders/new');
    }
    return pathname === item.path || (!item.exact && pathname.startsWith(item.path + '/'));
  }

  badgeCount(item: NavItem): number {
    return item.badge === 'pendingOrders' ? this.pendingOrders() : 0;
  }

  setLang(l: Lang): void { this.i18n.set(l); }

  go(path: string): void {
    this.mobileMenuOpen.set(false);
    this.notificationsOpen.set(false);
    void this.router.navigate([path]);
  }

  markNotificationRead(id: number): void {
    this.communications.markRead(id);
  }

  logout(): void {
    this.session.clear();
    this.mobileMenuOpen.set(false);
    this.notificationsOpen.set(false);
    this.router.navigate(['/login']);
  }
}

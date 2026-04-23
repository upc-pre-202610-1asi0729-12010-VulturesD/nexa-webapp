import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, filter, map, of, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IamStore } from '@app/iam/application/iam.store';
import { RoleKey } from '@app/iam/domain/model/user.model';
import { I18nService, Lang } from '@app/shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';
import { Order } from '@app/ordering/domain/model';

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
  { labelKey: 'nav.dashboard',   icon: 'pi-th-large',   path: '/dashboard',  roles: ['commercial', 'logistics'],          sectionKey: 'nav.main', exact: true },
  { labelKey: 'nav.portal',      icon: 'pi-home',       path: '/portal',     roles: ['buyer'],                            sectionKey: 'nav.buyer', exact: true },
  { labelKey: 'nav.catalog',     icon: 'pi-box',        path: '/products',   roles: ['commercial', 'logistics'],          sectionKey: 'nav.main' },
  { labelKey: 'nav.inventory',   icon: 'pi-database',   path: '/inventory',  roles: ['logistics'],                        sectionKey: 'nav.main', exact: true },
  { labelKey: 'nav.orders',      icon: 'pi-file-edit',  path: '/orders',     roles: ['commercial', 'logistics'],          sectionKey: 'nav.commercial', badge: 'pendingOrders' },
  { labelKey: 'nav.createOrder', icon: 'pi-plus-circle',path: '/orders/new', roles: ['commercial', 'logistics'],          sectionKey: 'nav.commercial', exact: true },
  { labelKey: 'nav.clients',     icon: 'pi-users',      path: '/clients',    roles: ['commercial', 'logistics'],          sectionKey: 'nav.commercial' },
  { labelKey: 'nav.dispatch',    icon: 'pi-send',       path: '/dispatches', roles: ['logistics'],                        sectionKey: 'nav.operations' },
  { labelKey: 'nav.analytics',   icon: 'pi-chart-bar',  path: '/analytics',  roles: ['commercial', 'logistics'],          sectionKey: 'nav.operations' },
  { labelKey: 'nav.profile',     icon: 'pi-user-edit',  path: '/profile',    roles: ['commercial', 'logistics'],          sectionKey: 'nav.operations', exact: true },
];

@Component({
  selector: 'nx-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <img src="assets/img/nexa.svg" alt="Nexa" />
        </div>
        <nav class="sidebar-nav">
          @for (group of groupedNav(); track group.sectionKey) {
            <div class="nav-section">{{ group.sectionKey | t }}</div>
            @for (item of group.items; track item.path) {
              <a class="nav-item"
                 [routerLink]="item.path"
                 [class.active]="isActive(item)">
                <i class="pi" [class]="'pi ' + item.icon"></i>
                <span>{{ item.labelKey | t }}</span>
                @if (badgeCount(item) > 0) {
                  <span class="nav-count">{{ badgeCount(item) }}</span>
                }
              </a>
            }
          }
        </nav>
        <div class="sidebar-footer">
          <button class="user-chip" (click)="logout()" [title]="'nav.logout' | t">
            <div class="avatar">{{ user()?.initials }}</div>
            <div style="flex:1; min-width:0;text-align:left">
              <div class="user-name">{{ user()?.name }}</div>
              <div class="user-role">{{ user()?.roleName }}</div>
            </div>
          </button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="topbar-title">{{ topbarTitleKey() | t }}</div>
          <div style="font-size:12px;color:#9CA3AF;margin-left:8px">Nexa Cold Chain Distribution</div>
          <div class="topbar-right">
            <div style="display:flex;gap:2px;margin-right:4px" role="group" aria-label="Idioma">
              <button class="lang-opt" [class.active]="lang() === 'es'" (click)="setLang('es')">ES</button>
              <button class="lang-opt" [class.active]="lang() === 'en'" (click)="setLang('en')">EN</button>
            </div>
            <button class="topbar-icon-btn notif-dot" title="Notificaciones">
              <i class="pi pi-bell"></i>
            </button>
            <a class="avatar" routerLink="/profile" [title]="user()?.name || ''">{{ user()?.initials }}</a>
          </div>
        </header>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .lang-switch { display: flex; gap: 6px; padding: 0 12px 10px; }
    .lang-opt { padding: 4px 10px; border-radius: 6px; border: 1px solid #E5E7EB; font-size: 11px; font-weight: 600; color: #6B7280; cursor: pointer; background: #fff; }
    .lang-opt.active { background: #EFF6FF; border-color: #BFDBFE; color: #2563EB; }
  `],
})
export class ShellComponent {
  private readonly session = inject(IamStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly http = inject(HttpClient);

  readonly user = this.session.user;
  readonly lang = this.i18n.lang;
  readonly pendingOrders = toSignal(
    this.http.get<Order[]>('api/v1/orders').pipe(
      map((orders) => orders.filter((o) => ['validating', 'blocked'].includes(o.status)).length),
      catchError(() => of(0)),
    ),
    { initialValue: 0 },
  );

  readonly nav = computed<NavItem[]>(() => {
    const role = this.session.roleKey();
    if (!role) return [];
    return NAV.filter((n) => n.roles.includes(role));
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

  logout(): void {
    this.session.clear();
    this.router.navigate(['/login']);
  }
}

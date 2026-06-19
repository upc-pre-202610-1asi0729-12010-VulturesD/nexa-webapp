import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@app/catalog/domain/model';
import { PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { PortalCartStore } from '@app/portal/application/portal-cart.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-portal-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
  template: `
    <div class="buyer-page">
      <header class="portal-catalog-header" role="banner">
        <div>
          <div class="flow-eyebrow">{{ 'portal.eyebrow' | t }}</div>
          <h1 class="portal-catalog-title">{{ 'portal.nav.catalog' | t }}</h1>
          <p class="portal-catalog-subtitle">{{ catalogAuthorizedCopy() }}</p>
        </div>
        <a routerLink="/portal/request-builder" class="primary-btn portal-catalog-request-btn">
          <nx-icon name="pi-shopping-cart"></nx-icon>
          <span>{{ requestBuilderCopy() }}</span>
        </a>
      </header>

      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!user()?.clientId || !snapshot()?.client) {
        <div class="flow-panel">
          <div class="empty-state">
            <div class="empty-state-icon"><nx-icon name="pi-lock"></nx-icon></div>
            <div class="empty-state-title">{{ 'portal.empty.noClientTitle' | t }}</div>
            <div class="empty-state-desc">{{ 'portal.empty.noClientDesc' | t }}</div>
          </div>
        </div>
      } @else {
        @if (snapshot(); as data) {
          <div class="portal-catalog-layout">
            <aside class="portal-catalog-filter-panel" [attr.aria-label]="'catalog.filters' | t">
              <label class="search-input portal-catalog-search">
                <i class="pi pi-search" aria-hidden="true"></i>
                <input
                  [value]="catalogSearch()"
                  (input)="catalogSearch.set(inputValue($event))"
                  [placeholder]="'catalog.searchFullPlaceholder' | t"
                  [attr.aria-label]="'catalog.searchFullPlaceholder' | t" />
              </label>

              <section class="portal-catalog-filter-section">
                <div class="portal-catalog-filter-title">{{ 'catalog.categories' | t }}</div>
                @for (item of catalogCategories(data); track item) {
                  <button type="button" class="portal-catalog-filter-option" [class.active]="catalogCategory() === item" (click)="catalogCategory.set(item)" [attr.aria-pressed]="catalogCategory() === item">
                    {{ item === 'all' ? ('catalog.allCategories' | t) : item }}
                  </button>
                }
              </section>

              <section class="portal-catalog-filter-section">
                <div class="portal-catalog-filter-title">{{ 'catalog.coldType' | t }}</div>
                @for (item of catalogColdTypes(); track item) {
                  <button type="button" class="portal-catalog-filter-option" [class.active]="catalogColdType() === item" (click)="catalogColdType.set(item)" [attr.aria-pressed]="catalogColdType() === item">
                    {{ item === 'all' ? ('catalog.allColdTypes' | t) : coldTypeLabel(item) }}
                  </button>
                }
              </section>

              <section class="portal-catalog-filter-section">
                <button type="button" class="portal-catalog-filter-heading" (click)="catalogBrandExpanded.set(!catalogBrandExpanded())" [attr.aria-expanded]="catalogBrandExpanded()">
                  <span>{{ 'catalog.brand' | t }}</span>
                  <i [class]="catalogBrandExpanded() ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" aria-hidden="true"></i>
                </button>
                <button type="button" class="portal-catalog-filter-option" [class.active]="catalogBrand() === 'all'" (click)="catalogBrand.set('all')" [attr.aria-pressed]="catalogBrand() === 'all'">
                  {{ 'catalog.allBrands' | t }}
                </button>
                @if (catalogBrandExpanded()) {
                  <div class="portal-catalog-filter-collapsible">
                    @for (item of catalogBrands(data); track item) {
                      @if (item !== 'all') {
                        <button type="button" class="portal-catalog-filter-option" [class.active]="catalogBrand() === item" (click)="catalogBrand.set(item)" [attr.aria-pressed]="catalogBrand() === item">
                          {{ item }}
                        </button>
                      }
                    }
                  </div>
                }
              </section>

              <section class="portal-catalog-filter-section">
                <button type="button" class="portal-catalog-filter-option" [class.active]="catalogOnlyOffers()" (click)="catalogOnlyOffers.set(!catalogOnlyOffers())" [attr.aria-pressed]="catalogOnlyOffers()">
                  <i class="pi pi-tag" aria-hidden="true"></i>
                  {{ 'catalog.offers' | t }}
                </button>
              </section>
            </aside>

            <section class="portal-catalog-results">
              <div class="portal-catalog-result-bar">
                <span class="flow-note">{{ catalogFilteredSummary(data) }}</span>
                <button type="button" class="btn btn-ghost btn-sm" (click)="clearCatalogFilters()">{{ 'catalog.clearFilters' | t }}</button>
              </div>

              @if (catalogProducts(data).length === 0) {
                <div class="flow-panel">
                  <div class="empty-state">
                    <div class="empty-state-icon"><nx-icon name="pi-filter"></nx-icon></div>
                    <div class="empty-state-title">{{ 'catalog.noResultsTitle' | t }}</div>
                    <div class="empty-state-desc">{{ 'catalog.noResultsDesc' | t }}</div>
                  </div>
                </div>
              } @else {
                <div class="grid-4 portal-catalog-product-grid" role="list" aria-label="B2B catalog">
                  @for (product of catalogProducts(data); track product.id) {
                    <article class="buyer-card portal-catalog-card" role="listitem">
                      <a class="portal-catalog-visual-link" [routerLink]="['/portal/product-catalog', product.id]" [attr.aria-label]="('catalog.viewDetails' | t) + ' ' + product.name">
                        <div class="buyer-product-visual" [class]="'buyer-product-visual cat-' + (product.cat || 'default')">
                          @if (product.imageUrl) {
                            <img class="buyer-product-image" [src]="product.imageUrl" [alt]="product.name" loading="lazy" />
                          } @else {
                            <nx-icon name="pi-box"></nx-icon>
                          }
                          @if (hasCatalogOffer(product, data)) {
                            <span class="flow-pill flow-pill-amber portal-catalog-offer">{{ 'catalog.offer' | t }}</span>
                          }
                        </div>
                      </a>

                      <div class="portal-catalog-card-body">
                        <div class="flow-row-between portal-catalog-card-head">
                          <div>
                            <h2 class="portal-catalog-product-title">{{ product.name }}</h2>
                            <div class="text-mono portal-catalog-sku">{{ product.sku }}</div>
                            <div class="portal-catalog-brand-line">{{ catalogBrandLine(product) }}</div>
                          </div>
                          <button
                            type="button"
                            class="portal-catalog-add-btn"
                            (click)="addToRequest(product)"
                            [attr.aria-label]="'portal.actions.addToRequest' | t">
                            <i class="pi pi-plus" aria-hidden="true"></i>
                          </button>
                        </div>

                        <div class="flow-row portal-catalog-badges">
                          <span [class]="coldTypeBadge(product.coldType)">{{ coldTypeLabel(product.coldType) }}</span>
                          <span class="badge-temp">{{ product.temperatureRange || product.temp }}</span>
                          <span class="flow-pill">{{ brandForProduct(product) }}</span>
                        </div>

                        <div class="flow-row-between portal-catalog-commercial">
                          <span class="flow-pill" [ngClass]="available(product) > 0 ? 'flow-pill-green' : 'flow-pill-amber'">
                            {{ product.commercialAvailability || (available(product) > 0 ? ('portal.status.available' | t) : ('portal.status.consult' | t)) }}
                          </span>
                          <strong>S/ {{ product.price | number:'1.2-2' }}</strong>
                        </div>

                        <a [routerLink]="['/portal/product-catalog', product.id]" class="btn btn-ghost btn-sm portal-catalog-detail-btn">
                          {{ 'catalog.viewDetails' | t }}
                        </a>
                      </div>
                    </article>
                  }
                </div>
              }
            </section>
          </div>
        }
      }
    </div>
  `,
})
export class PortalCatalogPage {
  private readonly store = inject(PortalStore);
  readonly cart = inject(PortalCartStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);
  readonly catalogSearch = signal('');
  readonly catalogCategory = signal('all');
  readonly catalogColdType = signal('all');
  readonly catalogBrand = signal('all');
  readonly catalogOnlyOffers = signal(false);
  readonly catalogBrandExpanded = signal(false);

  constructor() {
    const user = this.user();
    if (!user?.clientId) {
      this.loading.set(false);
      return;
    }

    this.store.load(user.clientId).subscribe({
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  catalogProducts(snapshot: PortalSnapshot): Product[] {
    const query = this.catalogSearch().trim().toLowerCase();
    return snapshot.products.filter((product) => {
      const brand = this.brandForProduct(product);
      const haystack = `${product.name} ${product.sku} ${product.category} ${brand}`.toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (this.catalogCategory() !== 'all' && product.category !== this.catalogCategory()) return false;
      if (this.catalogColdType() !== 'all' && (product.coldType || 'chilled') !== this.catalogColdType()) return false;
      if (this.catalogBrand() !== 'all' && brand !== this.catalogBrand()) return false;
      if (this.catalogOnlyOffers() && !this.hasCatalogOffer(product, snapshot)) return false;
      return true;
    });
  }

  catalogCategories(snapshot: PortalSnapshot): string[] {
    return ['all', ...new Set(snapshot.products.map((product) => product.category).filter(Boolean))];
  }

  catalogColdTypes(): string[] {
    return ['all', 'frozen', 'chilled', 'ambient'];
  }

  catalogBrands(snapshot: PortalSnapshot): string[] {
    return ['all', ...new Set(snapshot.products.map((product) => this.brandForProduct(product)).filter((brand) => brand && brand !== this.i18n.t('portal.detail.brandPending')))];
  }

  catalogAuthorizedCopy(): string {
    const snapshot = this.snapshot();
    const count = snapshot ? this.catalogProducts(snapshot).length : 0;
    return this.i18n.t('catalog.authorizedProducts', { count });
  }

  catalogFilteredSummary(snapshot: PortalSnapshot): string {
    return this.i18n.t('catalog.filteredSummary', { visible: this.catalogProducts(snapshot).length, total: snapshot.products.length });
  }

  requestBuilderCopy(): string {
    return this.i18n.t('catalog.requestBuilderCount', { count: this.cart.count() });
  }

  addToRequest(product: Product): void {
    this.cart.add(product);
    this.cart.isOpen.set(true);
  }

  brandForProduct(product: Product): string {
    return product.brandName || product.brand || this.i18n.t('portal.detail.brandPending');
  }

  catalogBrandLine(product: Product): string {
    return this.i18n.t('catalog.brandLine', { brand: this.brandForProduct(product) });
  }

  coldTypeLabel(type?: string): string {
    return this.i18n.t(`catalog.cold.${type || 'chilled'}`);
  }

  coldTypeBadge(type?: string): string {
    if (type === 'frozen') return 'badge badge-blue';
    if (type === 'ambient') return 'badge badge-gray';
    return 'badge badge-cyan';
  }

  hasCatalogOffer(product: Product, snapshot: PortalSnapshot): boolean {
    const promotedProductIds = new Set(snapshot.promotions.flatMap((promotion) => promotion.productIds ?? []));
    return promotedProductIds.has(product.id);
  }

  clearCatalogFilters(): void {
    this.catalogSearch.set('');
    this.catalogCategory.set('all');
    this.catalogColdType.set('all');
    this.catalogBrand.set('all');
    this.catalogOnlyOffers.set(false);
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement | null)?.value ?? '';
  }

  available(product: Product): number {
    return Math.max(0, (product.stock ?? 0) - (product.reserved ?? 0));
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product } from '@app/catalog/domain/model';
import { PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { PortalCartStore } from '@app/portal/application/portal-cart.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-portal-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
  template: `
    <div class="buyer-page">
      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!product()) {
        <div class="empty-state">
          <div class="empty-state-icon"><nx-icon name="pi-search"></nx-icon></div>
          <div class="empty-state-title">{{ 'portal.detail.productNotFound' | t }}</div>
          <a routerLink="/portal/product-catalog" class="primary-btn">{{ 'portal.detail.backCatalog' | t }}</a>
        </div>
      } @else {
        @if (product(); as item) {
          <div class="flow-row" style="margin-bottom:4px;flex-wrap:wrap">
            <a routerLink="/portal/product-catalog" class="btn btn-ghost btn-sm"><i class="pi pi-arrow-left"></i>{{ 'portal.detail.backCatalog' | t }}</a>
            <span class="flow-pill">{{ item.sku }}</span>
          </div>

          <div class="flow-grid-12">
            <section class="buyer-card span-5">
              <div class="buyer-product-visual" [class]="'buyer-product-visual cat-' + (item.cat || 'default')" style="height:300px">
                @if (item.imageUrl) {
                  <img class="buyer-product-image buyer-product-image-large" [src]="item.imageUrl" [alt]="item.name" />
                } @else {
                  <nx-icon name="pi-box"></nx-icon>
                }
                <span class="flow-pill flow-pill-amber" style="position:absolute;left:16px;top:16px">{{ 'portal.detail.activeOffer' | t }}</span>
              </div>
            </section>

            <section class="flow-panel span-7">
              <div class="flow-panel-pad flow-stack">
                <div class="flow-row" style="flex-wrap:wrap">
                  <span class="badge-temp">{{ item.temperatureRange || item.temp }}</span>
                  <span class="flow-pill flow-pill-green">{{ item.commercialAvailability || ('portal.status.available' | t) }}</span>
                  <span class="flow-pill">{{ brandFor(item) }}</span>
                </div>
                <div>
                  <h1 class="buyer-title" style="color:#0F172A">{{ item.name }}</h1>
                  <p class="flow-note" style="margin-top:8px">{{ item.description || item.knowledge }}</p>
                </div>
                <div class="grid-3">
                  <div class="flow-panel-pad" style="background:#F8FAFC;border-radius:10px">
                    <div class="flow-eyebrow">{{ 'portal.detail.unit' | t }}</div>
                    <strong>{{ item.unit }}</strong>
                  </div>
                  <div class="flow-panel-pad" style="background:#F8FAFC;border-radius:10px">
                    <div class="flow-eyebrow">{{ 'portal.detail.weight' | t }}</div>
                    <strong>{{ item.weightKg || 0 | number:'1.1-2' }} kg</strong>
                  </div>
                  <div class="flow-panel-pad" style="background:#F8FAFC;border-radius:10px">
                    <div class="flow-eyebrow">{{ 'portal.detail.refPrice' | t }}</div>
                    <strong>S/ {{ item.price | number:'1.2-2' }}</strong>
                  </div>
                  <div class="flow-panel-pad" style="background:#F8FAFC;border-radius:10px">
                    <div class="flow-eyebrow">{{ 'portal.detail.brand' | t }}</div>
                    <strong>{{ brandFor(item) }}</strong>
                  </div>
                </div>
                <div class="banner banner-info">
                  <i class="pi pi-sparkles"></i>
                  <div><strong>{{ 'portal.detail.productKnowledge' | t }}</strong> {{ item.knowledge }}</div>
                </div>
                <button type="button" class="primary-btn" style="justify-content:center" (click)="addToRequest(item)">
                  <i class="pi pi-plus"></i>{{ 'portal.actions.addToRequest' | t }}
                </button>
              </div>
            </section>

            @if (related().length) {
              <section class="flow-panel span-12">
                <div class="flow-panel-head"><div class="flow-title">{{ 'portal.detail.relatedProducts' | t }}</div></div>
                <div class="grid-3 flow-panel-pad">
                  @for (relatedItem of related(); track relatedItem.id) {
                    <article class="buyer-card flow-panel-pad">
                      <div style="font-weight:800">{{ relatedItem.name }}</div>
                      <div class="flow-note">{{ brandFor(relatedItem) }} · {{ relatedItem.category }} · {{ relatedItem.temperatureRange || relatedItem.temp }}</div>
                      <a class="btn btn-ghost btn-sm" style="margin-top:12px" [routerLink]="['/portal/product-catalog', relatedItem.id]">{{ 'common.view' | t }}</a>
                    </article>
                  }
                </div>
              </section>
            }
          </div>
        }
      }
    </div>
  `,
})
export class PortalProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PortalStore);
  readonly cart = inject(PortalCartStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);
  readonly productId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), { initialValue: '' });
  readonly product = computed(() => this.snapshot()?.products.find((item) => this.matchesProduct(item, this.productId())) ?? null);
  readonly related = computed(() => {
    const item = this.product();
    if (!item) return [];
    return this.snapshot()?.products.filter((row) => row.category === item.category && String(row.id) !== String(item.id)).slice(0, 3) ?? [];
  });

  constructor() {
    const user = this.session.user();
    if (!user?.clientId) {
      this.loading.set(false);
      return;
    }
    this.store.load(user.clientId).subscribe({
      next: (snapshot) => { this.snapshot.set(snapshot); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  brandFor(item: Product): string {
    return item.brandName || item.brand || this.i18n.t('portal.detail.brandPending');
  }

  addToRequest(item: Product): void {
    this.cart.add(item);
    this.cart.isOpen.set(true);
  }

  private matchesProduct(item: Product, value: string): boolean {
    return [item.id, item.productId, item.catalogItemId, item.sku]
      .filter((candidate): candidate is string => candidate != null)
      .some((candidate) => String(candidate) === value);
  }
}

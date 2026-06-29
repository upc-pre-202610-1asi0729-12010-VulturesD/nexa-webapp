import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Order } from '@app/ordering/domain/model';
import { PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { IamStore } from '@app/iam/application/iam.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-portal-order-success',
    imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!order()) {
        <section class="empty-state" role="status" style="max-width:520px;margin:48px auto;text-align:center;padding:0 16px">
          <div class="empty-state-icon" style="background:#FEE2E2;color:#B91C1C"><nx-icon name="pi-search"></nx-icon></div>
          <div class="empty-state-title">{{ 'portal.orderNotFound' | t }}</div>
          <div class="empty-state-desc">{{ 'portal.orderNotFoundDesc' | t }}</div>
          <a routerLink="/portal/product-catalog" class="primary-btn">
            <nx-icon name="pi-box"></nx-icon>{{ 'portal.backToCatalog' | t }}
          </a>
        </section>
      } @else {
        @if (order(); as item) {
          <section class="flow-panel" style="max-width:560px;margin:48px auto;text-align:center;padding:28px 20px" aria-labelledby="order-success-title">
            <div style="width:80px;height:80px;border-radius:50%;background:#DCFCE7;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;color:#15803D">
              <nx-icon name="pi-check"></nx-icon>
            </div>
            <h1 id="order-success-title" class="buyer-title" style="margin-bottom:8px">{{ 'portal.orderSent' | t }}</h1>
            <p class="buyer-subtitle" style="margin-bottom:32px">{{ 'portal.orderSentDesc' | t:{ total: money(item.total) } }}</p>

            <article class="flow-panel" style="text-align:left;margin-bottom:24px">
              <div class="flow-panel-pad">
                <div class="flow-row-between" style="margin-bottom:12px">
                  <div class="meta-label">{{ 'portal.orderNumber' | t }}</div>
                  <span class="flow-pill flow-pill-blue">{{ 'orders.status.validating' | t }}</span>
                </div>
                <div class="text-mono" style="font-size:20px;font-weight:800;color:#1D4ED8;margin-bottom:16px">{{ item.id }}</div>
                <div class="divider" style="margin:0 0 12px"></div>
                <div class="flow-row-between" style="font-size:13px;margin-bottom:6px">
                  <span class="flow-note">{{ 'portal.products' | t }}</span>
                  <strong>{{ item.items.length }}</strong>
                </div>
                <div class="flow-row-between" style="font-size:15px;font-weight:800">
                  <span>{{ 'portal.total' | t }}</span>
                  <span>S/ {{ money(item.total) }}</span>
                </div>
              </div>
            </article>

            <div class="banner banner-info" style="text-align:left;margin-bottom:24px">
              <nx-icon name="pi-info-circle"></nx-icon>
              <div>
                <strong>{{ 'portal.whatsNext' | t }}</strong> {{ 'portal.whatsNextDesc' | t }}
              </div>
            </div>

            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
              <a routerLink="/portal/purchase-orders" class="btn btn-ghost">
                <nx-icon name="pi-clipboard"></nx-icon>{{ 'portal.viewMyOrders' | t }}
              </a>
              <a routerLink="/portal/product-catalog" class="primary-btn">
                <nx-icon name="pi-box"></nx-icon>{{ 'portal.keepShopping' | t }}
              </a>
            </div>
          </section>
        }
      }
    </div>
  `
})
export class PortalOrderSuccessPage {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PortalStore);
  private readonly session = inject(IamStore);

  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);
  readonly orderId = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('orderId') ?? '')), { initialValue: '' });
  readonly order = computed(() => this.findOrder(this.snapshot(), this.orderId()));

  constructor() {
    const user = this.session.user();
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

  money(value: number): string {
    return Number(value || 0).toFixed(2);
  }

  private findOrder(snapshot: PortalSnapshot | null, orderId: string): Order | null {
    if (!snapshot || !orderId) return null;
    return snapshot.myOrders.find((item) => item.id === orderId || String(item.backendId ?? '') === orderId) ?? null;
  }
}

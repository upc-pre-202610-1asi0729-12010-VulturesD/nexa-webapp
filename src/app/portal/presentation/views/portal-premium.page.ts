import { Component } from '@angular/core';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

interface PremiumFeature {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  badgeKey: string;
  bg: string;
  color: string;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  { icon: 'pi-star', titleKey: 'portal.premium.visualCatalog', descriptionKey: 'portal.premium.visualCatalogDesc', badgeKey: 'portal.premium.premium', bg: '#EFF6FF', color: '#2563EB' },
  { icon: 'pi-map', titleKey: 'portal.premium.trackingMap', descriptionKey: 'portal.premium.trackingMapDesc', badgeKey: 'portal.premium.futureGps', bg: '#ECFEFF', color: '#0891B2' },
  { icon: 'pi-wave-pulse', titleKey: 'portal.premium.temperature', descriptionKey: 'portal.premium.temperatureDesc', badgeKey: 'portal.premium.futureIot', bg: '#EEF2FF', color: '#4F46E5' },
  { icon: 'pi-tag', titleKey: 'portal.premium.campaigns', descriptionKey: 'portal.premium.campaignsDesc', badgeKey: 'portal.premium.premium', bg: '#FEF3C7', color: '#B45309' },
  { icon: 'pi-refresh', titleKey: 'portal.premium.reorder', descriptionKey: 'portal.premium.reorderDesc', badgeKey: 'portal.premium.premium', bg: '#F0FDF4', color: '#15803D' },
  { icon: 'pi-comments', titleKey: 'portal.premium.support', descriptionKey: 'portal.premium.supportDesc', badgeKey: 'portal.premium.futureSupport', bg: '#F8FAFC', color: '#334155' },
];

@Component({
    selector: 'nx-portal-premium',
    imports: [TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <header class="portal-page-header">
        <div>
          <h1 class="portal-page-title">{{ 'portal.nav.premium' | t }}</h1>
          <p class="portal-page-subtitle">{{ 'portal.premium.subtitle' | t }}</p>
        </div>
        <span class="premium-lock"><nx-icon name="pi-lock"></nx-icon>{{ 'portal.premium.futureCapability' | t }}</span>
      </header>

      <section class="buyer-shell-band portal-section-hero" style="margin-bottom: 22px;">
        <div>
          <h2 class="buyer-title" style="font-size: 24px; font-weight: 800;">{{ 'portal.premium.heroTitle' | t }}</h2>
          <p class="buyer-subtitle" style="margin-top: 10px; font-size: 14px; opacity: 0.85;">{{ 'portal.premium.heroSubtitle' | t }}</p>
        </div>
      </section>

      <div class="grid-3">
        @for (feature of premiumFeatures; track feature.titleKey) {
          <article class="buyer-card flow-panel-pad" style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
            <div class="flow-kpi-icon" [style.background]="feature.bg" [style.color]="feature.color" style="width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <nx-icon [name]="feature.icon"></nx-icon>
            </div>
            <div class="flow-title" style="margin-top:12px; font-weight: 700; font-size: 15px;">{{ feature.titleKey | t }}</div>
            <div class="flow-note" style="color: #64748B; font-size: 13px; line-height: 1.4; flex: 1;">{{ feature.descriptionKey | t }}</div>
            <span class="premium-lock" style="margin-top:14px; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: #475569;">
              <nx-icon name="pi-lock"></nx-icon>
              {{ feature.badgeKey | t }}
            </span>
          </article>
        }
      </div>
    </div>
  `
})
export class PortalPremiumPage {
  readonly premiumFeatures = PREMIUM_FEATURES;
}

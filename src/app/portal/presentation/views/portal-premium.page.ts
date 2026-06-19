import { Component, inject } from '@angular/core';

import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

@Component({
    selector: 'nx-portal-premium',
    imports: [TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <header class="portal-page-header">
        <div>
          <h1 class="portal-page-title">{{ 'portal.nav.premium' | t }}</h1>
          <p class="portal-page-subtitle">{{ 'portal.sections.premium.subtitle' | t }}</p>
        </div>
        <span class="premium-lock"><nx-icon name="pi-lock"></nx-icon>{{ 'portal.premium.future' | t }}</span>
      </header>

      <section class="buyer-shell-band portal-section-hero" style="margin-bottom: 22px;">
        <div>
          <h2 class="buyer-title" style="font-size: 24px; font-weight: 800;">{{ 'portal.premium.heroTitle' | t }}</h2>
          <p class="buyer-subtitle" style="margin-top: 10px; font-size: 14px; opacity: 0.85;">{{ 'portal.premium.heroSubtitle' | t }}</p>
        </div>
      </section>

      <div class="grid-3">
        @for (feature of premiumFeatures(); track feature.title) {
          <article class="buyer-card flow-panel-pad" style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
            <div class="flow-kpi-icon" [style.background]="feature.bg" [style.color]="feature.color" style="width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <nx-icon [name]="feature.icon"></nx-icon>
            </div>
            <div class="flow-title" style="margin-top:12px; font-weight: 700; font-size: 15px;">{{ feature.title }}</div>
            <div class="flow-note" style="color: #64748B; font-size: 13px; line-height: 1.4; flex: 1;">{{ feature.description }}</div>
            <span class="premium-lock" style="margin-top:14px; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: #475569;">
              <nx-icon name="pi-lock"></nx-icon>
              {{ feature.badge }}
            </span>
          </article>
        }
      </div>
    </div>
  `
})
export class PortalPremiumPage {
  private readonly i18n = inject(I18nService);

  premiumFeatures() {
    return [
      {
        icon: 'pi-star',
        title: this.i18n.lang() === 'es' ? 'Catálogo visual avanzado' : 'Advanced visual catalog',
        description: this.i18n.lang() === 'es' ? 'Fotografía de producto, fichas técnicas, favoritos y flujos de reorden.' : 'Product photography, technical sheets, favorites and reorder flows.',
        badge: 'Premium',
        bg: '#EFF6FF',
        color: '#2563EB',
      },
      {
        icon: 'pi-map',
        title: this.i18n.lang() === 'es' ? 'Mapa de seguimiento' : 'Tracking map',
        description: this.i18n.lang() === 'es' ? 'Ubicación de vehículos, estado de ruta y visibilidad de ETA para entregas refrigeradas.' : 'Vehicle location, route status and ETA visibility for refrigerated deliveries.',
        badge: 'Future GPS',
        bg: '#ECFEFF',
        color: '#0891B2',
      },
      {
        icon: 'pi-thermometer',
        title: this.i18n.lang() === 'es' ? 'Temperatura trazable' : 'Traceable temperature',
        description: this.i18n.lang() === 'es' ? 'Telemetría IoT, alertas de riesgo de frío e historial de temperatura para productos sensibles.' : 'IoT telemetry, cold-risk alerts and temperature history for sensitive products.',
        badge: 'Future IoT',
        bg: '#EEF2FF',
        color: '#4F46E5',
      },
      {
        icon: 'pi-tag',
        title: this.i18n.lang() === 'es' ? 'Campañas avanzadas' : 'Advanced campaigns',
        description: this.i18n.lang() === 'es' ? 'Ofertas por cliente, segmento y recurrencia de compra.' : 'Offers by client, segment and purchase recurrence.',
        badge: 'Premium',
        bg: '#FEF3C7',
        color: '#B45309',
      },
      {
        icon: 'pi-refresh',
        title: this.i18n.lang() === 'es' ? 'Reordenar / favoritos' : 'Reorder / favorites',
        description: this.i18n.lang() === 'es' ? 'Reordenar a partir de órdenes de compra frecuentes y productos guardados.' : 'Reorder from frequent purchase orders and saved products.',
        badge: 'Premium',
        bg: '#F0FDF4',
        color: '#15803D',
      },
      {
        icon: 'pi-comments',
        title: this.i18n.lang() === 'es' ? 'Soporte guiado' : 'Guided support',
        description: this.i18n.lang() === 'es' ? 'Ayuda contextual para productos, almacenamiento, documentos y flujos de solicitud recurrentes.' : 'Contextual help for products, storage, documents and recurring request workflows.',
        badge: 'Future support',
        bg: '#F8FAFC',
        color: '#334155',
      },
    ];
  }
}

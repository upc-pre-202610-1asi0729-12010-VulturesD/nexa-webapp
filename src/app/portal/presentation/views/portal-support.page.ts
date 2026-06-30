import { Component, inject, computed } from '@angular/core';

import { Router } from '@angular/router';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

@Component({
    selector: 'nx-portal-support',
    template: `
    <div class="legal-page">
      @if (supportCopy(); as support) {
        <section class="legal-hero support-hero">
          <div class="legal-hero-copy">
            <span class="legal-pill">{{ support.pill }}</span>
            <h1>{{ support.title }}</h1>
            <p>{{ support.summary }}</p>
          </div>
          <aside class="legal-hero-note" [attr.aria-label]="support.noteTitle">
            <span>{{ support.noteTitle }}</span>
            <strong>{{ support.noteHeadline }}</strong>
            <p>{{ support.noteCopy }}</p>
          </aside>
        </section>

        <div class="flow-grid-12">
          @for (card of support.cards; track card.title) {
            <article class="flow-panel span-4 support-card">
              <div class="flow-panel-pad flow-stack">
                <div class="support-icon"><i [class]="'pi ' + card.icon" aria-hidden="true"></i></div>
                <div>
                  <h2>{{ card.title }}</h2>
                  <p>{{ card.copy }}</p>
                </div>
                <button class="btn btn-primary" (click)="navigate(card.to)">{{ card.action }}</button>
              </div>
            </article>
          }

          <section class="flow-panel span-12">
            <div class="flow-panel-head">
              <div>
                <div class="flow-title">{{ support.notesTitle }}</div>
                <div class="flow-subtitle">{{ support.notesSub }}</div>
              </div>
            </div>
            <div class="flow-panel-pad support-note-grid">
              @for (note of support.notes; track note[0]) {
                <div>
                  <span class="flow-eyebrow">{{ note[0] }}</span>
                  <p>{{ note[1] }}</p>
                </div>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `
})
export class PortalSupportPage {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly supportCopy = computed(() => {
    const es = this.i18n.lang() === 'es';
    return es ? {
      pill: 'Soporte',
      title: 'Soporte Nexa',
      summary: 'Recibe ayuda con solicitudes, credito, seguimiento de ordenes, documentos y acceso de cuenta.',
      noteTitle: 'Canales de soporte',
      noteHeadline: 'Asistencia de ventas, logistica y cuenta',
      noteCopy: 'Nexa direcciona las consultas al equipo operativo correcto para resolver temas comerciales, credito, despacho y documentos con mayor rapidez.',
      cards: [
        { icon: 'pi-inbox', title: 'Revision de solicitudes', copy: 'Usa My Requests para revisar comentarios de ventas, ajustes, validacion de credito y estado de aceptacion.', action: 'Abrir solicitudes', to: '/portal/purchase-requests' },
        { icon: 'pi-wallet', title: 'Credito y pagos', copy: 'Revisa credito mensual disponible, programa la cuota actual o envia una solicitud de aumento a ventas.', action: 'Abrir pagos', to: '/portal/payment-methods' },
        { icon: 'pi-truck', title: 'Seguimiento de ordenes', copy: 'Usa My Orders para revisar validacion, documentos, preparacion, ruta y evidencia de entrega.', action: 'Abrir ordenes', to: '/portal/purchase-orders' },
        { icon: 'pi-user-edit', title: 'Cuenta comprador', copy: 'Actualiza identidad, direcciones, notificaciones y referencias de pago desde tu perfil.', action: 'Abrir perfil', to: '/portal/profile' },
      ],
      notesTitle: 'Como funciona soporte',
      notesSub: 'Rutas de soporte para operaciones B2B refrigeradas.',
      notes: [
        ['Asistencia de ventas', 'Contacta a ventas para ajustes de solicitud, aumento de credito, precios, disponibilidad y validacion comercial.'],
        ['Asistencia logistica', 'Contacta a logistica para preparacion de ruta, ventanas de entrega, evidencia, incidentes de frio y excepciones de despacho.'],
        ['Asistencia de cuenta', 'Usa Profile para identidad, direcciones y notificaciones. Para problemas de acceso, cambia de cuenta e inicia sesion con un usuario autorizado.'],
      ],
    } : {
      pill: 'Support',
      title: 'Nexa Support',
      summary: 'Get help with buyer requests, credit coordination, order tracking, documents and account access.',
      noteTitle: 'Support channels',
      noteHeadline: 'Sales, logistics and account assistance',
      noteCopy: 'Nexa routes questions to the right operational team so buyers can resolve commercial, credit, dispatch and document issues faster.',
      cards: [
        { icon: 'pi-inbox', title: 'Request review', copy: 'Use My Requests to review sales comments, adjustment requests, credit validation and acceptance status.', action: 'Open requests', to: '/portal/purchase-requests' },
        { icon: 'pi-wallet', title: 'Credit and payments', copy: 'Review available monthly credit, schedule the current quota or send a credit increase request to Sales.', action: 'Open payments', to: '/portal/payment-methods' },
        { icon: 'pi-truck', title: 'Order tracking', copy: 'Use My Orders to check validation, documents, dispatch preparation, route status and delivery evidence.', action: 'Open orders', to: '/portal/purchase-orders' },
        { icon: 'pi-user-edit', title: 'Buyer account', copy: 'Update buyer identity, delivery preferences, notifications and payment references from your profile.', action: 'Open profile', to: '/portal/profile' },
      ],
      notesTitle: 'How support works',
      notesSub: 'Business support paths for refrigerated B2B operations.',
      notes: [
        ['Sales assistance', 'Contact Sales for request adjustments, credit limit increases, pricing questions, product availability and commercial validation.'],
        ['Logistics assistance', 'Contact Logistics for route preparation, delivery windows, proof of delivery, cold-chain incidents and dispatch exceptions.'],
        ['Account assistance', 'Use Profile for buyer identity, addresses and notification preferences. For access issues, switch accounts and sign in with an authorized user.'],
      ],
    };
  });

  navigate(path: string): void {
    void this.router.navigate([path]);
  }
}

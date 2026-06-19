import { Component, inject, computed } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
    selector: 'nx-portal-legal',
    imports: [TranslatePipe],
    template: `
    <div class="legal-page">
      @if (legalDocument(); as legal) {
        <section class="legal-hero">
          <div class="legal-hero-copy">
            <span class="legal-pill">{{ legal.pill }}</span>
            <h1>{{ legal.title }}</h1>
            <p>{{ legal.summary }}</p>
          </div>
          <aside class="legal-hero-note" aria-label="Legal summary">
            <span>{{ legal.noteTitle }}</span>
            <strong>{{ legal.noteHeadline }}</strong>
            <p>{{ legal.noteCopy }}</p>
          </aside>
        </section>

        <div class="legal-layout">
          <nav class="legal-sidebar" aria-label="Portal legal navigation">
            <button
              type="button"
              [class.active]="page() === 'terms'"
              (click)="navigate('/portal/legal/terms')">
              {{ 'portal.footer.terms' | t }}
            </button>
            <button
              type="button"
              [class.active]="page() === 'privacy'"
              (click)="navigate('/portal/legal/privacy')">
              {{ 'portal.footer.privacy' | t }}
            </button>
            <button
              type="button"
              (click)="navigate('/portal/support')">
              {{ 'portal.footer.support' | t }}
            </button>
          </nav>

          <main class="legal-content">
            <div class="legal-content-head">
              <span class="status-label">{{ legal.badge }}</span>
              <span class="flow-note">{{ 'portal.legal.lastUpdated' | t }}: {{ legal.updated }}</span>
            </div>
            @for (section of legal.sections; track section[0]; let index = $index) {
              <article class="legal-section-card">
                <span class="legal-section-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <div>
                  <h2>{{ section[0] }}</h2>
                  <p>{{ section[1] }}</p>
                </div>
              </article>
            }
          </main>
        </div>
      }
    </div>
  `
})
export class PortalLegalPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly String = String;

  readonly page = toSignal(
    this.route.data.pipe(map((data) => data['page'] as 'terms' | 'privacy')),
    { initialValue: 'terms' as 'terms' | 'privacy' }
  );

  readonly legalDocument = computed(() => {
    const page = this.page();
    const es = this.i18n.lang() === 'es';
    const docs = {
      terms: es ? {
        pill: 'Legal',
        title: 'Terminos y Condiciones',
        summary: 'Estos terminos regulan el uso de Nexa como portal B2B para pedidos refrigerados, validacion comercial y coordinacion logistica.',
        noteTitle: 'Alcance del servicio',
        noteHeadline: 'Comercio refrigerado, validacion y despacho trazable',
        noteCopy: 'Nexa conecta compradores, ventas, logistica, documentos y referencias de pago para mover pedidos refrigerados con responsabilidad clara.',
        badge: 'Documento de terminos',
        updated: 'Junio 2026',
        sections: [
          ['Acceso al servicio', 'Nexa brinda acceso por roles a empresas autorizadas, compradores, ventas, logistica y administradores. Cada usuario debe proteger sus credenciales y usar el portal solo para actividades del cliente asignado.'],
          ['Solicitudes de compra', 'Los productos agregados desde el catalogo generan solicitudes. Una solicitud no es una orden confirmada hasta que ventas valide condiciones comerciales, credito, disponibilidad, direccion de entrega y documentos requeridos.'],
          ['Precios y disponibilidad', 'Los precios, promociones, disponibilidad comercial y requisitos de temperatura pueden cambiar antes de la validacion. Nexa puede ajustar una solicitud por suministro, capacidad de ruta, cadena de frio o acuerdos comerciales.'],
          ['Credito y pagos', 'Las lineas de credito, limites mensuales, referencias de pago y cuotas se usan para apoyar decisiones comerciales y de despacho.'],
          ['Ordenes y despacho', 'Las ordenes confirmadas avanzan por preparacion documental, disponibilidad operativa, preparacion de ruta, seguimiento en ruta y evidencia de entrega.'],
          ['Documentos', 'Facturas, guias, evidencias de entrega y archivos relacionados se presentan para coordinacion empresarial.'],
        ],
      } : {
        pill: 'Legal',
        title: 'Terms & Conditions',
        summary: 'These terms govern the use of Nexa as a B2B cold-chain ordering, validation and logistics coordination portal.',
        noteTitle: 'Service scope',
        noteHeadline: 'Cold-chain commerce, validation and dispatch coordination',
        noteCopy: 'Nexa connects buyers, sales, logistics, documents and payment references so refrigerated orders can move with clear accountability.',
        badge: 'Terms document',
        updated: 'June 2026',
        sections: [
          ['Service access', 'Nexa provides role-based access for authorized companies, buyers, sales users, logistics users and administrators. Each user is responsible for keeping credentials private and using the portal only for business activities related to their assigned company.'],
          ['Buyer requests', 'Products added through the catalog create purchase requests. A request is not a confirmed purchase order until sales validates commercial conditions, credit, product availability, delivery address and documents.'],
          ['Prices and availability', 'Catalog prices, promotions, commercial availability and temperature requirements may change before validation. Nexa may adjust a request when supply, route capacity, cold-chain constraints or agreements require it.'],
          ['Credit and payments', 'Client credit lines, monthly limits, payment references and payment schedules support commercial decisions.'],
          ['Orders and dispatch', 'Confirmed purchase orders move through document preparation, operations readiness, route preparation, on-route tracking and delivery evidence.'],
          ['Documents', 'Invoices, guides, proof of delivery and related files are presented for business coordination.'],
        ],
      },
      privacy: es ? {
        pill: 'Privacidad',
        title: 'Politica de Privacidad',
        summary: 'Esta politica explica como Nexa gestiona informacion de cuentas, solicitudes, ordenes, credito y logistica dentro del portal.',
        noteTitle: 'Alcance de datos',
        noteHeadline: 'Datos de negocio para operaciones refrigeradas',
        noteCopy: 'Nexa usa datos de cuenta y transaccion para validar solicitudes, coordinar documentos, gestionar credito y sostener la trazabilidad de entrega.',
        badge: 'Documento de privacidad',
        updated: 'Junio 2026',
        sections: [
          ['Informacion que recopilamos', 'Nexa puede guardar identidad empresarial, contacto comprador, identificadores tributarios, direcciones, selecciones de catalogo, comentarios, items de orden, eventos de despacho, documentos, mensajes y metadata de pago.'],
          ['Uso de la informacion', 'La informacion se usa para autenticar usuarios, mostrar catalogo y perfil correcto, validar solicitudes, coordinar credito, preparar documentos, programar despachos, resolver soporte y mejorar reportes operativos.'],
          ['Referencias de pago', 'Cuando se registra una tarjeta o billetera, Nexa guarda solo metadata como marca, ultimos cuatro digitos, titular, etiqueta y preferencia predeterminada.'],
          ['Credito y cobranzas', 'Limites, uso, periodos, vencimientos y estado de credito se comparten con ventas y logistica para decisiones comerciales y de despacho de forma consistente.'],
          ['Acceso por roles', 'El comprador ve registros de su empresa; ventas y logistica ven solo la informacion necesaria para operar el pedido.'],
        ],
      } : {
        pill: 'Privacy',
        title: 'Privacy Policy',
        summary: 'This policy explains how Nexa handles business account, request, order, credit and logistics information inside the portal.',
        noteTitle: 'Data scope',
        noteHeadline: 'Business data for refrigerated commerce operations',
        noteCopy: 'Nexa uses account and transaction data to validate requests, coordinate documents, manage credit and support delivery traceability.',
        badge: 'Privacy document',
        updated: 'June 2026',
        sections: [
          ['Information we collect', 'Nexa may store business identity data, buyer contact information, company tax identifiers, delivery addresses, catalog selections, request comments, order items, dispatch events, documents, messages and payment reference metadata.'],
          ['How data is used', 'Information is used to authenticate users, show the correct catalog and client profile, validate purchase requests, coordinate credit, prepare documents, schedule dispatches, resolve support cases and improve reporting.'],
          ['Payment references', 'When a card or wallet reference is registered, Nexa stores only business metadata such as brand, last four digits, holder name, label and default preference.'],
          ['Credit and collections', 'Credit limits, used amounts, payment periods, due dates and credit status are shared with sales and logistics roles for consistent decisions.'],
          ['Sharing and access', 'Buyers see their own company records; sales and logistics see only the information required to operate the order.'],
        ],
      },
    };
    return docs[page];
  });

  navigate(path: string): void {
    void this.router.navigate([path]);
  }
}

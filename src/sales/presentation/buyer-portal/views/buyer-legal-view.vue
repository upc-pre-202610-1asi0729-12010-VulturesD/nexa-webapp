<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  page: {
    type: String,
    default: 'terms',
  },
});

const router = useRouter();
const { locale } = useI18n();

const documents = {
  en: {
    terms: {
      eyebrow: 'Legal',
      badge: 'Terms document',
      title: 'Terms & Conditions',
      summary: 'These terms govern the use of Nexa as a B2B cold-chain ordering, validation and logistics coordination portal.',
      noteTitle: 'Service scope',
      noteHeadline: 'Cold-chain commerce, validation and dispatch coordination',
      noteCopy: 'Nexa connects buyers, sales, logistics, documents and payment references so refrigerated orders can move with clear accountability.',
      updated: 'June 2026',
      sections: [
        ['Service access', 'Nexa provides role-based access for authorized companies, buyers, sales users, logistics users and administrators. Each user is responsible for keeping credentials private and using the portal only for business activities related to their assigned company.'],
        ['Buyer requests', 'Products added through the catalog create purchase requests. A request is not a confirmed purchase order until the sales team validates commercial conditions, credit, product availability, delivery address and documentation requirements.'],
        ['Prices and availability', 'Catalog prices, promotions, commercial availability and temperature requirements may change before validation. Nexa may adjust a request when supply, route capacity, cold-chain constraints or commercial agreements require it.'],
        ['Credit and payments', 'Client credit lines, monthly limits, payment references and payment schedules are used to support commercial decisions. Nexa stores payment references as business metadata and applies credit status to validation and dispatch coordination.'],
        ['Orders and dispatch', 'Confirmed purchase orders move through document preparation, operations readiness, route preparation, on-route tracking and delivery evidence. Timeline dates shown in the portal reflect operational events recorded for the order.'],
        ['Documents', 'Invoices, guides, proof of delivery and related files are presented for business coordination. Official document validity depends on the issuing systems, tax rules, logistics evidence and the client document profile configured for each account.'],
        ['Acceptable use', 'Users must not upload unlawful content, impersonate another company, attempt unauthorized access, manipulate stock or credit records, or use Nexa to interfere with the service, data or operations of other clients.'],
        ['Service changes', 'Nexa may update workflows, catalog organization, credit controls, support channels and integrations to improve security, traceability and operational quality. Continued use after updates means the user accepts the revised terms.'],
      ],
    },
    privacy: {
      eyebrow: 'Privacy',
      badge: 'Privacy document',
      title: 'Privacy Policy',
      summary: 'This policy explains how Nexa handles business account, request, order, credit and logistics information inside the portal.',
      noteTitle: 'Data scope',
      noteHeadline: 'Business data for refrigerated commerce operations',
      noteCopy: 'Nexa uses account and transaction data to validate requests, coordinate documents, manage credit and support delivery traceability.',
      updated: 'June 2026',
      sections: [
        ['Information we collect', 'Nexa may store business identity data, buyer contact information, company tax identifiers, delivery addresses, catalog selections, request comments, order items, dispatch events, documents, messages and payment reference metadata.'],
        ['How data is used', 'Information is used to authenticate users, show the correct catalog and client profile, validate purchase requests, coordinate credit, prepare documents, schedule dispatches, resolve support cases and improve operational reporting.'],
        ['Payment references', 'When a card or wallet reference is registered, Nexa stores only business metadata such as brand, last four digits, holder name, label and default preference. Full card numbers are not retained by the portal interface.'],
        ['Credit and collections', 'Credit limits, used amounts, payment periods, due dates and credit status are shared with sales and logistics roles so teams can make consistent commercial and dispatch decisions.'],
        ['Sharing and access', 'Access is limited by role. Buyers see their own company records, sales sees commercial validation data, logistics sees dispatch and risk indicators, and administration manages authorized users and configuration.'],
        ['Retention and security', 'Nexa keeps business records for operational traceability, audit review and customer support. Reasonable technical and organizational controls are applied to protect credentials, account records and commercial information.'],
        ['User rights', 'Authorized company representatives may request corrections to account, delivery, contact or billing metadata through the appropriate sales or support channel. Requests are reviewed according to company policy and applicable law.'],
        ['Contact', 'Questions about privacy, account records or business data handling should be sent through the support page or the assigned sales representative for the client account.'],
      ],
    },
  },
  es: {
    terms: {
      eyebrow: 'Legal',
      badge: 'Documento de terminos',
      title: 'Terminos y Condiciones',
      summary: 'Estos terminos regulan el uso de Nexa como portal B2B para pedidos refrigerados, validacion comercial y coordinacion logistica.',
      noteTitle: 'Alcance del servicio',
      noteHeadline: 'Comercio refrigerado, validacion y despacho trazable',
      noteCopy: 'Nexa conecta compradores, ventas, logistica, documentos y referencias de pago para mover pedidos refrigerados con responsabilidad clara.',
      updated: 'Junio 2026',
      sections: [
        ['Acceso al servicio', 'Nexa brinda acceso por roles a empresas autorizadas, compradores, usuarios de ventas, usuarios logisticos y administradores. Cada usuario debe proteger sus credenciales y usar el portal solo para actividades del cliente asignado.'],
        ['Solicitudes de compra', 'Los productos agregados desde el catalogo generan solicitudes. Una solicitud no es una orden confirmada hasta que ventas valide condiciones comerciales, credito, disponibilidad, direccion de entrega y documentos requeridos.'],
        ['Precios y disponibilidad', 'Los precios, promociones, disponibilidad comercial y requisitos de temperatura pueden cambiar antes de la validacion. Nexa puede ajustar una solicitud por suministro, capacidad de ruta, cadena de frio o acuerdos comerciales.'],
        ['Credito y pagos', 'Las lineas de credito, limites mensuales, referencias de pago y cuotas se usan para apoyar decisiones comerciales. Nexa guarda referencias de pago como metadata de negocio y aplica el estado de credito en validacion y despacho.'],
        ['Ordenes y despacho', 'Las ordenes confirmadas avanzan por preparacion documental, disponibilidad operativa, preparacion de ruta, seguimiento en ruta y evidencia de entrega. Las fechas del timeline reflejan eventos registrados para la orden.'],
        ['Documentos', 'Facturas, guias, evidencias de entrega y archivos relacionados se presentan para coordinacion empresarial. La validez oficial depende de los sistemas emisores, reglas tributarias, evidencia logistica y perfil documental del cliente.'],
        ['Uso aceptable', 'Los usuarios no deben cargar contenido ilicito, suplantar empresas, intentar accesos no autorizados, manipular stock o credito, ni interferir con datos u operaciones de otros clientes.'],
        ['Cambios del servicio', 'Nexa puede actualizar flujos, organizacion del catalogo, controles de credito, canales de soporte e integraciones para mejorar seguridad, trazabilidad y calidad operativa.'],
      ],
    },
    privacy: {
      eyebrow: 'Privacidad',
      badge: 'Documento de privacidad',
      title: 'Politica de Privacidad',
      summary: 'Esta politica explica como Nexa gestiona informacion de cuentas, solicitudes, ordenes, credito y logistica dentro del portal.',
      noteTitle: 'Alcance de datos',
      noteHeadline: 'Datos de negocio para operaciones refrigeradas',
      noteCopy: 'Nexa usa datos de cuenta y transaccion para validar solicitudes, coordinar documentos, gestionar credito y sostener la trazabilidad de entrega.',
      updated: 'Junio 2026',
      sections: [
        ['Informacion que recopilamos', 'Nexa puede guardar identidad empresarial, contacto comprador, identificadores tributarios, direcciones, selecciones de catalogo, comentarios, items de orden, eventos de despacho, documentos, mensajes y metadata de pago.'],
        ['Uso de la informacion', 'La informacion se usa para autenticar usuarios, mostrar catalogo y perfil correcto, validar solicitudes, coordinar credito, preparar documentos, programar despachos, resolver soporte y mejorar reportes operativos.'],
        ['Referencias de pago', 'Cuando se registra una tarjeta o billetera, Nexa guarda solo metadata como marca, ultimos cuatro digitos, titular, etiqueta y preferencia predeterminada. El portal no conserva numeros completos de tarjeta.'],
        ['Credito y cobranzas', 'Limites, uso, periodos, vencimientos y estado de credito se comparten con ventas y logistica para decisiones comerciales y de despacho consistentes.'],
        ['Acceso por roles', 'El comprador ve registros de su empresa, ventas ve datos de validacion comercial, logistica ve despacho e indicadores de riesgo, y administracion gestiona usuarios y configuracion.'],
        ['Retencion y seguridad', 'Nexa mantiene registros empresariales para trazabilidad, auditoria y soporte. Se aplican controles razonables para proteger credenciales, cuentas e informacion comercial.'],
        ['Derechos del usuario', 'Representantes autorizados pueden solicitar correcciones de cuenta, entrega, contacto o facturacion mediante ventas o soporte. Las solicitudes se revisan segun politica de la empresa y ley aplicable.'],
        ['Contacto', 'Las consultas sobre privacidad, registros o manejo de datos deben enviarse desde soporte o al representante comercial asignado a la cuenta.'],
      ],
    },
  },
};

const lang = computed(() => locale.value === 'es' ? 'es' : 'en');
const current = computed(() => documents[lang.value][props.page] || documents[lang.value].terms);
const sideLinks = computed(() => [
  { label: lang.value === 'es' ? 'Terminos de uso' : 'Terms of use', to: '/portal/legal/terms', key: 'terms' },
  { label: lang.value === 'es' ? 'Politica de privacidad' : 'Privacy policy', to: '/portal/legal/privacy', key: 'privacy' },
  { label: lang.value === 'es' ? 'Soporte' : 'Support', to: '/portal/support', key: 'support' },
]);
</script>

<template>
  <div class="legal-page">
    <section class="legal-hero">
      <div class="legal-hero-copy">
        <span class="legal-pill">{{ current.eyebrow }}</span>
        <h1>{{ current.title }}</h1>
        <p>{{ current.summary }}</p>
      </div>
      <aside class="legal-hero-note" aria-label="Legal summary">
        <span>{{ current.noteTitle }}</span>
        <strong>{{ current.noteHeadline }}</strong>
        <p>{{ current.noteCopy }}</p>
      </aside>
    </section>

    <div class="legal-layout">
      <nav class="legal-sidebar" aria-label="Portal legal navigation">
        <button
          v-for="link in sideLinks"
          :key="link.to"
          type="button"
          :class="{ active: link.key === page }"
          @click="router.push(link.to)"
        >
          {{ link.label }}
        </button>
      </nav>

      <main class="legal-content">
        <div class="legal-content-head">
          <span class="status-label">{{ current.badge }}</span>
          <span class="flow-note">Last updated: {{ current.updated }}</span>
        </div>
        <article
          v-for="([title, copy], index) in current.sections"
          :key="title"
          class="legal-section-card"
        >
          <span class="legal-section-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <h2>{{ title }}</h2>
            <p>{{ copy }}</p>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>

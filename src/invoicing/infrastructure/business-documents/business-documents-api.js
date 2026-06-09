import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';
import { baseApi } from '@/shared/infrastructure/base-api';

export class BusinessDocumentsApi {
  constructor() {
    this.documents = new BaseEndpoint('/api/v1/invoices', baseApi, { useCoreBackend: true });
    this.payments = new BaseEndpoint('/api/v1/payments', baseApi, { useCoreBackend: true });
    this.portalTasks = new BaseEndpoint('/api/v1/portal-upload-tasks');
  }

  getDocuments() { return this.documents.getAll(); }
  getInvoices() { return this.documents.getAll().then(invoices => invoices.map(invoice => this.invoiceToDocument(invoice))); }
  getPayments() { return this.payments.getAll(); }
  patchDocument(id, payload) { return this.documents.patch(id, payload); }
  getPortalTasks() { return this.portalTasks.getAll(); }

  invoiceToDocument(invoice = {}) {
    return {
      id: invoice.invoiceNumber || `INV-${invoice.id}`,
      backendId: invoice.id,
      orderId: invoice.orderId,
      clientId: null,
      type: 'invoice',
      label: invoice.invoiceNumber || 'Invoice',
      status: invoice.paymentStatus === 'Paid' ? 'accepted' : 'pending',
      required: true,
      visibleToBuyer: true,
      fileName: `${invoice.invoiceNumber || invoice.id}.pdf`,
      amount: Number(invoice.amount || 0),
      currency: invoice.currency || 'PEN',
      paymentStatus: invoice.paymentStatus,
      paidAt: invoice.paidAt,
      source: 'nexa-platform',
    };
  }
}

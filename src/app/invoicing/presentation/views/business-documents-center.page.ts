import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { BusinessDocumentsStore, REQUIRED_DOCUMENT_TYPES } from '@app/invoicing/application/business-documents.store';
import { BusinessDocument, InvoicingOrder } from '@app/invoicing/domain/model';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

@Component({
  selector: 'nx-business-documents-center',
  imports: [CommonModule, FormsModule, TranslatePipe, NexaIconComponent, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './business-documents-center.page.html',
  styleUrl: './business-documents-center.page.scss',
})
export class BusinessDocumentsCenterPage {
  readonly store = inject(BusinessDocumentsStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  readonly documentTypes = REQUIRED_DOCUMENT_TYPES;
  readonly statuses = ['all', 'pending', 'uploaded', 'ready', 'missing', 'accepted'];
  readonly showForm = signal(false);
  readonly actionError = signal('');
  readonly activeKey = signal('');
  orderId: number | null = null;
  type = 'factura_xml';
  label = '';
  fileName = '';
  visibleToBuyer = false;
  required = true;

  constructor() { this.store.load(); }

  openForm(order?: InvoicingOrder, type = 'factura_xml'): void {
    const selected = order ?? this.store.orders()[0];
    this.orderId = selected?.backendId ?? null;
    this.type = type;
    this.label = this.typeLabel(type);
    this.fileName = `${type.replaceAll('_', '-')}.${type === 'factura_xml' ? 'xml' : 'pdf'}`;
    this.visibleToBuyer = false;
    this.required = true;
    this.actionError.set('');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); this.actionError.set(''); }

  save(): void {
    const order = this.selectedOrder();
    if (!order || !this.label.trim()) { this.actionError.set('businessDocuments.errors.selectOrderClient'); return; }
    this.store.create({
      orderId: order.backendId,
      clientAccountId: order.customerId,
      type: this.type,
      label: this.label,
      visibleToBuyer: this.visibleToBuyer,
      required: this.required,
      fileName: this.fileName,
    }).subscribe({ next: () => this.closeForm(), error: () => this.actionError.set('businessDocuments.errors.action') });
  }

  generate(order: InvoicingOrder, type: string): void {
    const key = `${order.backendId}-${type}`;
    this.activeKey.set(key);
    this.store.generate(order.backendId, type).subscribe({
      next: () => this.activeKey.set(''),
      error: () => { this.activeKey.set(''); this.actionError.set('businessDocuments.errors.generate'); },
    });
  }

  openOrder(order: InvoicingOrder): void {
    const scope = this.router.url.includes('/operations/') ? 'operations' : 'commercial';
    void this.router.navigate([scope, 'business-documents', 'orders', order.backendId]);
  }

  download(document: BusinessDocument): void {
    this.activeKey.set(`download-${document.id}`);
    this.store.download(document.id).subscribe({
      next: (response) => {
        const url = URL.createObjectURL(response.body ?? new Blob());
        const anchor = window.document.createElement('a');
        anchor.href = url;
        anchor.download = document.fileName || `${document.type}.${document.type.endsWith('xml') ? 'xml' : 'pdf'}`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.activeKey.set('');
      },
      error: () => { this.activeKey.set(''); this.actionError.set('businessDocuments.detail.contentUnavailable'); },
    });
  }

  selectedOrder(): InvoicingOrder | null { return this.orderId === null ? null : this.store.orderById(this.orderId); }
  typeLabel(type: string): string { return this.i18n.t(`businessDocuments.types.${type}`); }
  statusLabel(status: string): string { return this.i18n.t(`businessDocuments.status.${status}`); }
  readiness(ready: number): string { return this.i18n.t('businessDocuments.readyCount', { ready, total: REQUIRED_DOCUMENT_TYPES.length }); }
  clientName(id: number): string { return this.store.clientName(id); }
  clientFilterValue(id: string): string { return String(Number(id.replace(/\D/g, ''))); }
  documentStatusClass(status: string): string {
    if (['ready', 'accepted'].includes(status)) return 'badge-green';
    if (status === 'uploaded') return 'badge-blue';
    if (status === 'missing') return 'badge-red';
    return 'badge-amber';
  }
}

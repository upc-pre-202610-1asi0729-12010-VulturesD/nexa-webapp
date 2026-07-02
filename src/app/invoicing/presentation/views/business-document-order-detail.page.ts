import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusinessDocumentsStore, REQUIRED_DOCUMENT_TYPES } from '@app/invoicing/application/business-documents.store';
import { BusinessDocument } from '@app/invoicing/domain/model';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

@Component({
  selector: 'nx-business-document-order-detail',
  imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent, MatButtonModule],
  templateUrl: './business-document-order-detail.page.html',
  styleUrl: './business-document-order-detail.page.scss',
})
export class BusinessDocumentOrderDetailPage {
  readonly store = inject(BusinessDocumentsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  readonly orderId = Number(this.route.snapshot.paramMap.get('orderId'));
  readonly order = computed(() => this.store.orderById(this.orderId));
  readonly rows = computed(() => REQUIRED_DOCUMENT_TYPES.map((type) => ({
    type,
    document: this.store.documentsForOrder(this.orderId).find((item) => item.type === type) ?? null,
  })));
  readonly readyCount = computed(() => this.rows().filter((row) => ['uploaded', 'ready', 'accepted'].includes(row.document?.status ?? '')).length);
  readonly activeKey = signal('');
  readonly actionError = signal('');

  constructor() { this.store.load(); }

  backPath(): string { return this.router.url.includes('/operations/') ? '/operations/business-documents' : '/commercial/business-documents'; }
  typeLabel(type: string): string { return this.i18n.t(`businessDocuments.types.${type}`); }
  statusLabel(status: string): string { return this.i18n.t(`businessDocuments.status.${status}`); }
  productLines(): string { return this.i18n.t('businessDocuments.detail.productLines', { count: this.order()?.items.length ?? 0 }); }

  generate(type: string): void {
    this.activeKey.set(type);
    this.actionError.set('');
    this.store.generate(this.orderId, type).subscribe({
      next: () => this.activeKey.set(''),
      error: () => { this.activeKey.set(''); this.actionError.set('businessDocuments.errors.generate'); },
    });
  }

  download(document: BusinessDocument): void {
    this.activeKey.set(document.type);
    this.store.download(document.id).subscribe({
      next: (response) => {
        const url = URL.createObjectURL(response.body ?? new Blob());
        const anchor = window.document.createElement('a');
        anchor.href = url;
        anchor.download = document.fileName;
        anchor.click();
        URL.revokeObjectURL(url);
        this.activeKey.set('');
      },
      error: () => { this.activeKey.set(''); this.actionError.set('businessDocuments.detail.contentUnavailable'); },
    });
  }

  lineTotal(quantity: number, unitPrice: number, subtotal?: number): number { return Number(subtotal ?? quantity * unitPrice); }
}

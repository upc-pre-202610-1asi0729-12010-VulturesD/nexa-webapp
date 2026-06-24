import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ClientsStore, ClientProfileSnapshot } from '@app/clients/application/clients.store';
import { ClientUpsert } from '@app/clients/domain/model';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-client-profile',
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatSelectModule, TranslatePipe, NexaIconComponent],
  templateUrl: './client-profile.page.html',
  styleUrl: './client-profile.page.scss',
})
export class ClientProfilePage {
  private readonly store = inject(ClientsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly snapshot = signal<ClientProfileSnapshot | null>(null);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly saved = signal(false);
  readonly client = computed(() => this.snapshot()?.client ?? null);
  readonly creditStatusKey = computed(() => `clients.view.readiness.${this.creditStatusKeyPart()}`);
  readonly creditBadge = computed(() => ({
    ok: 'badge-green',
    attention: 'badge-amber',
    document_pending: 'badge-blue',
    blocked: 'badge-red',
    overdue: 'badge-red',
    inactive: 'badge-gray',
  }[this.client()?.monthlyCreditStatus || 'ok'] || 'badge-gray'));

  form: ClientUpsert = this.emptyForm();

  constructor() {
    this.load();
  }

  back(): void { void this.router.navigate(['/clients']); }

  startEdit(): void {
    const client = this.client();
    if (!client) return;
    this.form = this.formFromClient(client);
    this.saveError.set('');
    this.saved.set(false);
    this.editing.set(true);
  }

  cancelEdit(): void {
    const client = this.client();
    if (client) this.form = this.formFromClient(client);
    this.editing.set(false);
    this.saveError.set('');
  }

  save(): void {
    const client = this.client();
    if (!client || !this.form.businessName.trim() || !this.form.taxId.trim()) return;
    this.saving.set(true);
    this.saveError.set('');
    this.saved.set(false);
    this.store.update(client.backendId || client.id, this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.saved.set(true);
        this.load(false);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set(this.i18n.t('clients.profile.saveError'));
      },
    });
  }

  orderLabel(order: ClientProfileSnapshot['orders'][number]): string {
    return order.orderNumber || order.id;
  }

  orderStatus(status: string): string {
    return this.i18n.t(`order.status.${status.toLowerCase()}`);
  }

  documentStatus(status: string): string {
    return this.i18n.t(`businessDocuments.status.${status.toLowerCase()}`);
  }

  private load(showLoading = true): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (showLoading) this.loading.set(true);
    this.loadError.set(false);
    this.store.profile(id).subscribe({
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        this.form = this.formFromClient(snapshot.client);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.loadError.set(true); },
    });
  }

  private creditStatusKeyPart(): string {
    const status = this.client()?.monthlyCreditStatus || 'ok';
    return status === 'document_pending' ? 'documentPending' : status;
  }

  private formFromClient(client: ClientProfileSnapshot['client']): ClientUpsert {
    return {
      code: client.code,
      businessName: client.businessName || client.name,
      commercialName: client.commercialName || client.name,
      taxId: client.taxId || client.ruc || '',
      segment: client.segment || 'B2B',
      contact: client.contact || '',
      contactEmail: client.contactEmail || '',
      phone: client.phone || '',
      deliveryAddress: client.deliveryAddress || client.address || '',
      district: client.district || '',
      province: client.province || '',
      deliveryReference: client.deliveryReference || '',
      documentProfile: client.documentProfile || 'ruc_factura_xml_pdf_guia',
      paymentCondition: client.paymentCondition || client.condition || 'credit_15',
      monthlyCreditLimit: client.monthlyCreditLimit || client.creditLimit || 0,
      monthlyCreditUsed: client.monthlyCreditUsed || client.creditUsed || 0,
      monthlyCreditStatus: client.monthlyCreditStatus || 'ok',
      deliveryPreference: client.deliveryPreference || '',
      portalAccess: client.portalAccess !== false,
      sellerWorkspaceEmail: client.sellerWorkspaceEmail || '',
      status: client.status || 'active',
    };
  }

  private emptyForm(): ClientUpsert {
    return {
      businessName: '', commercialName: '', taxId: '', segment: 'B2B', contact: '', contactEmail: '', phone: '',
      deliveryAddress: '', district: '', province: '', deliveryReference: '', documentProfile: 'ruc_factura_xml_pdf_guia',
      paymentCondition: 'credit_15', monthlyCreditLimit: 0, monthlyCreditUsed: 0, monthlyCreditStatus: 'ok',
      deliveryPreference: '', portalAccess: true, sellerWorkspaceEmail: '', status: 'active',
    };
  }
}

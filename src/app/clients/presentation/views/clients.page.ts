import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ClientsStore } from '@app/clients/application/clients.store';
import { Client, ClientUpsert } from '@app/clients/domain/model';
import { IamStore } from '@app/iam/application/iam.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-clients',
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, TranslatePipe, NexaIconComponent],
  templateUrl: './clients.page.html',
  styleUrl: './clients.page.scss',
})
export class ClientsPage {
  private readonly store = inject(ClientsStore);
  private readonly session = inject(IamStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly clients = signal<Client[]>([]);
  readonly showCreate = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly activeCount = computed(() => this.clients().filter((client) => client.status === 'active').length);
  readonly creditRiskCount = computed(() => this.clients().filter((client) => !['ok', 'active'].includes(client.monthlyCreditStatus || 'ok')).length);
  form: ClientUpsert = this.emptyForm();

  constructor() { this.load(); }

  openCreate(): void {
    this.form = this.emptyForm();
    this.form.sellerWorkspaceEmail = this.workspaceSellerEmail(this.form.contact || this.form.commercialName || this.form.businessName);
    this.saveError.set('');
    this.showCreate.set(true);
  }

  cancelCreate(): void { this.showCreate.set(false); this.saveError.set(''); }
  openProfile(client: Client): void { void this.router.navigate(['/clients', client.id]); }

  generateFormSellerEmail(): void {
    this.form.sellerWorkspaceEmail = this.workspaceSellerEmail(this.form.contact || this.form.commercialName || this.form.businessName);
  }

  create(): void {
    if (!this.form.businessName.trim() || !this.form.taxId.trim()) return;
    this.saving.set(true);
    this.saveError.set('');
    this.store.create(this.form).subscribe({
      next: () => { this.saving.set(false); this.showCreate.set(false); this.load(false); },
      error: () => { this.saving.set(false); this.saveError.set(this.i18n.t('clients.view.errors.save')); },
    });
  }

  toggleCreditHold(client: Client): void {
    const blocked = ['blocked', 'overdue'].includes(client.monthlyCreditStatus || '');
    this.updateStatus(client, blocked ? 'ok' : 'blocked');
  }

  markDocumentPending(client: Client): void { this.updateStatus(client, 'document_pending'); }

  creditBadge(client: Client): string {
    return { ok: 'badge-green', attention: 'badge-amber', document_pending: 'badge-blue', blocked: 'badge-red', overdue: 'badge-red', inactive: 'badge-gray' }[client.monthlyCreditStatus || 'ok'] || 'badge-gray';
  }

  creditStatus(client: Client): string {
    const status = client.monthlyCreditStatus === 'document_pending' ? 'documentPending' : (client.monthlyCreditStatus || 'ok');
    return this.i18n.t(`clients.view.readiness.${status}`);
  }

  paymentCondition(client: Client): string {
    const key = { cash: 'cash', credit_7: 'credit7', credit_15: 'credit15', credit_30: 'credit30' }[client.paymentCondition || client.condition || ''];
    return key === 'credit7' ? this.i18n.t('clients.profile.credit7') : key ? this.i18n.t(`clients.view.payment.${key}`) : (client.paymentCondition || client.condition || '');
  }

  workspaceSellerEmail(value: string): string {
    const domain = this.session.user()?.email.split('@')[1] || '';
    if (!domain) return '';
    const local = (value || 'cliente').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 34) || 'cliente';
    return `${local}@${domain}`;
  }

  private updateStatus(client: Client, monthlyCreditStatus: string): void {
    this.saveError.set('');
    this.store.update(client.backendId || client.id, { ...this.resource(client), monthlyCreditStatus }).subscribe({
      next: () => this.load(false),
      error: () => this.saveError.set(this.i18n.t('clients.view.errors.creditStatus')),
    });
  }

  private load(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.store.list().subscribe({
      next: (data) => { this.clients.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.saveError.set(this.i18n.t('clients.view.errors.load')); },
    });
  }

  private resource(client: Client): ClientUpsert {
    return {
      code: client.code,
      businessName: client.businessName || client.name,
      commercialName: client.commercialName || client.name,
      taxId: client.taxId || client.ruc || '',
      segment: client.segment || 'B2B', contact: client.contact || '', contactEmail: client.contactEmail || '', phone: client.phone || '',
      deliveryAddress: client.deliveryAddress || client.address || '', district: client.district || '', province: client.province || '',
      deliveryReference: client.deliveryReference || '', documentProfile: client.documentProfile || 'ruc_factura_xml_pdf_guia',
      paymentCondition: client.paymentCondition || client.condition || 'credit_15', monthlyCreditLimit: client.monthlyCreditLimit || client.creditLimit || 0,
      monthlyCreditUsed: client.monthlyCreditUsed || client.creditUsed || 0, monthlyCreditStatus: client.monthlyCreditStatus || 'ok',
      deliveryPreference: client.deliveryPreference || '', portalAccess: client.portalAccess !== false,
      sellerWorkspaceEmail: client.sellerWorkspaceEmail || '', status: client.status || 'active',
    };
  }

  private emptyForm(): ClientUpsert {
    return {
      businessName: '', commercialName: '', taxId: '', segment: 'Gourmet / refrigerated', contact: '', contactEmail: '', phone: '',
      deliveryAddress: '', district: '', province: '', deliveryReference: '', documentProfile: 'ruc_factura_xml_pdf_guia',
      paymentCondition: 'credit_15', monthlyCreditLimit: 15000, monthlyCreditUsed: 0, monthlyCreditStatus: 'ok',
      deliveryPreference: 'Morning cold-chain window', portalAccess: true, sellerWorkspaceEmail: '', status: 'active',
    };
  }
}

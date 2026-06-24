import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { Client, ClientFinancialProfile, ClientUpsert } from '@app/clients/domain/model';

interface PlatformCustomerResponse {
  id: number;
  tenantId: number;
  code: string;
  businessName: string;
  commercialName: string;
  taxId: string;
  ruc: string;
  segment: string;
  contact: string;
  contactEmail: string;
  phone: string;
  deliveryAddress: string;
  address: string;
  district: string;
  province: string;
  deliveryReference: string;
  documentProfile: string;
  paymentCondition: string;
  monthlyCreditLimit: number;
  monthlyCreditUsed: number;
  monthlyCreditAvailable: number;
  monthlyCreditStatus: string;
  deliveryPreference: string;
  portalAccess: boolean;
  sellerWorkspaceEmail: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<PlatformCustomerResponse[]>('api/v1/client-accounts').pipe(
      catchError(() => this.http.get<PlatformCustomerResponse[]>('api/v1/customers')),
      map((items) => items.map((item) => this.fromPlatformCustomer(item))),
    );
  }

  get(id: string | number) {
    return this.http.get<PlatformCustomerResponse>(`api/v1/client-accounts/${this.backendId(id)}`).pipe(
      map((item) => this.fromPlatformCustomer(item)),
    );
  }

  financialProfile(id: string | number) {
    return this.http.get<ClientFinancialProfile>(`api/v1/client-accounts/${this.backendId(id)}/financial-profile`);
  }

  create(resource: ClientUpsert) {
    return this.http.post<PlatformCustomerResponse>('api/v1/client-accounts', resource).pipe(
      map((item) => this.fromPlatformCustomer(item)),
    );
  }

  update(id: string | number, resource: ClientUpsert) {
    return this.http.patch<PlatformCustomerResponse>(`api/v1/client-accounts/${this.backendId(id)}`, resource).pipe(
      map((item) => this.fromPlatformCustomer(item)),
    );
  }

  private fromPlatformCustomer(item: PlatformCustomerResponse): Client {
    return {
      id: item.code || this.customerId(item.id),
      backendId: item.id,
      tenantId: item.tenantId,
      code: item.code || this.customerId(item.id),
      name: item.commercialName || item.businessName,
      businessName: item.businessName,
      commercialName: item.commercialName || item.businessName,
      ruc: item.ruc || item.taxId,
      taxId: item.taxId || item.ruc,
      segment: item.segment || 'B2B',
      contact: item.contact || '',
      contactEmail: item.contactEmail || '',
      phone: item.phone || '',
      address: item.address || item.deliveryAddress || '',
      deliveryAddress: item.deliveryAddress || item.address || '',
      district: item.district || '',
      province: item.province || '',
      deliveryReference: item.deliveryReference || '',
      documentProfile: item.documentProfile || '',
      condition: item.paymentCondition || 'credit_15',
      paymentCondition: item.paymentCondition || 'credit_15',
      creditLimit: Number(item.monthlyCreditLimit || 0),
      creditUsed: Number(item.monthlyCreditUsed || 0),
      monthlyCreditLimit: Number(item.monthlyCreditLimit || 0),
      monthlyCreditUsed: Number(item.monthlyCreditUsed || 0),
      monthlyCreditAvailable: Number(item.monthlyCreditAvailable || 0),
      monthlyCreditStatus: item.monthlyCreditStatus || 'ok',
      deliveryPreference: item.deliveryPreference || '',
      portalAccess: item.portalAccess !== false,
      sellerWorkspaceEmail: item.sellerWorkspaceEmail || '',
      status: item.status || 'active',
      type: item.segment || 'B2B',
    };
  }

  private backendId(id: string | number): number {
    if (typeof id === 'number') return id;
    const numeric = Number(id.replace(/\D/g, ''));
    if (!numeric) throw new Error('Client account id is invalid.');
    return numeric;
  }

  private customerId(id: number): string {
    return `CLI-${String(id).padStart(3, '0')}`;
  }
}

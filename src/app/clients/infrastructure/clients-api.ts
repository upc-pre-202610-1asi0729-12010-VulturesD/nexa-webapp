import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { Client } from '@app/clients/domain/model';

interface PlatformCustomerResponse {
  id: number | string;
  businessName: string;
  taxId?: string;
  contactEmail?: string;
  deliveryAddress?: string;
}

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<PlatformCustomerResponse[]>('api/v1/customers').pipe(
        map((items) => items.map((item) => this.fromPlatformCustomer(item))),
        catchError(() => this.http.get<Client[]>('api/v1/clients')),
    );
  }

  private fromPlatformCustomer(item: PlatformCustomerResponse): Client {
    return {
      id: this.customerId(item.id),
      name: item.businessName,
      ruc: item.taxId,
      contact: item.contactEmail,
      address: item.deliveryAddress,
      condition: 'credit',
      status: 'active',
      type: 'B2B',
      creditLimit: 0,
      creditUsed: 0,
    };
  }

  private customerId(id: number | string): string {
    if (typeof id === 'number') return `CLI-${String(id).padStart(3, '0')}`;
    if (/^\d+$/.test(id)) return `CLI-${id.padStart(3, '0')}`;
    return id;
  }
}

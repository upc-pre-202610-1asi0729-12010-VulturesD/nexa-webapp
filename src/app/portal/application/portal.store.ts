import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { BuyerRequest, PortalSnapshot } from '@app/portal/domain/model';
import { PortalApi, SubmitBuyerRequestPayload } from '@app/portal/infrastructure/portal-api';

@Injectable({ providedIn: 'root' })
export class PortalStore {
  private readonly api = inject(PortalApi);

  getDepartments() { return this.api.getDepartments(); }
  getProvinces() { return this.api.getProvinces(); }
  getDistricts() { return this.api.getDistricts(); }

  load(clientId: string): Observable<PortalSnapshot> {

    return this.api.load(clientId);
  }

  submitPurchaseRequest(payload: SubmitBuyerRequestPayload): Observable<BuyerRequest> {
    return this.api.submitPurchaseRequest(payload);
  }

  updateBuyerClient(client: Client): Observable<Client> {
    return this.api.updateBuyerClient(client);
  }

  downloadDocument(id: string) { return this.api.downloadDocument(id); }
  setDefaultPaymentMethod(id: string) { return this.api.setDefaultPaymentMethod(id); }
  addPaymentMethod(clientId: string, type: string, label: string, isDefault: boolean) {
    return this.api.addPaymentMethod(clientId, type, label, isDefault);
  }
  prepareStripeCheckout(payment: import('@app/portal/domain/model').BuyerPaymentRecord) {
    return this.api.prepareStripeCheckout(payment);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Alert, ActivityEntry, BusinessDocument, Promotion } from '@app/dashboard/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { Dispatch, ProofOfDelivery } from '@app/dispatch/domain/model';
import { Client } from '@app/clients/domain/model';
import { InventoryLot } from '@app/inventory/domain/model';
import { ProductsApi } from '@app/catalog/infrastructure/products-api';
import { ClientsApi } from '@app/clients/infrastructure/clients-api';
import { InvoicingApi } from '@app/invoicing/infrastructure/invoicing-api';
import { InventoryApi } from '@app/inventory/infrastructure/inventory-api';
import { BusinessDocument as InvoicingBusinessDocument } from '@app/invoicing/domain/model';

interface AuditLogResponse {
  id: number;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
}

interface InventoryAlertResponse {
  id: number;
  productSku: string;
  productName: string;
  quantityAvailable: number;
  reorderPoint: number;
  lowStock: boolean;
}

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);
  private readonly productsApi = inject(ProductsApi);
  private readonly clientsApi = inject(ClientsApi);
  private readonly invoicingApi = inject(InvoicingApi);
  private readonly inventoryApi = inject(InventoryApi);

  alerts() {
    return this.http.get<InventoryAlertResponse[]>('api/v1/inventory/alerts').pipe(
      map((items) => items.map((item) => this.fromInventoryAlert(item))),
    );
  }

  activity() {
    return this.http.get<AuditLogResponse[]>('api/v1/audit-logs').pipe(
      map((items) => items.map((item) => this.fromAuditLog(item))),
    );
  }

  orders() { return this.getResource<Order[]>('orders'); }
  products() { return this.productsApi.list(); }
  dispatches() { return this.getResource<Dispatch[]>('dispatch-orders'); }
  proofsOfDelivery() { return this.getResource<ProofOfDelivery[]>('proof-of-delivery-records'); }
  clients() { return this.clientsApi.list(); }
  lots() { return this.inventoryApi.lots(); }
  businessDocuments() {
    return this.invoicingApi.documents().pipe(
      map((items) => items.map((item) => this.fromBusinessDocument(item))),
    );
  }
  promotions() { return this.getResource<Promotion[]>('promotions'); }
  createPromotion(payload: any) { return this.http.post<Promotion>('api/v1/promotions', payload); }

  private getResource<T>(resource: string) {
    return this.http.get<T>(`api/v1/${resource}`);
  }

  private fromInventoryAlert(item: InventoryAlertResponse): Alert {
    return {
      id: `INV-${item.id}`,
      type: item.lowStock ? 'warning' : 'info',
      priority: item.lowStock ? 2 : 3,
      title: item.lowStock ? `Low stock - ${item.productName}` : `Inventory check - ${item.productName}`,
      desc: `${item.productSku}: ${item.quantityAvailable} available / reorder point ${item.reorderPoint}`,
      action: 'View stock',
      screen: 'inventory',
    };
  }

  private fromAuditLog(item: AuditLogResponse): ActivityEntry {
    return {
      id: String(item.id),
      time: this.timeLabel(item.createdAt),
      text: `${item.action} ${item.resourceType} ${item.resourceId}`,
      type: this.activityType(item.action),
    };
  }

  private fromBusinessDocument(item: InvoicingBusinessDocument): BusinessDocument {
    return {
      id: String(item.id),
      clientId: item.clientAccountId == null ? '' : String(item.clientAccountId),
      orderId: item.orderId == null ? '' : String(item.orderId),
      type: item.type,
      label: item.label,
      fileName: item.fileName,
      status: item.status,
      visibleToBuyer: item.visibleToBuyer,
      required: item.required,
      dueDate: item.updatedAt || item.createdAt,
      amount: 0,
    };
  }

  private timeLabel(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private activityType(action: string): string {
    const normalized = action.toLowerCase();
    if (normalized.includes('reject') || normalized.includes('delete') || normalized.includes('cancel')) return 'danger';
    if (normalized.includes('approve') || normalized.includes('confirm') || normalized.includes('create')) return 'success';
    if (normalized.includes('update') || normalized.includes('change')) return 'warning';
    return 'info';
  }
}

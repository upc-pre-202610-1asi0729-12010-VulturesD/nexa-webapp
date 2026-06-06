import { Order } from '@/sales/domain/model/entities/purchase-order.entity';
import { OrderResource } from './purchase-order.resource';

const fallbackOrderDate = '2026-06-06';

const normalizeStatus = (status = 'validating') => {
  const normalized = String(status)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();

  return {
    pending: 'pending',
    confirmed: 'confirmed',
    rejected: 'rejected',
    cancelled: 'cancelled',
    canceled: 'cancelled',
  }[normalized] || normalized;
};

const catalogItemIdFor = (productId = '') => {
  const match = String(productId).match(/^PROD-(\d+)$/);
  return match ? `CAT-${match[1]}` : productId;
};

const normalizeBackendOrderItem = (item = {}) => ({
  id: item.id ? `OI-${String(item.id).padStart(3, '0')}` : item.productId,
  backendId: item.id,
  productId: item.productId,
  catalogItemId: item.catalogItemId,
  itemName: item.itemName,
  qty: Number(item.quantity ?? item.qty ?? 0),
  quantity: Number(item.quantity ?? item.qty ?? 0),
  price: Number(item.unitPriceAmount ?? item.price ?? 0),
  unitPriceAmount: Number(item.unitPriceAmount ?? item.price ?? 0),
  unitPriceCurrency: item.unitPriceCurrency || item.currency || 'PEN',
  subtotal: Number(item.subtotalAmount ?? item.subtotal ?? 0),
  subtotalCurrency: item.subtotalCurrency || item.unitPriceCurrency || 'PEN',
  stockOk: true,
});

const normalizeBackendOrder = (resource = {}) => {
  if (!resource.orderNumber) return resource;

  return {
    id: resource.orderNumber,
    backendId: resource.id,
    code: resource.orderNumber,
    clientId: resource.customerId,
    customerName: resource.customerName,
    status: normalizeStatus(resource.status),
    priority: 'medium',
    date: resource.confirmedAt?.slice?.(0, 10) || resource.date || fallbackOrderDate,
    currency: resource.totalCurrency || 'PEN',
    items: (resource.items || []).map(normalizeBackendOrderItem),
    total: Number(resource.totalAmount ?? 0),
    notes: resource.rejectionReason || '',
    paymentConfirmation: resource.paymentConfirmation,
    inventoryReservation: resource.inventoryReservation,
    rejectionReason: resource.rejectionReason,
    confirmedAt: resource.confirmedAt,
    source: 'nexa-platform',
  };
};

const normalizeCreateOrderItem = (item = {}) => ({
  productId: item.productId,
  catalogItemId: item.catalogItemId || catalogItemIdFor(item.productId),
  itemName: item.itemName || item.name || item.productName || item.productId,
  quantity: Number(item.quantity ?? item.qty ?? 1),
  unitPriceAmount: Number(item.unitPriceAmount ?? item.price ?? 0),
  unitPriceCurrency: item.unitPriceCurrency || item.currency || 'PEN',
});

export const OrderAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new Order(normalizeBackendOrder(resource));
  },

  toResource(entity) {
    if (!entity) return null;
    return new OrderResource({
      id: entity.id,
      backendId: entity.backendId,
      code: entity.code,
      clientId: entity.clientId,
      status: entity.status.value,
      priority: entity.priority,
      date: entity.date,
      items: entity.items.map(item => ({
        productId: item.productId,
        catalogItemId: item.catalogItemId,
        itemName: item.itemName,
        qty: item.qty,
        quantity: item.qty,
        price: item.price,
        unitPriceAmount: item.price,
        unitPriceCurrency: item.unitPriceCurrency,
        subtotal: item.subtotal || item.lineTotal(),
        stockOk: item.stockOk,
      })),
      total: entity.total,
      currency: entity.currency,
      notes: entity.notes,
      paymentConfirmation: entity.paymentConfirmation,
      inventoryReservation: entity.inventoryReservation,
      rejectionReason: entity.rejectionReason,
      confirmedAt: entity.confirmedAt,
    });
  },

  toCreateResource(order = {}) {
    const source = order instanceof Order ? this.toResource(order) : order;

    return {
      orderNumber: source.orderNumber || source.code || source.id,
      customerId: source.customerId || source.clientId,
      items: (source.items || []).map(normalizeCreateOrderItem),
    };
  },
};

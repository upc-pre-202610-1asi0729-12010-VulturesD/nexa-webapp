import { defineStore } from 'pinia';
import { ref } from 'vue';
import { purchaseOrdersApplication } from '@/purchase-orders/application/purchase-orders.application';
import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

const endpoints = {
  tenants: '/api/v1/tenants',
  subscriptions: '/api/v1/subscriptions',
  roles: '/api/v1/roles',
  users: '/api/v1/users',
  clients: '/api/v1/clients',
  clientContacts: '/api/v1/client-contacts',
  deliveryAddresses: '/api/v1/delivery-addresses',
  orders: '/api/v1/orders',
  products: '/api/v1/products',
  categories: '/api/v1/categories',
  productImages: '/api/v1/product-images',
  priceLists: '/api/v1/price-lists',
  promotions: '/api/v1/promotions',
  warehouses: '/api/v1/warehouses',
  inventoryLots: '/api/v1/inventory-lots',
  stockMovements: '/api/v1/stock-movements',
  availabilitySnapshots: '/api/v1/availability-snapshots',
  purchaseRequests: '/api/v1/purchase-requests',
  requestItems: '/api/v1/request-items',
  purchaseOrders: '/api/v1/purchase-orders',
  orderItems: '/api/v1/order-items',
  orderTimelineEvents: '/api/v1/order-timeline-events',
  businessDocuments: '/api/v1/business-documents',
  customerPortals: '/api/v1/customer-portals',
  portalRequirements: '/api/v1/portal-requirements',
  portalUploadTasks: '/api/v1/portal-upload-tasks',
  dispatchOrders: '/api/v1/dispatch-orders',
  dispatchItems: '/api/v1/dispatch-items',
  deliveryEvents: '/api/v1/delivery-events',
  proofOfDelivery: '/api/v1/proof-of-delivery',
  chatThreads: '/api/v1/chat-threads',
  messages: '/api/v1/messages',
  notifications: '/api/v1/notifications',
  temperatureLogs: '/api/v1/temperature-logs',
  alerts: '/api/v1/alerts',
  activityLog: '/api/v1/activity-log',
};

const api = Object.fromEntries(
  Object.entries(endpoints).map(([key, path]) => [key, new BaseEndpoint(path)])
);

/**
 * Central store for runtime data.
 * Loads business data from the configured Fake API, with local server fallback in shared infrastructure.
 */
export const useDataStore = defineStore('data', () => {
  const D = ref({
    company:   { id: '', name: '', legalName: '', ruc: '', address: '', country: '', subscriptionPlan: 'standard' },
    user:      { name: '', role: '', initials: '', email: '' },
    tenants: [],
    subscriptions: [],
    roles: [],
    users: [],
    warehouses: [],
    products:  [],
    categories: [],
    productImages: [],
    priceLists: [],
    promotions: [],
    lots:      [],
    inventoryLots: [],
    movements: [],
    stockMovements: [],
    availabilitySnapshots: [],
    clients:   [],
    clientContacts: [],
    deliveryAddresses: [],
    orders:    [],
    purchaseRequests: [],
    requestItems: [],
    purchaseOrders: [],
    orderItems: [],
    orderTimelineEvents: [],
    businessDocuments: [],
    customerPortals: [],
    portalRequirements: [],
    portalUploadTasks: [],
    dispatchOrders: [],
    dispatchItems: [],
    deliveryEvents: [],
    proofOfDelivery: [],
    chatThreads: [],
    messages: [],
    notifications: [],
    temperatureLogs: [],
    alerts:    [],
    activity:  [],
    activityLog: [],
  });

  function clientName(id)  {
    const client = D.value.clients.find(c => c.id === id) || {};
    return client.commercialName || client.name || client.businessName || id;
  }
  function productName(id) { return (D.value.products.find(p => p.id === id) || {}).name || id; }
  function productById(id) { return D.value.products.find(p => p.id === id); }
  function clientById(id)  { return D.value.clients.find(c => c.id === id); }
  function orderById(id)   { return D.value.orders.find(o => o.id === id) || D.value.purchaseOrders.find(o => o.id === id || o.code === id); }
  function purchaseRequestById(id) { return D.value.purchaseRequests.find(r => r.id === id || r.code === id); }
  function purchaseOrderById(id) { return D.value.purchaseOrders.find(o => o.id === id || o.code === id); }
  function dispatchOrderById(id) { return D.value.dispatchOrders.find(d => d.id === id || d.code === id); }
  function deliveryAddressById(id) { return D.value.deliveryAddresses.find(a => a.id === id); }
  function contactByClientId(clientId) { return D.value.clientContacts.find(c => c.clientId === clientId && c.isPrimary) || D.value.clientContacts.find(c => c.clientId === clientId); }
  function requestItemsFor(requestId) { return D.value.requestItems.filter(item => item.purchaseRequestId === requestId); }
  function orderItemsFor(orderId) { return D.value.orderItems.filter(item => item.orderId === orderId); }
  function documentsForOrder(orderId) { return D.value.businessDocuments.filter(doc => doc.orderId === orderId); }
  function portalForClient(clientId) { return D.value.customerPortals.find(portal => portal.clientId === clientId); }
  function portalRequirementsForClient(clientId) {
    return D.value.portalRequirements.find(item => item.clientId === clientId);
  }
  function uploadTaskForOrder(orderId) { return D.value.portalUploadTasks.find(task => task.orderId === orderId); }
  function dispatchForOrder(orderId) { return D.value.dispatchOrders.find(dispatch => dispatch.orderId === orderId); }
  function timelineForOrder(orderId) { return D.value.orderTimelineEvents.filter(event => event.orderId === orderId); }
  function messagesForRequest(requestId) {
    return D.value.messages.filter(message =>
      message.requestId === requestId || message.purchaseRequestId === requestId
    );
  }
  function messagesForOrder(orderId) { return D.value.messages.filter(message => message.orderId === orderId); }
  function temperatureForOrder(orderId) { return D.value.temperatureLogs.filter(log => log.orderId === orderId); }
  function promotionsForProduct(productId) {
    return D.value.promotions.filter(promo =>
      promo.status === 'active' && (promo.productIds || []).includes(productId)
    );
  }

  function nextOrderId() {
    const nums = [...D.value.orders, ...D.value.purchaseOrders]
      .map(o => parseInt((o.id || o.code || '').split('-').pop(), 10))
      .filter(n => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 412;
    return `ORD-2026-${String(max + 1).padStart(4, '0')}`;
  }

  function nextCode(prefix, collection, width = 4) {
    const nums = collection
      .map(item => parseInt(String(item.id || item.code || '').split('-').pop(), 10))
      .filter(n => !Number.isNaN(n));
    return `${prefix}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(width, '0')}`;
  }

  function addOrder(order) {
    D.value.orders.unshift(order);
    purchaseOrdersApplication.createOrder(order).catch(() => {});
    if (!D.value.purchaseOrders.some(item => item.id === order.id)) {
      const purchaseOrder = {
        id: order.id,
        code: order.id,
        requestId: null,
        clientId: order.clientId,
        status: order.status,
        commercialOwnerId: order.createdBy || 'USR-001',
        operationsOwnerId: 'USR-002',
        documentStatus: 'pending',
        dispatchStatus: order.status,
        paymentCondition: clientById(order.clientId)?.paymentCondition || clientById(order.clientId)?.condition || 'cash',
        totalEstimatedWeightKg: (order.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0),
        total: order.total,
        priority: order.priority,
        createdAt: `${order.date || new Date().toISOString().slice(0, 10)}T12:00:00Z`,
        requestedDeliveryDate: order.date,
        deliveryAddressId: null,
      };
      D.value.purchaseOrders.unshift(purchaseOrder);
      D.value.orderItems.unshift(...(order.items || []).map((item, index) => ({
        id: nextCode('OI', D.value.orderItems.concat((order.items || []).slice(0, index)), 3),
        orderId: order.id,
        productId: item.productId,
        quantity: item.qty,
        unit: productById(item.productId)?.unit,
        price: item.price,
        estimatedWeightKg: item.qty,
        stockOk: item.stockOk,
      })));
      createResource('purchaseOrders', purchaseOrder);
      createDispatchForOrder(purchaseOrder);
      createDocumentChecklistForOrder(purchaseOrder);
    }
  }

  function patchResource(key, id, payload) {
    api[key]?.patch(id, payload).catch(() => {});
  }

  function createResource(key, payload) {
    api[key]?.create(payload).catch(() => {});
  }

  function addActivity(text, type = 'info') {
    const entry = {
      id: nextCode('ACT', D.value.activityLog, 3),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      text,
      type,
    };
    D.value.activityLog.unshift(entry);
    D.value.activity = D.value.activityLog;
    createResource('activityLog', entry);
  }

  function addPurchaseRequest({ clientId, buyerUserId, deliveryAddressId, requestedDeliveryDate, comments, items = [] }) {
    const id = nextCode('REQ-2026', D.value.purchaseRequests, 4);
    const request = {
      id,
      code: id,
      tenantId: D.value.company.id || 'TEN-001',
      clientId,
      buyerUserId,
      createdByRole: buyerUserId ? 'buyer' : 'commercial',
      status: 'submitted',
      priority: 'normal',
      requestedDeliveryDate,
      deliveryAddressId,
      comments: comments || '',
      commercialOwnerId: 'USR-001',
      documentProfile: clientById(clientId)?.documentProfile || 'standard_docs',
      createdAt: new Date().toISOString(),
    };
    const requestItems = items.map((item, index) => ({
      id: nextCode('RI', D.value.requestItems.concat(items.slice(0, index)), 3),
      purchaseRequestId: id,
      productId: item.productId,
      quantity: Number(item.qty || item.quantity || 1),
      unit: item.unit,
      estimatedWeightKg: Number(item.estimatedWeightKg || item.qty || item.quantity || 1),
      notes: item.notes || '',
    }));
    D.value.purchaseRequests.unshift(request);
    D.value.requestItems.unshift(...requestItems);
    createResource('purchaseRequests', request);
    requestItems.forEach(item => createResource('requestItems', item));
    addActivity(`${id} submitted from Buyer Portal - ${clientName(clientId)}`, 'info');
    return request;
  }

  function updateRequestStatus(requestId, status) {
    const request = purchaseRequestById(requestId);
    if (!request) return null;
    request.status = status;
    patchResource('purchaseRequests', request.id, { status });
    addActivity(`${request.id} updated to ${status}`, status === 'approved' ? 'success' : 'warning');
    return request;
  }

  function addMessage({
    requestId = null,
    purchaseRequestId = null,
    orderId = null,
    senderRole = 'commercial',
    senderName = 'Valeria Sanchez',
    body,
    visibleToCommercial = true,
    visibleToBuyer = true,
  }) {
    const normalizedRequestId = requestId || purchaseRequestId;
    const thread = D.value.chatThreads.find(item =>
      (normalizedRequestId && (item.requestId === normalizedRequestId || item.purchaseRequestId === normalizedRequestId)) || (orderId && item.orderId === orderId)
    );
    const message = {
      id: nextCode('MSG', D.value.messages, 3),
      threadId: thread?.id || nextCode('TH', D.value.chatThreads, 3),
      requestId: normalizedRequestId,
      purchaseRequestId: normalizedRequestId,
      orderId,
      senderRole,
      senderName,
      body,
      createdAt: new Date().toISOString(),
      visibleToCommercial,
      visibleToBuyer,
    };
    if (!thread) {
      const newThread = {
        id: message.threadId,
        requestId: normalizedRequestId,
        purchaseRequestId: normalizedRequestId,
        orderId,
        clientId: normalizedRequestId ? purchaseRequestById(normalizedRequestId)?.clientId : purchaseOrderById(orderId)?.clientId,
        title: normalizedRequestId || orderId,
        status: 'open',
      };
      D.value.chatThreads.push(newThread);
      createResource('chatThreads', newThread);
    }
    D.value.messages.push(message);
    createResource('messages', message);
    return message;
  }

  function convertRequestToOrder(requestId) {
    const request = purchaseRequestById(requestId);
    if (!request) return null;
    if (request.convertedOrderId) return purchaseOrderById(request.convertedOrderId);

    const items = requestItemsFor(request.id);
    const orderId = nextOrderId();
    const orderItems = items.map((item, index) => {
      const product = productById(item.productId) || {};
      return {
        id: nextCode('OI', D.value.orderItems.concat(items.slice(0, index)), 3),
        orderId,
        productId: item.productId,
        quantity: Number(item.quantity || 1),
        unit: item.unit || product.unit,
        price: Number(product.price || 0),
        estimatedWeightKg: Number(item.estimatedWeightKg || item.quantity || 0),
        stockOk: (product.stock || 0) - (product.reserved || 0) >= Number(item.quantity || 1),
      };
    });
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
      id: orderId,
      code: orderId,
      requestId: request.id,
      clientId: request.clientId,
      status: 'ready_for_dispatch',
      commercialOwnerId: 'USR-001',
      operationsOwnerId: 'USR-002',
      documentStatus: 'pending',
      dispatchStatus: 'ready_for_operations',
      paymentCondition: clientById(request.clientId)?.paymentCondition || clientById(request.clientId)?.condition || 'cash',
      totalEstimatedWeightKg: orderItems.reduce((sum, item) => sum + (item.estimatedWeightKg || 0), 0),
      total,
      priority: request.priority,
      createdAt: new Date().toISOString(),
      requestedDeliveryDate: request.requestedDeliveryDate,
      deliveryAddressId: request.deliveryAddressId,
    };
    request.status = 'converted_to_order';
    request.convertedOrderId = orderId;
    D.value.purchaseOrders.unshift(order);
    D.value.orderItems.unshift(...orderItems);
    patchResource('purchaseRequests', request.id, { status: request.status, convertedOrderId: orderId });
    createResource('purchaseOrders', order);
    orderItems.forEach(item => createResource('orderItems', item));
    createDispatchForOrder(order);
    createDocumentChecklistForOrder(order);
    applyMonthlyCreditUsage(order.clientId, total);
    const base = new Date(order.createdAt);
    const minutesBefore = (minutes) => new Date(base.getTime() - minutes * 60000).toISOString();
    addTimelineEvent(orderId, 'submitted', 'Request received from Buyer Portal', true, request.createdAt || minutesBefore(4));
    addTimelineEvent(orderId, 'validating', 'Commercial validation completed by S1', true, minutesBefore(3));
    addTimelineEvent(orderId, 'confirmed', 'Purchase order confirmed and sent to operations', true, minutesBefore(2));
    addTimelineEvent(orderId, 'document_pending', 'Business documents pending preparation', true, minutesBefore(1));
    addTimelineEvent(orderId, 'ready_for_dispatch', 'Ready for operations', true, order.createdAt);
    addActivity(`${request.id} converted to ${orderId}`, 'success');
    return order;
  }

  function applyMonthlyCreditUsage(clientId, amount) {
    const client = clientById(clientId);
    if (!client) return null;
    const limit = Number(client.monthlyCreditLimit ?? client.creditLimit ?? 0);
    if (!limit) return client;
    const used = Number(client.monthlyCreditUsed ?? client.creditUsed ?? 0) + Number(amount || 0);
    const available = Math.max(0, limit - used);
    const status = used >= limit ? 'blocked' : used / limit >= 0.85 ? 'attention' : 'ok';
    Object.assign(client, {
      creditLimit: limit,
      creditUsed: used,
      creditStatus: status,
      monthlyCreditLimit: limit,
      monthlyCreditUsed: used,
      monthlyCreditAvailable: available,
      monthlyCreditStatus: status,
    });
    patchResource('clients', client.id, {
      creditUsed: used,
      creditStatus: status,
      monthlyCreditUsed: used,
      monthlyCreditAvailable: available,
      monthlyCreditStatus: status,
    });
    return client;
  }

  function createDocumentChecklistForOrder(order) {
    const existing = documentsForOrder(order.id);
    if (existing.length) return existing;
    const requirements = portalRequirementsForClient(order.clientId)?.requiredDocumentTypes || ['invoice_pdf', 'guide_pdf', 'pod'];
    const all = [
      ['invoice_pdf', 'Invoice PDF'],
      ['invoice_xml', 'Invoice XML'],
      ['guide_pdf', 'Guide PDF'],
      ['guide_xml', 'Guide XML'],
      ['cdr', 'CDR'],
      ['pod', 'POD'],
      ['external_portal_receipt', 'External portal receipt'],
    ];
    const docs = all.map(([type, label], index) => ({
      id: nextCode('DOC', D.value.businessDocuments.concat(all.slice(0, index)), 3),
      orderId: order.id,
      clientId: order.clientId,
      type,
      label,
      status: requirements.includes(type) ? 'pending' : 'not_required',
      required: requirements.includes(type),
      visibleToBuyer: false,
      fileName: `${order.id}-${type}.pdf`,
      simulatedUrl: '#',
    }));
    D.value.businessDocuments.unshift(...docs);
    docs.forEach(doc => createResource('businessDocuments', doc));
    return docs;
  }

  function createDispatchForOrder(order) {
    if (dispatchForOrder(order.id)) return dispatchForOrder(order.id);
    const dispatch = {
      id: nextCode('DSP-2026', D.value.dispatchOrders, 4),
      code: nextCode('DSP-2026', D.value.dispatchOrders, 4),
      orderId: order.id,
      clientId: order.clientId,
      status: 'ready_for_operations',
      column: 'ready_for_operations',
      priority: order.priority || 'normal',
      routeName: 'Route not assigned yet',
      deliveryAddressId: order.deliveryAddressId,
      coldType: orderItemsFor(order.id).some(item => productById(item.productId)?.coldType === 'frozen') ? 'frozen' : 'chilled',
      eta: `${order.requestedDeliveryDate || new Date().toISOString().slice(0, 10)}T15:30:00Z`,
      driverName: 'Not assigned yet',
      responsible: 'Roberto Garcia',
      requiresPOD: true,
      documentProgress: '0/6',
    };
    D.value.dispatchOrders.unshift(dispatch);
    createResource('dispatchOrders', dispatch);
    return dispatch;
  }

  function addTimelineEvent(orderId, status, label, visibleToBuyer = true, timestamp = new Date().toISOString()) {
    const event = {
      id: nextCode('OTE', D.value.orderTimelineEvents, 3),
      orderId,
      status,
      label,
      timestamp,
      visibleToBuyer,
    };
    D.value.orderTimelineEvents.push(event);
    createResource('orderTimelineEvents', event);
    return event;
  }

  function updateOrderStatus(orderId, status) {
    const order = purchaseOrderById(orderId);
    if (!order) return null;
    order.status = status;
    order.dispatchStatus = status;
    patchResource('purchaseOrders', order.id, { status, dispatchStatus: status });
    addTimelineEvent(order.id, status, {
      preparing: 'Preparing dispatch',
      in_route: 'Dispatch Order on route',
      delivered: 'Purchase Order delivered',
      incident: 'Incident reported',
      ready_for_dispatch: 'Ready for operations',
      ready_for_route: 'Ready for route',
    }[status] || status, true);
    return order;
  }

  function updateDispatchStatus(dispatchId, status) {
    const dispatch = dispatchOrderById(dispatchId);
    if (!dispatch) return null;
    dispatch.status = status;
    dispatch.column = status;
    patchResource('dispatchOrders', dispatch.id, { status, column: status });
    const linkedOrderStatus = {
      preparing: 'preparing',
      in_route: 'in_route',
      delivered: 'delivered',
      incident: 'incident',
      ready_for_operations: 'ready_for_dispatch',
      ready_for_route: 'ready_for_dispatch',
    }[status];
    if (linkedOrderStatus) updateOrderStatus(dispatch.orderId, linkedOrderStatus);
    if (status === 'delivered') completePod(dispatch.id);
    addActivity(`${dispatch.id} updated to ${status}`, status === 'delivered' ? 'success' : 'info');
    return dispatch;
  }

  function completePod(dispatchId) {
    const dispatch = dispatchOrderById(dispatchId);
    if (!dispatch) return null;
    const existing = D.value.proofOfDelivery.find(pod => pod.dispatchOrderId === dispatch.id);
    const payload = {
      status: dispatch.status === 'delayed' ? 'observed' : 'complete',
      photoMock: true,
      signatureMock: true,
      receivedBy: contactByClientId(dispatch.clientId)?.name || 'Client',
      completedAt: new Date().toISOString(),
      notes: dispatch.status === 'delayed' ? 'Simulated POD observed due to delayed delivery state.' : 'Simulated POD completed for demo.',
    };
    if (existing) {
      Object.assign(existing, payload);
      patchResource('proofOfDelivery', existing.id, payload);
      return existing;
    }
    const pod = {
      id: nextCode('POD', D.value.proofOfDelivery, 3),
      dispatchOrderId: dispatch.id,
      orderId: dispatch.orderId,
      ...payload,
    };
    D.value.proofOfDelivery.unshift(pod);
    createResource('proofOfDelivery', pod);
    return pod;
  }

  function updateDocumentStatus(documentId, status) {
    const document = D.value.businessDocuments.find(doc => doc.id === documentId);
    if (!document) return null;
    document.status = status;
    document.visibleToBuyer = ['generated', 'uploaded', 'accepted'].includes(status) && document.status !== 'not_required';
    patchResource('businessDocuments', document.id, { status, visibleToBuyer: document.visibleToBuyer });
    addActivity(`${document.label} for ${document.orderId} marked as ${status}`, 'info');
    return document;
  }

  function addPromotion(payload) {
    const promotion = {
      id: nextCode('PROM', D.value.promotions, 3),
      tenantId: D.value.company.id || 'TEN-001',
      status: 'active',
      visibility: 'buyer_portal',
      productIds: [],
      notes: '',
      ...payload,
    };
    D.value.promotions.unshift(promotion);
    createResource('promotions', promotion);
    addActivity(`Promotion created: ${promotion.name}`, 'success');
    return promotion;
  }

  function updatePromotionStatus(promotionId, status) {
    const promotion = D.value.promotions.find(item => item.id === promotionId);
    if (!promotion) return null;
    promotion.status = status;
    patchResource('promotions', promotion.id, { status });
    addActivity(`Promotion ${promotion.name} set to ${status}`, status === 'active' ? 'success' : 'info');
    return promotion;
  }

  async function init() {
    const entries = await Promise.all(
      Object.keys(api).map(async (key) => {
        try {
          return [key, await api[key].getAll()];
        } catch {
          return [key, []];
        }
      })
    );
    const data = Object.fromEntries(entries);

    Object.assign(D.value, {
      ...data,
      company: {
        id: data.tenants?.[0]?.id || 'TEN-001',
        name: data.tenants?.[0]?.name || 'ICISA Demo',
        legalName: data.tenants?.[0]?.legalName || 'Importaciones y Comercio Internacional S.A.',
        ruc: data.tenants?.[0]?.ruc || '20123456789',
        address: data.tenants?.[0]?.address || 'Lima, Peru',
        country: data.tenants?.[0]?.country || 'PE',
        subscriptionPlan: data.tenants?.[0]?.subscriptionPlan || 'standard',
      },
      lots: data.inventoryLots || [],
      movements: data.stockMovements || [],
      activity: data.activityLog || [],
    });
    if (!D.value.products.length) {
      // Keep empty state if cloud and local Fake API are unavailable.
    }
  }

  init();

  return {
    D,
    clientName,
    productName,
    productById,
    clientById,
    orderById,
    purchaseRequestById,
    purchaseOrderById,
    dispatchOrderById,
    deliveryAddressById,
    contactByClientId,
    requestItemsFor,
    orderItemsFor,
    documentsForOrder,
    portalForClient,
    portalRequirementsForClient,
    uploadTaskForOrder,
    dispatchForOrder,
    timelineForOrder,
    messagesForRequest,
    messagesForOrder,
    temperatureForOrder,
    promotionsForProduct,
    nextOrderId,
    addOrder,
    addPurchaseRequest,
    updateRequestStatus,
    addMessage,
    convertRequestToOrder,
    updateOrderStatus,
    updateDispatchStatus,
    completePod,
    updateDocumentStatus,
    addPromotion,
    updatePromotionStatus,
  };
});

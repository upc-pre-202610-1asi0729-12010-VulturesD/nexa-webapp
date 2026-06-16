import { defineStore } from 'pinia';
import { ref } from 'vue';
import { catalogApplication } from '@/catalog-management/application/product-catalog/catalog.application';
import { purchaseOrdersApplication } from '@/sales/application/purchase-orders/purchase-orders.application';
import { inventoryApplication } from '@/warehouse/application/inventory-control/inventory.application';
import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';
import { dispatchOrdersApplication } from '@/logistics/application/dispatch-orders/dispatch-orders.application';
import { BusinessDocumentsApi } from '@/invoicing/infrastructure/business-documents/business-documents-api';
import initialData from '@/shared/data/initial-data.json';

const endpoints = {
  tenants: '/api/v1/tenants',
  subscriptions: '/api/v1/subscriptions',
  roles: '/api/v1/roles',
  users: '/api/v1/users',
  clients: '/api/v1/clients',
  clientContacts: '/api/v1/client-contacts',
  deliveryAddresses: '/api/v1/delivery-addresses',
  categories: '/api/v1/categories',
  brands: '/api/v1/brands',
  productImages: '/api/v1/product-images',
  priceLists: '/api/v1/price-lists',
  promotions: '/api/v1/promotions',
  warehouses: '/api/v1/warehouses',
  stockMovements: '/api/v1/stock-movements',
  availabilitySnapshots: '/api/v1/availability-snapshots',
  purchaseRequests: '/api/v1/purchase-requests',
  requestItems: '/api/v1/request-items',
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
  paymentMethods: '/api/v1/payment-methods',
  creditRequests: '/api/v1/credit-requests',
  creditPayments: '/api/v1/credit-payments',
  notifications: '/api/v1/notifications',
  temperatureLogs: '/api/v1/temperature-logs',
  alerts: '/api/v1/alerts',
  activityLog: '/api/v1/activity-log',
  supportConversations: '/api/v1/support-conversations',
};

const localResourceKeys = new Set([
  'tenants',
  'subscriptions',
  'roles',
  'users',
  'clients',
  'clientContacts',
  'deliveryAddresses',
  'productImages',
  'priceLists',
  'promotions',
  'stockMovements',
  'availabilitySnapshots',
  'purchaseRequests',
  'requestItems',
  'orderTimelineEvents',
  'businessDocuments',
  'customerPortals',
  'portalRequirements',
  'portalUploadTasks',
  'dispatchItems',
  'deliveryEvents',
  'proofOfDelivery',
  'chatThreads',
  'messages',
  'paymentMethods',
  'creditRequests',
  'creditPayments',
  'notifications',
  'temperatureLogs',
  'alerts',
  'activityLog',
  'supportConversations',
]);

const api = Object.fromEntries(
  Object.entries(endpoints).map(([key, path]) => [
    key,
    new BaseEndpoint(path)
  ])
);

/**
 * Central store for runtime data.
 * Loads business data from the configured Nexa backend through bounded-context services.
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
    brands: [],
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
    paymentMethods: [],
    payments: [],
    creditRequests: [],
    creditPayments: [],
    notifications: [],
    temperatureLogs: [],
    alerts:    [],
    activity:  [],
    activityLog: [],
    supportConversations: [],
  });

  function clientName(id)  {
    const client = D.value.clients.find(c => c.id === id) || {};
    return client.commercialName || client.name || client.businessName || id;
  }
  function productName(id) { return (D.value.products.find(p => p.id === id) || {}).name || id; }
  function productById(id) { return D.value.products.find(p => p.id === id); }
  function clientById(id)  { return D.value.clients.find(c => c.id === id); }
  function orderById(id)   {
    const key = String(id);
    return D.value.orders.find(o => String(o.id) === key || String(o.backendId) === key || String(o.code) === key) ||
      D.value.purchaseOrders.find(o => String(o.id) === key || String(o.backendId) === key || String(o.code) === key);
  }
  function purchaseRequestById(id) { return D.value.purchaseRequests.find(r => r.id === id || r.code === id); }
  function purchaseOrderById(id) {
    const key = String(id);
    return D.value.purchaseOrders.find(o => String(o.id) === key || String(o.backendId) === key || String(o.code) === key);
  }
  function dispatchOrderById(id) {
    const key = String(id);
    return D.value.dispatchOrders.find(d => String(d.id) === key || String(d.backendId) === key || String(d.code) === key);
  }
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
  function paymentMethodsForClient(clientId) { return D.value.paymentMethods.filter(method => method.clientId === clientId); }
  function creditRequestsForClient(clientId) { return D.value.creditRequests.filter(request => request.clientId === clientId); }
  function creditPaymentsForClient(clientId) { return D.value.creditPayments.filter(payment => payment.clientId === clientId); }
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

  async function addOrder(order) {
    const created = await purchaseOrdersApplication.createOrder(order);
    D.value.orders.unshift(created);
    D.value.purchaseOrders.unshift(created);
    D.value.orderItems.unshift(...orderItemsFromCoreOrders([created], D.value.products));
    return created;
  }

  function patchResource(key, id, payload) {
    if (localResourceKeys.has(key)) return;
    api[key]?.patch(id, payload).catch(() => {});
  }

  function createResource(key, payload) {
    if (localResourceKeys.has(key)) return;
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

  function addUser(payload) {
    const user = {
      id: nextCode('USR', D.value.users, 3),
      tenantId: D.value.company.id || 'TEN-001',
      status: 'active',
      planAccess: D.value.company.subscriptionPlan || 'standard',
      lastLogin: null,
      ...payload,
    };
    D.value.users.unshift(user);
    createResource('users', user);
    addActivity(`User created: ${user.email}`, 'success');
    return user;
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
    request.updatedAt = new Date().toISOString();
    patchResource('purchaseRequests', request.id, { status, updatedAt: request.updatedAt });
    addActivity(`${request.id} updated to ${status}`, status === 'approved' ? 'success' : 'warning');
    return request;
  }

  function addMessage({
    requestId = null,
    purchaseRequestId = null,
    orderId = null,
    clientId = null,
    title = null,
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
      clientId,
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
        clientId: clientId || (normalizedRequestId ? purchaseRequestById(normalizedRequestId)?.clientId : purchaseOrderById(orderId)?.clientId),
        title: title || normalizedRequestId || orderId || 'Client message',
        status: 'open',
      };
      D.value.chatThreads.push(newThread);
      createResource('chatThreads', newThread);
    }
    D.value.messages.push(message);
    createResource('messages', message);
    return message;
  }

  function addPaymentMethod(payload) {
    const method = {
      id: nextCode('PM', D.value.paymentMethods, 3),
      tenantId: D.value.company.id || 'TEN-001',
      clientId: payload.clientId,
      type: payload.type || 'card',
      brand: payload.brand || payload.walletType || 'Card',
      last4: payload.last4 || '',
      holderName: payload.holderName || payload.name || '',
      label: payload.label || '',
      walletType: payload.walletType || null,
      isDefault: Boolean(payload.isDefault),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    if (method.isDefault) {
      D.value.paymentMethods = D.value.paymentMethods.map(item =>
        item.clientId === method.clientId ? { ...item, isDefault: false } : item
      );
    }
    D.value.paymentMethods.unshift(method);
    createResource('paymentMethods', method);
    return method;
  }

  function setDefaultPaymentMethod(methodId) {
    const method = D.value.paymentMethods.find(item => item.id === methodId);
    if (!method) return null;
    D.value.paymentMethods = D.value.paymentMethods.map(item => {
      if (item.clientId !== method.clientId) return item;
      const next = { ...item, isDefault: item.id === methodId };
      patchResource('paymentMethods', item.id, { isDefault: next.isDefault });
      return next;
    });
    return D.value.paymentMethods.find(item => item.id === methodId);
  }

  function removePaymentMethod(methodId) {
    const method = D.value.paymentMethods.find(item => item.id === methodId);
    if (!method) return null;
    D.value.paymentMethods = D.value.paymentMethods.filter(item => item.id !== methodId);
    api.paymentMethods?.delete(methodId).catch(() => {});
    return method;
  }

  function addCreditRequest({ clientId, requestedAmount, reason, createdByUserId }) {
    const client = clientById(clientId);
    const request = {
      id: nextCode('CRQ', D.value.creditRequests, 3),
      tenantId: D.value.company.id || 'TEN-001',
      clientId,
      requestedAmount: Number(requestedAmount || 0),
      reason: reason || 'Monthly credit limit increase requested from buyer portal.',
      status: 'submitted',
      assignedToRole: 'sales',
      createdByUserId: createdByUserId || null,
      createdAt: new Date().toISOString(),
    };
    D.value.creditRequests.unshift(request);
    createResource('creditRequests', request);
    addMessage({
      clientId,
      title: request.id,
      senderRole: 'buyer',
      senderName: contactByClientId(clientId)?.name || client?.contact || 'B2B Buyer',
      body: `Credit increase requested for ${clientName(clientId)}. Requested amount: S/ ${request.requestedAmount.toLocaleString()}. Reason: ${request.reason}`,
      visibleToCommercial: true,
      visibleToBuyer: true,
    });
    addActivity(`${request.id} credit increase requested - ${clientName(clientId)}`, 'warning');
    return request;
  }

  function addCreditPayment({ clientId, amount, period, methodId }) {
    const payment = {
      id: nextCode('CPY', D.value.creditPayments, 3),
      tenantId: D.value.company.id || 'TEN-001',
      clientId,
      amount: Number(amount || 0),
      period: period || clientById(clientId)?.monthlyCreditPeriod || '2026-06',
      methodId: methodId || null,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    D.value.creditPayments.unshift(payment);
    createResource('creditPayments', payment);
    addActivity(`${payment.id} monthly credit payment scheduled - ${clientName(clientId)}`, 'success');
    return payment;
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
    request.updatedAt = order.createdAt;
    D.value.purchaseOrders.unshift(order);
    D.value.orderItems.unshift(...orderItems);
    patchResource('purchaseRequests', request.id, { status: request.status, convertedOrderId: orderId, updatedAt: request.updatedAt });
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
      monthlyCreditDue: used,
      monthlyCreditStatus: status,
    });
    patchResource('clients', client.id, {
      creditUsed: used,
      creditStatus: status,
      monthlyCreditUsed: used,
      monthlyCreditAvailable: available,
      monthlyCreditDue: used,
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
      photoReference: true,
      signatureReference: true,
      receivedBy: contactByClientId(dispatch.clientId)?.name || 'Client',
      completedAt: new Date().toISOString(),
      notes: dispatch.status === 'delayed' ? 'POD observed due to delayed delivery state.' : 'POD completed with delivery references.',
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

  async function readCoreCollection(loader) {
    try {
      const rows = await loader();
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  // Local static resources are loaded directly from the bundled JSON dataset

  const businessDocumentsApi = new BusinessDocumentsApi();

  function orderItemsFromCoreOrders(orders = [], products = D.value.products) {
    return orders.flatMap(order => (order.items || []).map((item, index) => {
      const product = products.find(row => row.id === item.productId) || productById(item.productId) || {};
      const quantity = Number(item.quantity ?? item.qty ?? 0);
      const price = Number(item.price ?? item.unitPriceAmount ?? 0);

      return {
        id: item.id || `${order.id}-ITEM-${String(index + 1).padStart(2, '0')}`,
        orderId: order.id,
        productId: item.productId,
        catalogItemId: item.catalogItemId,
        itemName: item.itemName || product.name,
        quantity,
        unit: product.unit || 'UN',
        price,
        estimatedWeightKg: Number(product.weightKg || 1) * quantity,
        stockOk: item.stockOk !== false,
      };
    }));
  }

  async function loadCoreCollections() {
    const [products, categories, brands, warehouses, lots, orders, dispatchOrders, invoices, payments] = await Promise.all([
      readCoreCollection(() => catalogApplication.getProducts()),
      readCoreCollection(() => catalogApplication.getCategories()),
      readCoreCollection(() => catalogApplication.getBrands()),
      readCoreCollection(() => inventoryApplication.getWarehouses()),
      readCoreCollection(() => inventoryApplication.getLots()),
      readCoreCollection(() => purchaseOrdersApplication.getOrders()),
      readCoreCollection(() => dispatchOrdersApplication.getDispatchOrders()),
      readCoreCollection(() => businessDocumentsApi.getInvoices()),
      readCoreCollection(() => businessDocumentsApi.getPayments()),
    ]);

    if (products.length) D.value.products = products;
    if (categories.length) D.value.categories = categories;
    if (brands.length) D.value.brands = brands;
    if (lots.length) {
      D.value.inventoryLots = lots;
      D.value.lots = lots;
    }
    if (warehouses.length) {
      D.value.warehouses = warehouses.map(warehouse => {
        const warehouseLots = lots.filter(lot => lot.warehouse === warehouse.address || lot.zone === warehouse.address);
        const used = warehouseLots.reduce((sum, lot) => sum + Number(lot.qty || 0), 0);
        const reserved = warehouseLots.reduce((sum, lot) => sum + Number(lot.reserved || 0), 0);
        const capacity = Math.max(100, Math.ceil((used + reserved) * 1.25));
        return {
          ...warehouse,
          zones: (warehouse.zones || []).map(zone => ({
            ...zone,
            used,
            capacity,
          })),
        };
      });
    }
    if (orders.length) {
      D.value.orders = orders;
      D.value.purchaseOrders = orders;
      D.value.orderItems = orderItemsFromCoreOrders(orders, products.length ? products : D.value.products);
    }
    if (dispatchOrders.length) {
      D.value.dispatchOrders = dispatchOrders.map(dispatch => {
        const order = orders.find(row => Number(row.backendId) === Number(dispatch.orderId));
        return {
          ...dispatch,
          orderBackendId: dispatch.orderId,
          orderId: order?.id || dispatch.orderId,
          clientId: order?.clientId || dispatch.clientId,
          dest: order?.clientId || dispatch.dest,
        };
      });
    }
    if (invoices.length) {
      D.value.businessDocuments = invoices.map(invoice => {
        const order = orders.find(row => Number(row.backendId) === Number(invoice.orderId));
        return {
          ...invoice,
          orderBackendId: invoice.orderId,
          orderId: order?.id || invoice.orderId,
          clientId: order?.clientId || invoice.clientId,
        };
      });
    }
    if (payments.length) {
      D.value.payments = payments.map(payment => {
        const invoice = invoices.find(row => Number(row.backendId) === Number(payment.invoiceId) || Number(row.id) === Number(payment.invoiceId));
        const order = orders.find(row => Number(row.backendId) === Number(invoice?.orderBackendId || invoice?.orderId));
        return {
          ...payment,
          invoiceCode: invoice?.id || payment.invoiceId,
          orderId: order?.id || invoice?.orderId || null,
          clientId: order?.clientId || null,
        };
      });
    }
  }

  async function loadLocalCollections() {
    const keys = [
      'clients',
      'clientContacts',
      'deliveryAddresses',
      'purchaseRequests',
      'requestItems',
      'promotions',
      'customerPortals',
      'portalRequirements',
      'portalUploadTasks',
      'paymentMethods',
      'creditRequests',
      'creditPayments',
      'users',
      'subscriptions',
      'chatThreads',
      'messages',
      'temperatureLogs',
      'stockMovements',
      'supportConversations',
      'activityLog',
      'notifications',
      'alerts',
    ];
    keys.forEach(key => {
      const rows = initialData[key];
      if (Array.isArray(rows) && rows.length) {
        D.value[key] = JSON.parse(JSON.stringify(rows));
      }
    });
    if (D.value.activityLog.length) D.value.activity = D.value.activityLog;
    if (D.value.stockMovements.length) D.value.movements = D.value.stockMovements;
  }

  async function init() {
    Object.assign(D.value, {
      company: {
        id: 'NEXA',
        name: 'Nexa',
        legalName: 'Nexa Cold-Chain Platform',
        ruc: '',
        address: 'Peru',
        country: 'PE',
        subscriptionPlan: 'standard',
      },
      lots: [],
      movements: [],
      activity: [],
    });
    await loadCoreCollections();
    await loadLocalCollections();
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
    paymentMethodsForClient,
    creditRequestsForClient,
    creditPaymentsForClient,
    temperatureForOrder,
    promotionsForProduct,
    nextOrderId,
    addUser,
    addOrder,
    addPurchaseRequest,
    updateRequestStatus,
    addMessage,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    addCreditRequest,
    addCreditPayment,
    convertRequestToOrder,
    updateOrderStatus,
    updateDispatchStatus,
    completePod,
    updateDocumentStatus,
    addPromotion,
    updatePromotionStatus,
  };
});

export const ORDER_STATUS_FLOW = ['pending', 'submitted', 'validating', 'confirmed', 'document_pending', 'ready_for_dispatch', 'ready_for_route', 'preparing', 'in_route', 'delivered'];
export const ORDER_TRACKING_STEPS = [
  ['submitted', 'Request received'],
  ['validating', 'Commercial validation'],
  ['confirmed', 'Purchase order confirmed'],
  ['document_pending', 'Business documents prepared'],
  ['ready_for_dispatch', 'Ready for operations'],
  ['ready_for_route', 'Ready for route'],
  ['preparing', 'Preparing dispatch'],
  ['in_route', 'On route'],
  ['delivered', 'Delivered'],
];
export const ORDER_STATUS_FILTERS = ['pending', 'validating', 'document_pending', 'confirmed', 'ready_for_dispatch', 'ready_for_route', 'preparing', 'in_route', 'dispatched', 'delivered', 'incident', 'blocked', 'rejected', 'cancelled'];

const statusLabels = {
  en: {
    draft: 'Draft',
    pending: 'Pending',
    submitted: 'Submitted',
    in_review: 'In review',
    needs_adjustment: 'Needs adjustment',
    approved: 'Approved',
    converted_to_order: 'Converted to purchase order',
    validating: 'Commercial validation',
    document_pending: 'Business documents pending',
    confirmed: 'Confirmed',
    ready_for_dispatch: 'Ready for operations',
    ready_for_operations: 'Ready for operations',
    ready_for_route: 'Ready for route',
    preparing: 'Preparing dispatch',
    dispatched: 'Dispatched',
    in_route: 'On route',
    delayed: 'Delayed delivery',
    delivered: 'Delivered',
    incident: 'Incident',
    observed: 'Observed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    blocked: 'Blocked',
  },
  es: {
    draft: 'Borrador',
    pending: 'Pendiente',
    submitted: 'Enviada',
    in_review: 'En revisión',
    needs_adjustment: 'Requiere ajuste',
    approved: 'Aprobada',
    converted_to_order: 'Convertida a orden de compra',
    validating: 'Validación comercial',
    document_pending: 'Documentos comerciales pendientes',
    confirmed: 'Confirmada',
    ready_for_dispatch: 'Lista para operaciones',
    ready_for_operations: 'Lista para operaciones',
    ready_for_route: 'Lista para ruta',
    preparing: 'Preparando despacho',
    dispatched: 'Despachada',
    in_route: 'En ruta',
    delayed: 'Entrega demorada',
    delivered: 'Entregada',
    incident: 'Incidencia',
    observed: 'Observada',
    cancelled: 'Cancelada',
    rejected: 'Rechazada',
    blocked: 'Bloqueada',
  },
};

const trackingStepLabels = {
  en: Object.fromEntries(ORDER_TRACKING_STEPS),
  es: {
    submitted: 'Solicitud recibida',
    validating: 'Validación comercial',
    confirmed: 'Orden de compra confirmada',
    document_pending: 'Documentos comerciales preparados',
    ready_for_dispatch: 'Lista para operaciones',
    ready_for_route: 'Lista para ruta',
    preparing: 'Preparando despacho',
    in_route: 'En ruta',
    delivered: 'Entregada',
  },
};

const documentStatusLabels = {
  en: {
    pending: 'Pending',
    generated: 'Generated',
    uploaded: 'Uploaded',
    accepted: 'Accepted',
    observed: 'Observed',
    rejected: 'Rejected',
    not_required: 'Not required',
  },
  es: {
    pending: 'Pendiente',
    generated: 'Generado',
    uploaded: 'Cargado',
    accepted: 'Aceptado',
    observed: 'Observado',
    rejected: 'Rechazado',
    not_required: 'No requerido',
  },
};

const coldTypeLabels = {
  en: {
    frozen: 'Frozen',
    chilled: 'Chilled',
    ambient: 'Ambient',
    cold_risk: 'Cold risk',
  },
  es: {
    frozen: 'Congelado',
    chilled: 'Refrigerado',
    ambient: 'Ambiente',
    cold_risk: 'Riesgo de frío',
  },
};

const priorityLabels = {
  en: { high: 'High', medium: 'Medium', low: 'Low' },
  es: { high: 'Alta', medium: 'Media', low: 'Baja' },
};

const currentLocale = () => {
  if (typeof localStorage === 'undefined') return 'en';
  return localStorage.getItem('nexa.lang') === 'es' ? 'es' : 'en';
};

const labelFrom = (dictionary, key, locale = currentLocale()) =>
  dictionary[locale]?.[key] || dictionary.en?.[key] || key;

export const displayCode = (record = {}) => record.code || record.id || record.requestId || record.orderId || '';

export const recordTimestamp = (record = {}, events = []) => {
  const eventTimes = events
    .map(event => new Date(event.timestamp || event.createdAt || event.updatedAt || 0).getTime())
    .filter(time => Number.isFinite(time) && time > 0);
  const direct = record.updatedAt || record.createdAt || record.requestedDeliveryDate || record.date;
  const directTime = direct ? new Date(direct).getTime() : 0;
  const idTime = Number(String(displayCode(record)).split('-').pop()) || 0;
  return Math.max(directTime || 0, idTime, ...eventTimes);
};

export const latestByActivity = (records = [], eventsForRecord = () => []) => [...records]
  .sort((a, b) => recordTimestamp(b, eventsForRecord(b)) - recordTimestamp(a, eventsForRecord(a)))[0] || null;

export const orderStatusLabel = (s, locale) => labelFrom(statusLabels, s, locale);

export const orderStatusBadge = (s) => 'badge-' + ({
  draft: 'gray', pending: 'amber', submitted: 'blue', in_review: 'amber',
  needs_adjustment: 'orange', approved: 'green', converted_to_order: 'purple',
  validating: 'orange', document_pending: 'amber', confirmed: 'blue',
  ready_for_dispatch: 'blue', ready_for_operations: 'blue',
  ready_for_route: 'blue',
  preparing: 'amber', dispatched: 'blue', in_route: 'blue',
  delayed: 'orange', delivered: 'green', observed: 'orange', cancelled: 'gray',
  rejected: 'red', blocked: 'red', incident: 'red',
}[s] || 'gray');

export const priorityLabel = (p, locale) => labelFrom(priorityLabels, p, locale);

export const orderStepState = (status, step) => {
  if (['blocked', 'cancelled', 'rejected'].includes(status)) {
    return step === 'validating' ? 'active' : 'pending';
  }
  const aliases = { dispatched: 'in_route', ready_for_operations: 'ready_for_dispatch' };
  const normalizedStatus = aliases[status] || status;
  const normalizedStep = aliases[step] || step;
  const target = ORDER_STATUS_FLOW.indexOf(normalizedStep);
  const normalizedCurrent = ORDER_STATUS_FLOW.indexOf(normalizedStatus);
  if (normalizedCurrent < 0 || target < 0) return 'pending';
  if (target < normalizedCurrent) return 'done';
  if (target === normalizedCurrent) return 'active';
  return 'pending';
};

const statusAliases = {
  ready_for_operations: 'ready_for_dispatch',
  dispatched: 'in_route',
  document_ready: 'document_pending',
  documents_prepared: 'document_pending',
  approved: 'validating',
  converted_to_order: 'confirmed',
};

export const normalizeOrderStatus = (status) => statusAliases[status] || status;

export const timelineEventForStep = (events = [], step) => {
  const normalizedStep = normalizeOrderStatus(step);
  return [...events]
    .filter(event => normalizeOrderStatus(event.status) === normalizedStep)
    .sort((a, b) => new Date(a.timestamp || a.createdAt || 0) - new Date(b.timestamp || b.createdAt || 0))
    .at(-1);
};

export const formatTimelineDateTime = (value, locale = currentLocale()) => {
  if (!value) return locale === 'es' ? 'Pendiente' : 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return locale === 'es' ? 'Pendiente' : 'Pending';
  return date.toLocaleString(locale === 'es' ? 'es-PE' : 'en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const buildOrderTrackingSteps = (order, events = []) => {
  const visibleEvents = events.filter(event => event.visibleToBuyer !== false);
  return ORDER_TRACKING_STEPS.map(([key, label], index) => {
    const event = timelineEventForStep(visibleEvents, key);
    const locale = currentLocale();
    return {
      key,
      label: labelFrom(trackingStepLabels, key, locale) || label,
      index: index + 1,
      state: orderStepState(order?.status, key),
      timestamp: event?.timestamp || event?.createdAt || null,
      dateLabel: formatTimelineDateTime(event?.timestamp || event?.createdAt, locale),
    };
  });
};

export const daysUntil = (dateStr, today = new Date()) => {
  return Math.ceil((new Date(dateStr) - today) / 86400000);
};

export const requestStatusLabel = orderStatusLabel;
export const requestStatusBadge = orderStatusBadge;

export const documentStatusLabel = (s, locale) => labelFrom(documentStatusLabels, s, locale);

export const documentStatusBadge = (s) => 'badge-' + ({
  pending: 'amber',
  generated: 'blue',
  uploaded: 'blue',
  accepted: 'green',
  observed: 'orange',
  rejected: 'red',
  not_required: 'gray',
}[s] || 'gray');

export const coldTypeLabel = (s, locale) => labelFrom(coldTypeLabels, s, locale);

export const coldTypeBadge = (s) => ({
  frozen: 'cold-badge cold-badge-frozen',
  chilled: 'cold-badge cold-badge-chilled',
  ambient: 'cold-badge cold-badge-ambient',
  cold_risk: 'cold-badge cold-badge-risk',
}[s] || 'cold-badge cold-badge-ambient');

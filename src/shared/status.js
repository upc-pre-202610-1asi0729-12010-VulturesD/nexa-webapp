export const ORDER_STATUS_FLOW = ['submitted', 'validating', 'confirmed', 'document_pending', 'ready_for_dispatch', 'ready_for_route', 'preparing', 'in_route', 'delivered'];
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
export const ORDER_STATUS_FILTERS = ['validating', 'document_pending', 'confirmed', 'ready_for_dispatch', 'ready_for_route', 'preparing', 'in_route', 'dispatched', 'delivered', 'incident', 'blocked'];

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

export const orderStatusLabel = (s) => ({
  draft: 'Draft', submitted: 'Submitted', in_review: 'In review',
  needs_adjustment: 'Needs adjustment', approved: 'Approved',
  converted_to_order: 'Converted to purchase order',
  validating: 'Commercial validation', document_pending: 'Business documents pending',
  confirmed: 'Confirmed', ready_for_dispatch: 'Ready for operations',
  ready_for_operations: 'Ready for operations',
  ready_for_route: 'Ready for route',
  preparing: 'Preparing dispatch', dispatched: 'Dispatched', in_route: 'On route',
  delayed: 'Delayed delivery', delivered: 'Delivered', incident: 'Incident',
  observed: 'Observed', cancelled: 'Cancelled', rejected: 'Rejected',
  blocked: 'Blocked',
}[s] || s);

export const orderStatusBadge = (s) => 'badge-' + ({
  draft: 'gray', submitted: 'blue', in_review: 'amber',
  needs_adjustment: 'orange', approved: 'green', converted_to_order: 'purple',
  validating: 'orange', document_pending: 'amber', confirmed: 'blue',
  ready_for_dispatch: 'blue', ready_for_operations: 'blue',
  ready_for_route: 'blue',
  preparing: 'amber', dispatched: 'blue', in_route: 'blue',
  delayed: 'orange', delivered: 'green', observed: 'orange', cancelled: 'gray',
  rejected: 'red', blocked: 'red', incident: 'red',
}[s] || 'gray');

export const priorityLabel = (p) => ({ high: 'High', medium: 'Medium', low: 'Low' }[p] || p);

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

export const formatTimelineDateTime = (value) => {
  if (!value) return 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Pending';
  return date.toLocaleString('en-US', {
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
    return {
      key,
      label,
      index: index + 1,
      state: orderStepState(order?.status, key),
      timestamp: event?.timestamp || event?.createdAt || null,
      dateLabel: formatTimelineDateTime(event?.timestamp || event?.createdAt),
    };
  });
};

export const daysUntil = (dateStr, today = new Date()) => {
  return Math.ceil((new Date(dateStr) - today) / 86400000);
};

export const requestStatusLabel = orderStatusLabel;
export const requestStatusBadge = orderStatusBadge;

export const documentStatusLabel = (s) => ({
  pending: 'Pending',
  generated: 'Generated',
  uploaded: 'Uploaded',
  accepted: 'Accepted',
  observed: 'Observed',
  rejected: 'Rejected',
  not_required: 'Not required',
}[s] || s);

export const documentStatusBadge = (s) => 'badge-' + ({
  pending: 'amber',
  generated: 'blue',
  uploaded: 'blue',
  accepted: 'green',
  observed: 'orange',
  rejected: 'red',
  not_required: 'gray',
}[s] || 'gray');

export const coldTypeLabel = (s) => ({
  frozen: 'Frozen',
  chilled: 'Chilled',
  ambient: 'Ambient',
  cold_risk: 'Cold risk',
}[s] || s);

export const coldTypeBadge = (s) => ({
  frozen: 'cold-badge cold-badge-frozen',
  chilled: 'cold-badge cold-badge-chilled',
  ambient: 'cold-badge cold-badge-ambient',
  cold_risk: 'cold-badge cold-badge-risk',
}[s] || 'cold-badge cold-badge-ambient');

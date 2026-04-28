export const ORDER_STATUS_FLOW = ['validating', 'confirmed', 'preparing', 'dispatched', 'delivered'];
export const ORDER_STATUS_FILTERS = ['validating', 'blocked', 'confirmed', 'preparing', 'dispatched', 'delivered'];

export const orderStatusLabel = (s) => ({
  draft: 'Borrador', validating: 'En validación', confirmed: 'Confirmado',
  preparing: 'Preparando', dispatched: 'Despachado', delivered: 'Entregado',
  observed: 'Observado', cancelled: 'Cancelado', rejected: 'Rechazado',
  blocked: 'Bloqueado',
}[s] || s);

export const orderStatusBadge = (s) => 'badge-' + ({
  draft: 'gray', validating: 'orange', confirmed: 'blue', preparing: 'amber',
  dispatched: 'blue', delivered: 'green', observed: 'orange', cancelled: 'gray',
  rejected: 'red', blocked: 'red',
}[s] || 'gray');

export const priorityLabel = (p) => ({ high: 'Alta', medium: 'Media', low: 'Baja' }[p] || p);

export const orderStepState = (status, step) => {
  if (['blocked', 'cancelled', 'rejected'].includes(status)) {
    return step === 'validating' ? 'active' : 'pending';
  }
  const current = ORDER_STATUS_FLOW.indexOf(status);
  const target = ORDER_STATUS_FLOW.indexOf(step);
  if (current < 0 || target < 0) return 'pending';
  if (target < current) return 'done';
  if (target === current) return 'active';
  return 'pending';
};

export const daysUntil = (dateStr, today = new Date()) => {
  return Math.ceil((new Date(dateStr) - today) / 86400000);
};

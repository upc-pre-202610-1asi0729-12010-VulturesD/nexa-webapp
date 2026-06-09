import { Dispatch } from '@/logistics/domain/model/entities/dispatch.entity';
import { DispatchResource } from './dispatch-order.resource';

const normalizeShipmentStatus = (status = 'scheduled') => {
  const normalized = String(status).toLowerCase();
  if (normalized === 'delivered') return 'delivered';
  if (normalized === 'inroute' || normalized === 'in_route') return 'in_route';
  return 'ready_for_operations';
};

const normalizeShipment = (resource = {}) => {
  if (!resource.shipmentCode) return resource;
  const status = normalizeShipmentStatus(resource.status);
  return {
    id: resource.shipmentCode,
    backendId: resource.id,
    code: resource.shipmentCode,
    orderId: resource.orderId,
    clientId: null,
    status,
    column: status,
    priority: 'normal',
    driver: 'Pending assignment',
    driverName: 'Pending assignment',
    vehicle: 'Pending assignment',
    dest: 'Backend order reference',
    tempExit: resource.lastTemperatureCelsius,
    evidenceRequired: true,
    evidenceDone: status === 'delivered',
    checklist: [],
    routeName: 'Scheduled shipment',
    eta: resource.scheduledAt,
    responsible: 'Operations',
    requiresPOD: true,
    documentProgress: status === 'delivered' ? 'Delivered' : 'Pending POD',
    coldType: Number(resource.lastTemperatureCelsius) < 0 ? 'frozen' : 'chilled',
    lastTemperatureCelsius: resource.lastTemperatureCelsius,
    scheduledAt: resource.scheduledAt,
    deliveredAt: resource.deliveredAt,
    source: 'nexa-platform',
  };
};

export const DispatchAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new Dispatch(normalizeShipment(resource));
  },

  toResource(entity) {
    if (!entity) return null;
    return new DispatchResource({
      id: entity.id,
      backendId: entity.backendId,
      code: entity.code,
      orderId: entity.orderId,
      clientId: entity.clientId,
      status: entity.status.value,
      column: entity.column,
      priority: entity.priority,
      driver: entity.driver,
      driverName: entity.driverName,
      vehicle: entity.vehicle,
      dest: entity.dest,
      tempExit: entity.tempExit,
      evidenceRequired: entity.evidenceRequired,
      evidenceDone: entity.evidenceDone,
      checklist: entity.checklist,
      routeName: entity.routeName,
      eta: entity.eta,
      responsible: entity.responsible,
      requiresPOD: entity.requiresPOD,
      documentProgress: entity.documentProgress,
      coldType: entity.coldType,
      lastTemperatureCelsius: entity.lastTemperatureCelsius,
      scheduledAt: entity.scheduledAt,
      deliveredAt: entity.deliveredAt,
      delayReason: entity.delayReason,
      temperatureStatus: entity.temperatureStatus,
    });
  },
};

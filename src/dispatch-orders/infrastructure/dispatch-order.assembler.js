import { Dispatch } from '@/dispatch-orders/domain/model/entities/Dispatch.entity';
import { DispatchResource } from './dispatch-order.resource';

export const DispatchAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new Dispatch(resource);
  },

  toResource(entity) {
    if (!entity) return null;
    return new DispatchResource({
      id: entity.id,
      orderId: entity.orderId,
      clientId: entity.clientId,
      status: entity.status.value,
      driver: entity.driver,
      vehicle: entity.vehicle,
      dest: entity.dest,
      tempExit: entity.tempExit,
      evidenceRequired: entity.evidenceRequired,
      evidenceDone: entity.evidenceDone,
      checklist: entity.checklist,
    });
  },
};

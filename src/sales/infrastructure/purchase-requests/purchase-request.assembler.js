import { PurchaseRequest } from '@/sales/domain/model/entities/purchase-request.entity';

export class PurchaseRequestAssembler {
  static toEntity(resource = {}) {
    return new PurchaseRequest(resource);
  }

  static toEntities(resources = []) {
    return resources.map(resource => this.toEntity(resource));
  }
}

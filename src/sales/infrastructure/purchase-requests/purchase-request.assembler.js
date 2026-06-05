import { PurchaseRequest } from '@/sales/domain/model/purchase-request.entity';

export class PurchaseRequestAssembler {
  static toEntity(resource = {}) {
    return new PurchaseRequest(resource);
  }

  static toEntities(resources = []) {
    return resources.map(resource => this.toEntity(resource));
  }
}

import { PurchaseRequest } from '@/purchase-requests/domain/model/purchase-request.entity';

export class PurchaseRequestAssembler {
  static toEntity(resource = {}) {
    return new PurchaseRequest(resource);
  }

  static toEntities(resources = []) {
    return resources.map(resource => this.toEntity(resource));
  }
}

import { Promotion } from '@/catalog-management/domain/model/promotion.entity';

export class PromotionAssembler {
  static toEntity(resource = {}) {
    return new Promotion(resource);
  }

  static toEntities(resources = []) {
    return resources.map(resource => this.toEntity(resource));
  }
}

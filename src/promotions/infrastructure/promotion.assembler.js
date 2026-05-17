import { Promotion } from '@/promotions/domain/model/promotion.entity';

export class PromotionAssembler {
  static toEntity(resource = {}) {
    return new Promotion(resource);
  }

  static toEntities(resources = []) {
    return resources.map(resource => this.toEntity(resource));
  }
}

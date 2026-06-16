import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class PromotionsApi {
  constructor() {
    this.promotions = new BaseEndpoint('/api/v1/promotions');
  }

  getPromotions() { return this.promotions.getAll(); }
  createPromotion(payload) { return this.promotions.create(payload); }
}

export class Promotion {
  constructor({ id = null, title = '', name = '', productIds = [], status = 'scheduled', visibleInPlan = 'standard' } = {}) {
    this.id = id;
    this.title = title || name;
    this.productIds = productIds;
    this.status = status;
    this.visibleInPlan = visibleInPlan;
  }
}

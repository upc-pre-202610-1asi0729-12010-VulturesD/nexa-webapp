export class SubscriptionPlan {
  constructor({ id = null, key = 'standard', name = 'Standard', features = {} } = {}) {
    this.id = id;
    this.key = key;
    this.name = name;
    this.features = features;
  }
}

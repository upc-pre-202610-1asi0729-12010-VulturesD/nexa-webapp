export class BuyerProfile {
  constructor({ id = null, userId = null, clientId = null, plan = 'standard', authorizedProductIds = [] } = {}) {
    this.id = id;
    this.userId = userId;
    this.clientId = clientId;
    this.plan = plan;
    this.authorizedProductIds = authorizedProductIds;
  }
}

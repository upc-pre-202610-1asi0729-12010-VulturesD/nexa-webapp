export class ValidationDecision {
  constructor({ requestId = null, decision = 'pending', reason = '', decidedByUserId = null } = {}) {
    this.requestId = requestId;
    this.decision = decision;
    this.reason = reason;
    this.decidedByUserId = decidedByUserId;
  }
}

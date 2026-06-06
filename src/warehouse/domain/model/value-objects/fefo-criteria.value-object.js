import { ValueObject } from '@/shared/domain/model/value-objects/value-object';

export class FefoCriteria extends ValueObject {
  constructor(referenceDate = new Date()) {
    super(referenceDate instanceof Date ? referenceDate : new Date(referenceDate));
  }

  sortLots(lots = []) {
    return [...lots].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  }

  nextLot(lots = []) {
    return this.sortLots(lots).find(lot => (lot.availableQty ? lot.availableQty() : lot.qty) > 0) || null;
  }
}

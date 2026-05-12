import { ValueObject } from '@/shared/domain/model/ValueObject';

export class TemperatureRange extends ValueObject {
  constructor(value = '') {
    super(value);
  }

  isFrozen() {
    return this.value.includes('-18');
  }

  isRefrigerated() {
    return this.value.includes('0') || this.value.includes('2');
  }

  requiresColdChain() {
    return this.isFrozen() || this.isRefrigerated();
  }
}

import { ValueObject } from '@/shared/domain/model/ValueObject';

export class PodEvidenceMock extends ValueObject {
  constructor({ tempArrival = null, notes = '', photoName = '', signatureName = '' } = {}) {
    super({ tempArrival, notes, photoName, signatureName });
  }

  isComplete() {
    return this.value.tempArrival !== null || Boolean(this.value.notes || this.value.photoName || this.value.signatureName);
  }

  toPrimitives() {
    return { ...this.value };
  }
}

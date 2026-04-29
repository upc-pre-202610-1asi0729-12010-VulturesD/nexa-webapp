export class ValueObject {
  constructor(value) {
    this.value = value;
    Object.freeze(this);
  }

  equals(other) {
    return Boolean(other) && other.constructor === this.constructor && other.value === this.value;
  }

  toString() {
    return String(this.value);
  }
}

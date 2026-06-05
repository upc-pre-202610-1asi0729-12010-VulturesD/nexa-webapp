export class Entity {
  constructor({ id } = {}) {
    if (!id) {
      throw new Error('Entity requires id');
    }

    this.id = id;
  }

  equals(other) {
    return Boolean(other) && other.constructor === this.constructor && other.id === this.id;
  }

  toPrimitives() {
    return { ...this };
  }
}

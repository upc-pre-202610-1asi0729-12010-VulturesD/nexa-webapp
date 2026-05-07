import { Entity } from '@/shared/domain/model/Entity';

export class Category extends Entity {
  constructor({ id, name, cat } = {}) {
    super({ id });
    this.name = name;
    this.cat = cat;
  }

  matchesProduct(product) {
    return product?.category === this.name || product?.cat === this.cat;
  }
}

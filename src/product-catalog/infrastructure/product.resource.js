export class ProductResource {
  constructor({
    id,
    name,
    sku,
    category,
    cat,
    temp,
    unit,
    price,
    stock,
    reserved,
    minStock,
    warehouse,
    zone,
    status,
  } = {}) {
    this.id = id;
    this.name = name;
    this.sku = sku;
    this.category = category;
    this.cat = cat;
    this.temp = temp;
    this.unit = unit;
    this.price = price;
    this.stock = stock;
    this.reserved = reserved;
    this.minStock = minStock;
    this.warehouse = warehouse;
    this.zone = zone;
    this.status = status;
  }
}

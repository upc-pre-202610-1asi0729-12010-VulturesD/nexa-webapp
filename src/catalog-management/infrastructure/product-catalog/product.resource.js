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
    imageUrl,
    brand,
    brandName,
    description,
    coldType,
    commercialAvailability,
    isVisibleToBuyer,
    visibleToBuyer,
    catalogItemId,
    productId,
    currency,
    weightKg,
    knowledge,
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
    this.imageUrl = imageUrl;
    this.brand = brand;
    this.brandName = brandName;
    this.description = description;
    this.coldType = coldType;
    this.commercialAvailability = commercialAvailability;
    this.isVisibleToBuyer = isVisibleToBuyer;
    this.visibleToBuyer = visibleToBuyer;
    this.catalogItemId = catalogItemId;
    this.productId = productId;
    this.currency = currency;
    this.weightKg = weightKg;
    this.knowledge = knowledge;
  }
}

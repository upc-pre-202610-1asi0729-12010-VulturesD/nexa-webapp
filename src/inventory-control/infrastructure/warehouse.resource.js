export class WarehouseResource {
  constructor({ id, name, address, zones = [] } = {}) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.zones = zones;
  }
}

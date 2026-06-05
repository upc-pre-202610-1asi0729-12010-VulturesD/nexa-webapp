import { Entity } from '@/shared/domain/model/entities/entity';

export class Warehouse extends Entity {
  constructor({ id, name, address, zones = [] } = {}) {
    super({ id });
    this.name = name;
    this.address = address;
    this.zones = zones;
  }

  hasColdZone(zoneId) {
    return this.zones.some(zone => zone.id === zoneId && zone.tempOk !== false);
  }

  utilizationRate() {
    const totals = this.zones.reduce((acc, zone) => ({
      capacity: acc.capacity + (zone.capacity || 0),
      used: acc.used + (zone.used || 0),
    }), { capacity: 0, used: 0 });

    return totals.capacity === 0 ? 0 : totals.used / totals.capacity;
  }
}

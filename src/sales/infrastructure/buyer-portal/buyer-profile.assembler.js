import { BuyerProfile } from '@/sales/domain/model/buyer-profile.entity';

export class BuyerProfileAssembler {
  static toEntity(resource = {}) {
    return new BuyerProfile(resource);
  }
}

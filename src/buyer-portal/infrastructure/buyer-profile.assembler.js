import { BuyerProfile } from '@/buyer-portal/domain/model/buyer-profile.entity';

export class BuyerProfileAssembler {
  static toEntity(resource = {}) {
    return new BuyerProfile(resource);
  }
}

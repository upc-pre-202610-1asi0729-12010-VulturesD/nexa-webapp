import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

class BuyerAssistantApiService {
  constructor() {
    this.messages = new BaseEndpoint('/api/v1/buyer-assistant/messages');
  }

  send(payload) {
    return this.messages.create(payload);
  }
}

export const buyerAssistantApiService = new BuyerAssistantApiService();

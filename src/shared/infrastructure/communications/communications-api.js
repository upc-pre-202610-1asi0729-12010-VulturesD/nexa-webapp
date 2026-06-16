import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class CommunicationsApi {
  constructor() {
    this.threads = new BaseEndpoint('/api/v1/chat-threads');
    this.messages = new BaseEndpoint('/api/v1/messages');
    this.notifications = new BaseEndpoint('/api/v1/notifications');
  }

  getThreads() { return this.threads.getAll(); }
  getMessages() { return this.messages.getAll(); }
  createMessage(payload) { return this.messages.create(payload); }
  getNotifications() { return this.notifications.getAll(); }
}

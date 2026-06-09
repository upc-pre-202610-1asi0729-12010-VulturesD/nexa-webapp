import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class CommunicationsApi {
  constructor() {
    this.threads = new BaseEndpoint('/api/v1/chat-threads', undefined, { useCoreBackend: false, useMockApi: true });
    this.messages = new BaseEndpoint('/api/v1/messages', undefined, { useCoreBackend: false, useMockApi: true });
    this.notifications = new BaseEndpoint('/api/v1/notifications', undefined, { useCoreBackend: false, useMockApi: true });
  }

  getThreads() { return this.threads.getAll(); }
  getMessages() { return this.messages.getAll(); }
  createMessage(payload) { return this.messages.create(payload); }
  getNotifications() { return this.notifications.getAll(); }
}

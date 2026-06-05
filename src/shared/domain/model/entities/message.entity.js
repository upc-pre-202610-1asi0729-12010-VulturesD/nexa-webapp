export class Message {
  constructor({ id = null, threadId = null, senderRole = '', senderName = '', body = '', createdAt = '' } = {}) {
    this.id = id;
    this.threadId = threadId;
    this.senderRole = senderRole;
    this.senderName = senderName;
    this.body = body;
    this.createdAt = createdAt;
  }
}

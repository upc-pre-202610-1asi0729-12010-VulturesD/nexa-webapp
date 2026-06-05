export class Notification {
  constructor({ id = null, userId = null, title = '', body = '', status = 'unread' } = {}) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.body = body;
    this.status = status;
  }
}

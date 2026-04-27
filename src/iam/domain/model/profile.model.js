export class Profile {
  constructor(data = {}) {
    this.id        = data.id        || '';
    this.name      = data.name      || '';
    this.email     = data.email     || '';
    this.role      = data.role      || '';
    this.company   = data.company   || '';
    this.phone     = data.phone     || '';
    this.initials  = data.initials  || this._initials(data.name);
    this.language  = data.language  || 'es';
    this.avatar    = data.avatar    || null;
    this.notifEnabled = data.notifEnabled !== undefined ? data.notifEnabled : true;
  }

  _initials(name = '') {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
  }
}

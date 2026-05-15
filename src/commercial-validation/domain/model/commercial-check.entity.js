export class CommercialCheck {
  constructor({ key = '', label = '', status = 'pending', note = '' } = {}) {
    this.key = key;
    this.label = label;
    this.status = status;
    this.note = note;
  }
}

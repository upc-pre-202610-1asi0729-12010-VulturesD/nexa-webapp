export class FeatureGate {
  constructor({ key = '', enabled = false, label = '' } = {}) {
    this.key = key;
    this.enabled = Boolean(enabled);
    this.label = label;
  }
}

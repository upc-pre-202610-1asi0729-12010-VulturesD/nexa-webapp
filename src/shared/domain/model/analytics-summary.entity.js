import { Entity } from '@/shared/domain/model/entity';

export class AnalyticsSummary extends Entity {
  constructor({
    id,
    type,
    message,
    severity = 'info',
    date,
    context = null,
  } = {}) {
    super({ id });
    this.type = type;
    this.message = message;
    this.severity = severity;
    this.date = date;
    this.context = context;
  }

  isCritical() {
    return this.severity === 'critical' || this.severity === 'error';
  }

  requiresAction() {
    return this.isCritical() || this.severity === 'warning';
  }
}

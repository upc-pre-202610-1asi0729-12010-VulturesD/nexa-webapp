import { Entity } from '@/shared/domain/model/entity';
import { DispatchStatus } from '../value-objects/dispatch-status.value-object';
import { PodEvidenceReference } from '../value-objects/pod-evidence-reference.value-object';

export class Dispatch extends Entity {
  constructor({
    id,
    orderId,
    clientId,
    status = 'ready',
    driver,
    vehicle,
    dest,
    tempExit = null,
    evidenceRequired = false,
    evidenceDone = false,
    checklist = [],
  } = {}) {
    super({ id });
    this.orderId = orderId;
    this.clientId = clientId;
    this.status = new DispatchStatus(status);
    this.driver = driver;
    this.vehicle = vehicle;
    this.dest = dest;
    this.tempExit = tempExit;
    this.evidenceRequired = Boolean(evidenceRequired);
    this.evidenceDone = Boolean(evidenceDone);
    this.checklist = checklist;
  }

  canStartRoute() {
    return this.status.value === 'ready' && this.checklist.length > 0;
  }

  needsPodEvidence() {
    return this.evidenceRequired && !this.evidenceDone;
  }

  closeDelivery(evidence = {}) {
    const podEvidence = evidence instanceof PodEvidenceReference ? evidence : new PodEvidenceReference(evidence);
    if (this.evidenceRequired && !podEvidence.isComplete()) {
      throw new Error('POD evidence is required to close delivery');
    }

    this.status = new DispatchStatus('delivered');
    this.evidenceDone = true;
  }
}

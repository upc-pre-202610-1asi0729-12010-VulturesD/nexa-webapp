export interface Dispatch {
  id: number;
  tenantId: number;
  orderId: number;
  clientAccountId: number;
  code: string;
  status: string;
  routeName: string;
  responsible: string;
  eta: string | null;
  deliveryWindow: string;
  createdAt: string;
  updatedAt: string;
  priority?: string;
  documentProgress?: string;
  coldType?: string;
  delayReason?: string;
  incidentNote?: string;
}

export interface DispatchEvent {
  id: number;
  tenantId: number;
  dispatchOrderId: number;
  status: string;
  description: string;
  visibleToBuyer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProofOfDelivery {
  id: number;
  tenantId: number;
  dispatchOrderId: number;
  receivedBy: string;
  completedAt: string;
  photoReference: boolean;
  signatureReference: boolean;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemperatureLog {
  id: number;
  tenantId: number;
  dispatchOrderId: number;
  orderId: number;
  celsius: number;
  zone: string;
  status: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DispatchDetail {
  dispatch: Dispatch;
  events: DispatchEvent[];
  proofs: ProofOfDelivery[];
  temperatures: TemperatureLog[];
}

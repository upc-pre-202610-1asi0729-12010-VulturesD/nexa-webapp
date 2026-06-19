export interface Dispatch {
  id: string; orderId: string; clientId: string;
  status: string;
  driver?: string; vehicle?: string; dest?: string;
  tempExit?: string | null;
  tempArrival?: string | null;
  evidenceRequired?: boolean; evidenceDone?: boolean;
  checklist?: string[];
  code?: string;
  coldType?: string;
  routeName?: string;
  eta?: string;
}

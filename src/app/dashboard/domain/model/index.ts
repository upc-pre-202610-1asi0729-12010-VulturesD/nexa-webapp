export interface Alert {
  id: string; type?: string;
  priority?: number | string;
  title: string; desc?: string;
  action?: string; screen?: string;
}

export interface ActivityEntry {
  id: string; time: string; text: string; type?: string;
}

export interface BusinessDocument {
  id: string;
  clientId: string;
  orderId: string;
  type: string;
  label: string;
  fileName: string;
  status: string;
  visibleToBuyer: boolean;
  required: boolean;
  dueDate: string;
  amount: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountLabel: string;
  visibility: string;
  status: string;
  productIds: string[];
  notes: string;
}

export interface CompanyUser {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  roles: string[];
  profile: string;
  scope: string;
  segment: string;
  workspace: string;
  clientId: string;
}

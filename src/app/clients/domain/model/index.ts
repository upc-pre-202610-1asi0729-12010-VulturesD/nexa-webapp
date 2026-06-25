export interface Client {
  id: string;
  backendId?: number;
  tenantId?: number;
  code?: string;
  name: string;
  businessName?: string;
  commercialName?: string;
  ruc?: string;
  taxId?: string;
  segment?: string;
  contact?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  deliveryAddress?: string;
  district?: string;
  province?: string;
  deliveryReference?: string;
  documentProfile?: string;
  condition?: string;
  paymentCondition?: string;
  creditLimit?: number;
  creditUsed?: number;
  monthlyCreditLimit?: number;
  monthlyCreditUsed?: number;
  monthlyCreditAvailable?: number;
  monthlyCreditStatus?: string;
  deliveryPreference?: string;
  portalAccess?: boolean;
  sellerWorkspaceEmail?: string;
  status?: string;
  type?: string;
  lastOrder?: string;
}

export interface ClientUpsert {
  code?: string;
  businessName: string;
  commercialName: string;
  taxId: string;
  segment: string;
  contact: string;
  contactEmail: string;
  phone: string;
  deliveryAddress: string;
  district: string;
  province: string;
  deliveryReference: string;
  documentProfile: string;
  paymentCondition: string;
  monthlyCreditLimit: number;
  monthlyCreditUsed: number;
  monthlyCreditStatus: string;
  deliveryPreference: string;
  portalAccess: boolean;
  sellerWorkspaceEmail: string;
  status: string;
}

export interface ClientFinancialProfile {
  id: number;
  tenantId: number;
  code: string;
  paymentCondition: string;
  monthlyCreditLimit: number;
  monthlyCreditUsed: number;
  monthlyCreditAvailable: number;
  monthlyCreditStatus: string;
  status: string;
}

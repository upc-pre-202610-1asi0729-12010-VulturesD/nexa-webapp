export interface OrganizationRegistrationForm {
  company: {
    legalName: string;
    tradeName: string;
    taxId: string;
    industrySector: string;
    companyMemberCount: number;
    companySize: string;
    country: string;
    website: string;
    logoPreview: string;
  };
  operation: {
    operationType: string;
    refrigeratedStorage: boolean;
    productCategories: string[];
    minTemperature: number | null;
    maxTemperature: number | null;
    monthlyVolume: string;
    deliveryCoverage: string;
    requiresTraceability: boolean;
    requiresTemperatureAlerts: boolean;
  };
  location: {
    facilityName: string;
    address: string;
    district: string;
    city: string;
    country: string;
    reference: string;
    warehouseCount: number;
    capacityEstimate: string;
    coldRoomsCount: number;
    fefoEnabled: boolean;
  };
  administrator: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    phonePrefix: string;
    phone: string;
    preferredLanguage: string;
    roleAfterApproval: string;
  };
  workspace: {
    workspaceName: string;
    workspaceSlug: string;
    emailDomain: string;
    plan: string;
    capabilities: string[];
    displayName: string;
    primaryColor: string;
    termsAccepted: boolean;
  };
}

export interface OrganizationRegistration {
  id: number;
  externalId: string;
  status: string;
  companyName: string;
  workspaceName: string;
  workspaceSlug: string;
  adminEmail: string;
  submittedAt: string;
}

export interface Tenant {
  id: number;
  name: string;
  legalName: string;
  slug: string;
  ruc: string;
  workspaceUrl: string;
  emailDomain?: string;
  plan: string;
  status: string;
  country: string;
}

export interface Workspace {
  id: number;
  tenantId: number;
  name: string;
  slug: string;
  url: string;
  emailDomain?: string;
  status: string;
  primaryWorkspace: boolean;
}

export interface WorkspaceFeature {
  id: number;
  workspaceId: number;
  code: string;
  name: string;
  enabled: boolean;
}

export interface WorkspacePreference {
  id: number;
  tenantId: number;
  workspaceId: number;
  key: string;
  value: string;
  valueType: string;
}

export interface WorkspaceSetup {
  tenant: Tenant;
  workspace: Workspace;
  capabilities: WorkspaceFeature[];
  preferences: WorkspacePreference[];
}

export interface TenantMember {
  id: number;
  tenantId: number;
  email: string;
  fullName: string;
  role: string;
  department: string;
  status: string;
  workspaceId?: number;
  userId?: number;
  portalAccess?: string;
  clientAccountId?: number | null;
}

export interface WorkspaceUser {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
}

export interface UserWorkspaceMembership {
  id: number;
  tenantId: number;
  workspaceId: number;
  userId: number;
  email: string;
  fullName: string;
  role: string;
  department: string;
  status: string;
  portalAccess: string;
  clientAccountId: number | null;
}

export interface TenantRule {
  id: number;
  tenantId: number;
  code: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export interface TenantCustomField {
  id: number;
  tenantId: number;
  code: string;
  label: string;
  targetResource: string;
  fieldType: string;
  required: boolean;
  enabled: boolean;
}

export interface TenantSubscription {
  id: number;
  tenantId: number;
  plan: string;
  seats: number;
  warehouses: number;
  paymentStatus: string;
  nextBillingDate: string | null;
  billingContact: string;
}

export interface CompanyAdministrationSnapshot {
  tenant: Tenant;
  workspaces: Workspace[];
  members: TenantMember[];
  memberships: UserWorkspaceMembership[];
  rules: TenantRule[];
  customFields: TenantCustomField[];
  subscriptions: TenantSubscription[];
  preferences: WorkspacePreference[];
  features: WorkspaceFeature[];
}

export type UpsertTenantMember = Omit<TenantMember, 'id'>;
export type UpsertTenantRule = Omit<TenantRule, 'id'>;
export type UpsertTenantCustomField = Omit<TenantCustomField, 'id'>;
export type UpsertTenantSubscription = Omit<TenantSubscription, 'id'>;
export type UpsertWorkspace = Omit<Workspace, 'id'>;
export type UpsertWorkspacePreference = Omit<WorkspacePreference, 'id'>;

export const TENANT_CAPABILITIES = [
  'catalog-management',
  'sales-requests',
  'warehouse-management',
  'inventory-lots',
  'logistics-dispatch',
  'temperature-logs',
  'invoicing-payments',
  'buyer-portal',
  'workspace-operations-setup',
  'business-documents',
  'promotions',
] as const;

export const PLAN_CAPABILITIES: Record<string, string[]> = {
  Starter: [...TENANT_CAPABILITIES.slice(0, 3)],
  Standard: [...TENANT_CAPABILITIES.slice(0, 5), 'buyer-portal', 'workspace-operations-setup'],
  Professional: [...TENANT_CAPABILITIES],
  Enterprise: [...TENANT_CAPABILITIES],
};

export const REGISTRATION_OPTIONS = {
  industrySectors: ['coldChainDistribution', 'refrigeratedStorage', 'frozenFoodDistribution', 'foodServiceSupplier', 'hospitalitySupplier', 'retailDistribution', 'seafoodMeatLogistics', 'thirdPartyColdStorage', 'mixedColdChain'],
  countries: ['peru', 'chile', 'colombia', 'ecuador', 'bolivia', 'brazil', 'argentina', 'mexico', 'unitedStates', 'canada', 'spain'],
  operationTypes: ['b2bColdChainDistributor', 'refrigeratedWarehouseOperator', 'foodServiceSupplier', 'thirdPartyColdStorage'],
  productCategories: ['dairy', 'meat', 'frozenFoods', 'freshProduce', 'seafood', 'gourmet'],
  volumeRanges: ['lt50', '50to200', '200to500', '500to2000', 'gt2000'],
  deliveryCoverages: ['limaMetropolitana', 'callao', 'limaCallao', 'limaNorthCallao', 'limaSouthCallao', 'regionalPeru'],
  cities: ['lima', 'callao', 'arequipa', 'trujillo', 'chiclayo', 'piura'],
  districts: ['losOlivos', 'sanIsidro', 'miraflores', 'ate', 'villaElSalvador', 'lurin', 'cercadoDeLima', 'callao', 'bellavista', 'laPerla', 'ventanilla'],
  capacities: ['lt100Pallets', '100to500Pallets', '500to2000Pallets', 'gt2000Pallets'],
  phonePrefixes: ['+51', '+56', '+57', '+593', '+591', '+55', '+54', '+52', '+1'],
  languages: ['es', 'en'],
  plans: ['Starter', 'Standard', 'Professional', 'Enterprise'],
} as const;

export function createRegistrationDraft(): OrganizationRegistrationForm {
  return {
    company: { legalName: '', tradeName: '', taxId: '', industrySector: '', companyMemberCount: 1, companySize: '1to10', country: 'peru', website: '', logoPreview: '' },
    operation: { operationType: '', refrigeratedStorage: false, productCategories: [], minTemperature: null, maxTemperature: null, monthlyVolume: '', deliveryCoverage: '', requiresTraceability: false, requiresTemperatureAlerts: false },
    location: { facilityName: '', address: '', district: '', city: '', country: 'peru', reference: '', warehouseCount: 1, capacityEstimate: '', coldRoomsCount: 0, fefoEnabled: false },
    administrator: { firstName: '', lastName: '', jobTitle: '', email: '', phonePrefix: '+51', phone: '', preferredLanguage: 'es', roleAfterApproval: 'CompanyOwner' },
    workspace: { workspaceName: '', workspaceSlug: '', emailDomain: '', plan: 'Starter', capabilities: [...PLAN_CAPABILITIES['Starter']], displayName: '', primaryColor: '#1d4ed8', termsAccepted: false },
  };
}

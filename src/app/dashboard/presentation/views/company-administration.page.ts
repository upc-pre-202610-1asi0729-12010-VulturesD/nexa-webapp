import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CompanyAdministrationStore } from '@app/tenant-management/application/company-administration.store';
import {
  TenantCustomField,
  TenantMember,
  TenantRule,
  TenantSubscription,
  Workspace,
} from '@app/tenant-management/domain/model';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

type Section = 'overview' | 'workspaces' | 'teammates' | 'rules' | 'customFields' | 'billing' | 'preferences';

const SECTIONS: { key: Section; query: string; icon: string }[] = [
  { key: 'overview', query: 'overview', icon: 'pi-th-large' },
  { key: 'workspaces', query: 'workspaces', icon: 'pi-building' },
  { key: 'teammates', query: 'teammates', icon: 'pi-users' },
  { key: 'rules', query: 'rules', icon: 'pi-shield' },
  { key: 'customFields', query: 'custom-fields', icon: 'pi-sliders-h' },
  { key: 'billing', query: 'billing', icon: 'pi-credit-card' },
  { key: 'preferences', query: 'preferences', icon: 'pi-cog' },
];

const EMPTY_MEMBER = { email: '', fullName: '', role: 'Logistics Manager', department: 'Operations', status: 'active' };
const EMPTY_RULE = { code: '', name: '', description: '', category: 'Logistics', enabled: true };
const EMPTY_FIELD = { code: '', label: '', targetResource: 'Product', fieldType: 'Text', required: false, enabled: true };
const EMPTY_WORKSPACE = { name: '', slug: '', url: '', emailDomain: '', status: 'active', primaryWorkspace: false };

@Component({
  selector: 'nx-company-administration',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    NexaIconComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './company-administration.page.html',
  styleUrl: './company-administration.page.scss',
})
export class CompanyAdministrationPage {
  readonly store = inject(CompanyAdministrationStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly sections = SECTIONS;
  readonly activeSection = signal<Section>('overview');
  readonly editing = signal<string | null>(null);
  readonly tenant = this.store.tenant;
  readonly workspaces = this.store.workspaces;
  readonly members = this.store.members;
  readonly rules = this.store.rules;
  readonly customFields = this.store.customFields;
  readonly subscription = this.store.subscription;
  readonly currentWorkspace = this.store.currentWorkspace;
  readonly setupProgress = this.store.setupProgress;
  readonly activeMembers = computed(() => this.members().filter((member) => member.status === 'active').length);
  readonly enabledRules = computed(() => this.rules().filter((rule) => rule.enabled).length);

  tenantDraft = { name: '', legalName: '', country: '' };
  workspaceDraft = { ...EMPTY_WORKSPACE };
  memberDraft = { ...EMPTY_MEMBER };
  memberPassword = '';
  ruleDraft = { ...EMPTY_RULE };
  fieldDraft = { ...EMPTY_FIELD };
  billingDraft = this.emptyBilling();
  preferenceDraft: Record<string, string | boolean | number> = {};
  editingId: number | null = null;

  readonly roleOptions = [
    { value: 'Company Owner', key: 'CompanyOwner' },
    { value: 'Logistics Manager', key: 'LogisticsManager' },
    { value: 'Sales', key: 'CommercialCoordinator' },
    { value: 'B2B Buyer', key: 'B2BBuyer' },
    { value: 'Viewer', key: 'Viewer' },
  ];
  readonly ruleCategories = [
    { value: 'Tenant', key: 'tenant' }, { value: 'Warehouse', key: 'warehouse' },
    { value: 'Logistics', key: 'logistics' }, { value: 'Dispatch', key: 'dispatch' },
    { value: 'Commercial', key: 'commercial' }, { value: 'Buyer Portal', key: 'buyerPortal' },
  ];
  readonly fieldTargets = ['Product', 'Warehouse', 'Purchase Request', 'Dispatch', 'Client'];
  readonly fieldTypes = ['Text', 'Number', 'Date', 'Boolean', 'Select'];
  readonly plans = ['Starter', 'Standard', 'Professional', 'Enterprise'];
  readonly preferenceGroups = [
    { key: 'regional', fields: ['language', 'timezone', 'country', 'currency', 'dateFormat'] },
    { key: 'units', fields: ['temperatureUnit', 'weightUnit', 'capacityUnit', 'palletUnit'] },
    { key: 'notifications', fields: ['temperatureAlerts', 'dispatchUpdates', 'purchaseRequestChanges', 'documentReminders'] },
    { key: 'behavior', fields: ['rememberWorkspace', 'showOnboardingChecklist', 'defaultDashboard', 'compactTables'] },
    { key: 'security', fields: ['requireCorporateEmail', 'sessionTimeout', 'auditTrail', 'buyerPortalApproval'] },
  ];
  readonly booleanPreferences = new Set([
    'temperatureAlerts', 'dispatchUpdates', 'purchaseRequestChanges', 'documentReminders',
    'rememberWorkspace', 'showOnboardingChecklist', 'compactTables', 'requireCorporateEmail',
    'auditTrail', 'buyerPortalApproval',
  ]);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const query = params.get('section') || 'overview';
      this.activeSection.set(SECTIONS.find((section) => section.query === query)?.key ?? 'overview');
    });
    this.store.load();
  }

  selectSection(section: Section): void {
    const query = SECTIONS.find((item) => item.key === section)?.query ?? section;
    void this.router.navigate([], { relativeTo: this.route, queryParams: { section: query }, queryParamsHandling: 'merge' });
    this.cancelEdit();
  }

  beginTenantEdit(): void {
    const tenant = this.tenant();
    if (!tenant) return;
    this.tenantDraft = { name: tenant.name, legalName: tenant.legalName, country: tenant.country };
    this.editing.set('tenant');
  }

  saveTenant(): void {
    this.store.updateTenant(this.tenantDraft);
    this.cancelEdit();
  }

  beginWorkspace(workspace?: Workspace): void {
    this.editingId = workspace?.id ?? null;
    this.workspaceDraft = workspace ? {
      name: workspace.name,
      slug: workspace.slug,
      url: workspace.url,
      emailDomain: workspace.emailDomain ?? '',
      status: workspace.status,
      primaryWorkspace: workspace.primaryWorkspace,
    } : { ...EMPTY_WORKSPACE };
    this.editing.set('workspace');
  }

  saveWorkspace(): void {
    const tenant = this.tenant();
    if (!tenant) return;
    const slug = this.workspaceDraft.slug.trim().toLowerCase();
    this.store.saveWorkspace({
      tenantId: tenant.id,
      ...this.workspaceDraft,
      slug,
      url: this.workspaceDraft.url || `${slug}.nexa.com.pe`,
    }, this.editingId ?? undefined);
    this.cancelEdit();
  }

  beginMember(member?: TenantMember): void {
    this.editingId = member?.id ?? null;
    this.memberDraft = member ? {
      email: member.email,
      fullName: member.fullName,
      role: member.role,
      department: member.department,
      status: member.status,
    } : { ...EMPTY_MEMBER };
    this.memberPassword = '';
    this.editing.set('member');
  }

  saveMember(): void {
    const tenant = this.tenant();
    if (!tenant) return;
    this.store.saveMember({ tenantId: tenant.id, ...this.memberDraft }, this.editingId ?? undefined, this.memberPassword);
    this.cancelEdit();
  }

  beginRule(rule?: TenantRule): void {
    this.editingId = rule?.id ?? null;
    this.ruleDraft = rule ? {
      code: rule.code,
      name: rule.name,
      description: rule.description,
      category: rule.category,
      enabled: rule.enabled,
    } : { ...EMPTY_RULE };
    this.editing.set('rule');
  }

  saveRule(): void {
    const tenant = this.tenant();
    if (!tenant) return;
    const code = this.ruleDraft.code || this.slugify(this.ruleDraft.name);
    this.store.saveRule({ tenantId: tenant.id, ...this.ruleDraft, code }, this.editingId ?? undefined);
    this.cancelEdit();
  }

  toggleRule(rule: TenantRule): void {
    const { id, ...resource } = rule;
    this.store.saveRule({ ...resource, enabled: !rule.enabled }, id);
  }

  beginCustomField(field?: TenantCustomField): void {
    this.editingId = field?.id ?? null;
    this.fieldDraft = field ? {
      code: field.code,
      label: field.label,
      targetResource: field.targetResource,
      fieldType: field.fieldType,
      required: field.required,
      enabled: field.enabled,
    } : { ...EMPTY_FIELD };
    this.editing.set('customField');
  }

  saveCustomField(): void {
    const tenant = this.tenant();
    if (!tenant) return;
    const code = this.fieldDraft.code || this.slugify(this.fieldDraft.label);
    this.store.saveCustomField({ tenantId: tenant.id, ...this.fieldDraft, code }, this.editingId ?? undefined);
    this.cancelEdit();
  }

  beginBilling(): void {
    this.billingDraft = this.subscription() ? { ...this.subscription()! } : this.emptyBilling();
    this.editing.set('billing');
  }

  saveBilling(): void {
    const tenant = this.tenant();
    if (!tenant) return;
    const { id: _id, ...resource } = { ...this.billingDraft, tenantId: tenant.id };
    this.store.saveBilling(resource);
    this.cancelEdit();
  }

  beginPreferences(): void {
    this.preferenceDraft = Object.fromEntries(this.preferenceGroups.flatMap((group) => group.fields).map((key) => {
      const fallback = this.booleanPreferences.has(key) ? false : '';
      const value = this.store.preference(key, String(fallback));
      return [key, this.booleanPreferences.has(key) ? value === 'true' : value];
    }));
    this.editing.set('preferences');
  }

  savePreferences(): void {
    this.store.savePreferences(this.preferenceDraft);
    this.cancelEdit();
  }

  preferenceValue(key: string): string {
    const value = this.store.preference(key, this.booleanPreferences.has(key) ? 'false' : '—');
    return this.booleanPreferences.has(key) ? (value === 'true' ? 'common.yes' : 'common.no') : value;
  }

  memberInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  }

  roleKey(role: string): string {
    return this.roleOptions.find((option) => option.value === role)?.key ?? role.replaceAll(' ', '');
  }

  categoryKey(category: string): string {
    return this.ruleCategories.find((option) => option.value === category)?.key ?? category;
  }

  optionKey(value: string): string {
    return value.charAt(0).toLowerCase() + value.slice(1).replaceAll(' ', '');
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.editingId = null;
  }

  private emptyBilling(): TenantSubscription {
    return { id: 0, tenantId: 0, plan: 'Standard', seats: 0, warehouses: 1, paymentStatus: 'review_active', nextBillingDate: null, billingContact: '' };
  }

  private slugify(value: string): string {
    return `${value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;
  }
}

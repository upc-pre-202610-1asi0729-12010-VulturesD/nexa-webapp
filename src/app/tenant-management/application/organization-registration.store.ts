import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import {
  OrganizationRegistration,
  OrganizationRegistrationForm,
  PLAN_CAPABILITIES,
  REGISTRATION_OPTIONS,
  createRegistrationDraft,
} from '@app/tenant-management/domain/model';
import { TenantManagementApi } from '@app/tenant-management/infrastructure/tenant-management-api';

const SUBMITTED_REGISTRATION_KEY = 'nexa.organization-registration';
const PERSONAL_EMAIL_DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];

export type RegistrationSection = keyof OrganizationRegistrationForm;

@Injectable({ providedIn: 'root' })
export class OrganizationRegistrationStore {
  private readonly api = inject(TenantManagementApi);

  readonly form = signal<OrganizationRegistrationForm>(createRegistrationDraft());
  readonly currentStep = signal(0);
  readonly steps = ['company', 'operation', 'location', 'administrator', 'workspace', 'review'];
  readonly options = REGISTRATION_OPTIONS;
  readonly errors = signal<Record<string, string>>({});
  readonly submitting = signal(false);
  readonly slugAvailability = signal<{ status: 'idle' | 'checking' | 'available' | 'unavailable' | 'error'; suggestions: string[] }>({ status: 'idle', suggestions: [] });
  readonly workspaceUrl = computed(() => `${this.form().workspace.workspaceSlug || 'workspace'}.nexa.com.pe`);

  update(section: RegistrationSection, field: string, value: unknown): void {
    this.form.update((current) => {
      const next: OrganizationRegistrationForm = {
        company: { ...current.company },
        operation: { ...current.operation, productCategories: [...current.operation.productCategories] },
        location: { ...current.location },
        administrator: { ...current.administrator },
        workspace: { ...current.workspace, capabilities: [...current.workspace.capabilities] },
      };
      (next[section] as unknown as Record<string, unknown>)[field] = value;
      if (section === 'company' && field === 'companyMemberCount') {
        const count = Number(value);
        next.company.companySize = count <= 10 ? '1to10' : count <= 25 ? '11to25' : count <= 50 ? '26to50' : '51to100';
      }
      if (section === 'company' && field === 'legalName' && !current.company.tradeName) next.company.tradeName = String(value ?? '');
      if (section === 'company' && field === 'website' && !current.workspace.emailDomain) next.workspace.emailDomain = this.emailDomain(String(value ?? ''));
      if (section === 'workspace' && field === 'workspaceName' && !current.workspace.workspaceSlug) next.workspace.workspaceSlug = this.normalizeSlug(String(value ?? ''));
      if (section === 'workspace' && field === 'workspaceSlug') {
        next.workspace.workspaceSlug = this.normalizeSlug(String(value ?? ''));
        this.slugAvailability.set({ status: 'idle', suggestions: [] });
      }
      if (section === 'workspace' && field === 'plan') next.workspace.capabilities = [...(PLAN_CAPABILITIES[String(value)] ?? [])];
      return next;
    });
  }

  toggleCategory(category: string, checked: boolean): void {
    const categories = this.form().operation.productCategories;
    const next = checked ? [...new Set([...categories, category])] : categories.filter((item) => item !== category);
    this.update('operation', 'productCategories', next);
  }

  setLogo(file: File | null): void {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.errors.update((errors) => ({ ...errors, logoPreview: 'tenant.registration.validation.logoSize' }));
      return;
    }
    this.update('company', 'logoPreview', URL.createObjectURL(file));
  }

  checkSlug(): void {
    const slug = this.form().workspace.workspaceSlug;
    if (!this.validSlug(slug)) {
      this.slugAvailability.set({ status: 'idle', suggestions: [] });
      return;
    }
    this.slugAvailability.set({ status: 'checking', suggestions: [] });
    this.api.tenantPreview(slug).subscribe({
      next: () => this.slugAvailability.set({ status: 'unavailable', suggestions: [`${slug}-peru`, `${slug}-sac`, `${slug}-lima`] }),
      error: (error: HttpErrorResponse) => this.slugAvailability.set(error.status === 404
        ? { status: 'available', suggestions: [] }
        : { status: 'error', suggestions: [] }),
    });
  }

  next(): boolean {
    if (!this.validateCurrentStep()) return false;
    this.currentStep.update((step) => Math.min(step + 1, this.steps.length - 1));
    return true;
  }

  previous(): void {
    this.errors.set({});
    this.currentStep.update((step) => Math.max(0, step - 1));
  }

  submit(): Observable<OrganizationRegistration> | null {
    if (!this.validateCurrentStep()) return null;
    this.submitting.set(true);
    return this.api.createRegistration(this.form()).pipe(
      tap((registration) => {
        try { sessionStorage.setItem(SUBMITTED_REGISTRATION_KEY, JSON.stringify(registration)); } catch { /* ignore */ }
      }),
      finalize(() => this.submitting.set(false)),
    );
  }

  submittedRegistration(): OrganizationRegistration | null {
    try {
      const raw = sessionStorage.getItem(SUBMITTED_REGISTRATION_KEY);
      return raw ? JSON.parse(raw) as OrganizationRegistration : null;
    } catch {
      return null;
    }
  }

  private validateCurrentStep(): boolean {
    const errors: Record<string, string> = {};
    const form = this.form();
    const required = (value: unknown) => String(value ?? '').trim().length > 0;
    const addRequired = (field: string, value: unknown) => { if (!required(value)) errors[field] = 'tenant.registration.validation.required'; };

    if (this.currentStep() === 0 || this.currentStep() === 5) {
      if (form.company.legalName.trim().length < 3) errors['legalName'] = 'tenant.registration.validation.legalName';
      addRequired('taxId', form.company.taxId);
      addRequired('industrySector', form.company.industrySector);
      addRequired('country', form.company.country);
      if (form.company.companyMemberCount < 1 || form.company.companyMemberCount > 100) errors['companyMemberCount'] = 'tenant.registration.validation.companyMemberCount';
      if (form.company.country === 'peru' && !/^(10|15|17|20)\d{9}$/.test(form.company.taxId)) errors['taxId'] = 'tenant.registration.validation.taxId';
      if (form.company.website && !/^https?:\/\/.+\..+/.test(form.company.website)) errors['website'] = 'tenant.registration.validation.website';
    }
    if (this.currentStep() === 1 || this.currentStep() === 5) {
      addRequired('operationType', form.operation.operationType);
      addRequired('monthlyVolume', form.operation.monthlyVolume);
      addRequired('deliveryCoverage', form.operation.deliveryCoverage);
      if (!form.operation.productCategories.length) errors['productCategories'] = 'tenant.registration.validation.productCategories';
      const min = form.operation.minTemperature;
      const max = form.operation.maxTemperature;
      if (min === null || max === null || min < -30 || max > 20 || min >= max) errors['temperatureRange'] = 'tenant.registration.validation.temperatureRange';
    }
    if (this.currentStep() === 2 || this.currentStep() === 5) {
      addRequired('facilityName', form.location.facilityName);
      addRequired('address', form.location.address);
      addRequired('district', form.location.district);
      addRequired('city', form.location.city);
      addRequired('capacityEstimate', form.location.capacityEstimate);
      if (form.location.warehouseCount < 1 || form.location.warehouseCount > 10) errors['warehouseCount'] = 'tenant.registration.validation.warehouseCount';
      if (form.location.coldRoomsCount < 0 || form.location.coldRoomsCount > 50) errors['coldRoomsCount'] = 'tenant.registration.validation.coldRoomsCount';
    }
    if (this.currentStep() === 3 || this.currentStep() === 5) {
      ['firstName', 'lastName', 'jobTitle', 'email', 'phone'].forEach((field) => addRequired(field, form.administrator[field as keyof typeof form.administrator]));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.administrator.email)) errors['email'] = 'tenant.registration.validation.email';
      if (this.personalEmail(form.administrator.email)) errors['email'] = 'tenant.registration.validation.personalEmail';
      if (form.administrator.phone && !/^\+?[\d\s-]{7,18}$/.test(form.administrator.phone)) errors['phone'] = 'tenant.registration.validation.phone';
    }
    if (this.currentStep() === 4 || this.currentStep() === 5) {
      addRequired('workspaceName', form.workspace.workspaceName);
      if (!this.validSlug(form.workspace.workspaceSlug)) errors['workspaceSlug'] = 'tenant.registration.validation.slug';
      if (this.slugAvailability().status !== 'available') errors['workspaceSlug'] = this.slugAvailability().status === 'error'
        ? 'tenant.registration.validation.slugCheck'
        : 'tenant.registration.validation.slugUnavailable';
      addRequired('plan', form.workspace.plan);
    }
    if (this.currentStep() === 5 && !form.workspace.termsAccepted) errors['termsAccepted'] = 'tenant.registration.validation.terms';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private normalizeSlug(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
  }

  private validSlug(value: string): boolean {
    return /^(?!-)[a-z0-9-]{3,63}(?<!-)$/.test(value);
  }

  private personalEmail(email: string): boolean {
    return PERSONAL_EMAIL_DOMAINS.includes(email.split('@')[1]?.toLowerCase() ?? '');
  }

  private emailDomain(website: string): string {
    try { return new URL(website).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
  }
}

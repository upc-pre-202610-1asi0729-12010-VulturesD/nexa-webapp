import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, switchMap } from 'rxjs';
import { IamStore } from '@app/iam/application/iam.store';
import {
  CompanyAdministrationSnapshot,
  Tenant,
  TenantCustomField,
  TenantMember,
  TenantRule,
  TenantSubscription,
  UpsertTenantCustomField,
  UpsertTenantMember,
  UpsertTenantRule,
  UpsertTenantSubscription,
  UpsertWorkspace,
  Workspace,
  WorkspacePreference,
  UserWorkspaceMembership,
} from '@app/tenant-management/domain/model';
import { TenantManagementApi } from '@app/tenant-management/infrastructure/tenant-management-api';

@Injectable({ providedIn: 'root' })
export class CompanyAdministrationStore {
  private readonly api = inject(TenantManagementApi);
  private readonly session = inject(IamStore);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly tenant = signal<Tenant | null>(null);
  readonly workspaces = signal<Workspace[]>([]);
  readonly members = signal<TenantMember[]>([]);
  readonly rules = signal<TenantRule[]>([]);
  readonly customFields = signal<TenantCustomField[]>([]);
  readonly subscription = signal<TenantSubscription | null>(null);
  readonly preferences = signal<WorkspacePreference[]>([]);
  readonly features = signal<CompanyAdministrationSnapshot['features']>([]);
  readonly currentWorkspace = computed(() => {
    const workspaceId = this.session.user()?.workspaceId;
    return this.workspaces().find((workspace) => workspace.id === workspaceId)
      ?? this.workspaces().find((workspace) => workspace.primaryWorkspace)
      ?? this.workspaces()[0]
      ?? null;
  });
  readonly setupProgress = computed(() => {
    const features = this.features();
    return features.length ? Math.round(features.filter((feature) => feature.enabled).length / features.length * 100) : 0;
  });

  load(): void {
    const user = this.session.user();
    if (!user?.tenantId || !user.workspaceId) {
      this.loading.set(false);
      this.error.set('tenant.companyAdmin.errors.scope');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.companyAdministration(user.tenantId, user.workspaceId).subscribe({
      next: (snapshot) => {
        this.tenant.set(snapshot.tenant);
        this.workspaces.set(snapshot.workspaces);
        this.members.set(snapshot.memberships.length
          ? snapshot.memberships.map((membership) => this.memberFromMembership(membership))
          : snapshot.members);
        this.rules.set(snapshot.rules);
        this.customFields.set(snapshot.customFields);
        this.subscription.set(snapshot.subscriptions[0] ?? null);
        this.preferences.set(snapshot.preferences);
        this.features.set(snapshot.features);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('tenant.companyAdmin.errors.load');
      },
    });
  }

  updateTenant(patch: Partial<Omit<Tenant, 'id'>>): void {
    const tenant = this.tenant();
    if (!tenant) return;
    const { id, ...current } = tenant;
    this.run(this.api.updateTenant(id, { ...current, ...patch }), (saved) => this.tenant.set(saved));
  }

  saveWorkspace(resource: UpsertWorkspace, id?: number): void {
    this.run(id ? this.api.updateWorkspace(id, resource) : this.api.createWorkspace(resource), (saved) => {
      this.workspaces.update((rows) => id ? rows.map((row) => row.id === id ? saved : row) : [saved, ...rows]);
    });
  }

  saveMember(resource: UpsertTenantMember, id?: number, password = ''): void {
    const existing = id ? this.members().find((member) => member.id === id) : null;
    if (existing?.workspaceId && existing.userId) {
      this.run(this.api.updateMembership(id!, {
        tenantId: resource.tenantId,
        workspaceId: existing.workspaceId,
        userId: existing.userId,
        email: resource.email,
        fullName: resource.fullName,
        role: resource.role,
        department: resource.department,
        status: resource.status,
        portalAccess: resource.role === 'B2B Buyer' ? 'buyer' : 'internal',
        clientAccountId: existing.clientAccountId ?? null,
      }), (saved) => this.members.update((rows) => rows.map((row) => row.id === id ? this.memberFromMembership(saved) : row)));
      return;
    }
    if (id) {
      this.run(this.api.updateMember(id, resource), (saved) => {
        this.members.update((rows) => rows.map((row) => row.id === id ? saved : row));
      });
      return;
    }
    const workspace = this.currentWorkspace();
    if (!workspace || !password) {
      this.error.set('tenant.companyAdmin.errors.password');
      return;
    }
    const username = resource.email.split('@')[0];
    const request = this.api.createWorkspaceUser({
      username,
      email: resource.email,
      password,
      role: resource.role,
      fullName: resource.fullName,
    }).pipe(
      switchMap((user) => this.api.createMembership({
        tenantId: resource.tenantId,
        workspaceId: workspace.id,
        userId: user.id,
        email: resource.email,
        fullName: resource.fullName,
        role: resource.role,
        department: resource.department,
        status: resource.status,
        portalAccess: resource.role === 'B2B Buyer' ? 'buyer' : 'internal',
        clientAccountId: null,
      })),
    );
    this.run(request, (saved) => this.members.update((rows) => [this.memberFromMembership(saved), ...rows]));
  }

  deactivateMember(member: TenantMember): void {
    const { id, ...resource } = member;
    this.saveMember({ ...resource, status: 'disabled' }, id);
  }

  saveRule(resource: UpsertTenantRule, id?: number): void {
    this.run(id ? this.api.updateRule(id, resource) : this.api.createRule(resource), (saved) => {
      this.rules.update((rows) => id ? rows.map((row) => row.id === id ? saved : row) : [saved, ...rows]);
    });
  }

  deleteRule(id: number): void {
    this.run(this.api.deleteRule(id), () => this.rules.update((rows) => rows.filter((row) => row.id !== id)));
  }

  saveCustomField(resource: UpsertTenantCustomField, id?: number): void {
    this.run(id ? this.api.updateCustomField(id, resource) : this.api.createCustomField(resource), (saved) => {
      this.customFields.update((rows) => id ? rows.map((row) => row.id === id ? saved : row) : [saved, ...rows]);
    });
  }

  deleteCustomField(id: number): void {
    this.run(this.api.deleteCustomField(id), () => this.customFields.update((rows) => rows.filter((row) => row.id !== id)));
  }

  saveBilling(resource: UpsertTenantSubscription): void {
    const id = this.subscription()?.id;
    this.run(this.api.saveSubscription(resource, id), (saved) => this.subscription.set(saved));
  }

  savePreferences(values: Record<string, string | boolean | number>): void {
    const tenant = this.tenant();
    const workspace = this.currentWorkspace();
    if (!tenant || !workspace) return;
    const current = new Map(this.preferences().map((row) => [row.key, row]));
    const requests = Object.entries(values).map(([key, value]) => {
      const row = current.get(key);
      return this.api.savePreference({
        tenantId: tenant.id,
        workspaceId: workspace.id,
        key,
        value: String(value),
        valueType: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
      }, row?.id);
    });
    this.run(forkJoin(requests), (saved) => {
      const merged = new Map(this.preferences().map((row) => [row.key, row]));
      saved.forEach((row) => merged.set(row.key, row));
      this.preferences.set([...merged.values()]);
    });
  }

  preference(key: string, fallback = ''): string {
    return this.preferences().find((row) => row.key === key)?.value ?? fallback;
  }

  private run<T>(request: import('rxjs').Observable<T>, success: (value: T) => void): void {
    this.saving.set(true);
    this.error.set(null);
    request.subscribe({
      next: (value) => { success(value); this.saving.set(false); },
      error: () => { this.error.set('tenant.companyAdmin.errors.save'); this.saving.set(false); },
    });
  }

  private memberFromMembership(membership: UserWorkspaceMembership): TenantMember {
    return {
      id: membership.id,
      tenantId: membership.tenantId,
      workspaceId: membership.workspaceId,
      userId: membership.userId,
      email: membership.email,
      fullName: membership.fullName,
      role: membership.role,
      department: membership.department,
      status: membership.status,
      portalAccess: membership.portalAccess,
      clientAccountId: membership.clientAccountId,
    };
  }
}

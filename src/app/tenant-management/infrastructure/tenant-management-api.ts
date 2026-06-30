import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import {
  CompanyAdministrationSnapshot,
  OrganizationRegistration,
  OrganizationRegistrationForm,
  Tenant,
  Workspace,
  WorkspaceFeature,
  WorkspacePreference,
  WorkspaceSetup,
  TenantMember,
  TenantRule,
  TenantCustomField,
  TenantSubscription,
  UpsertTenantMember,
  UpsertTenantRule,
  UpsertTenantCustomField,
  UpsertTenantSubscription,
  UpsertWorkspace,
  UpsertWorkspacePreference,
  UserWorkspaceMembership,
  WorkspaceUser,
} from '@app/tenant-management/domain/model';

@Injectable({ providedIn: 'root' })
export class TenantManagementApi {
  private readonly http = inject(HttpClient);

  createRegistration(form: OrganizationRegistrationForm): Observable<OrganizationRegistration> {
    const externalId = `org-reg-${Date.now().toString(36)}`;
    return this.http.post<OrganizationRegistration>('api/v1/organization-registrations', {
      id: externalId,
      status: 'pending_review',
      company: { legalName: form.company.legalName },
      workspace: { workspaceName: form.workspace.workspaceName, workspaceSlug: form.workspace.workspaceSlug },
      administrator: { email: form.administrator.email },
      operation: form.operation,
      location: form.location,
      registrationProfile: form,
    });
  }

  registration(externalId: string): Observable<OrganizationRegistration> {
    return this.http.get<OrganizationRegistration>(`api/v1/organization-registrations/${externalId}`);
  }

  tenantPreview(slug: string): Observable<{ name: string; slug: string; workspaceUrl: string; plan: string; status: string }> {
    return this.http.get<{ name: string; slug: string; workspaceUrl: string; plan: string; status: string }>(`api/v1/tenants/preview/${slug}`);
  }

  workspaceSetup(slug: string): Observable<WorkspaceSetup> {
    return forkJoin({
      tenants: this.http.get<Tenant[]>('api/v1/tenants'),
      workspace: this.http.get<Workspace>('api/v1/workspaces', { params: { slug } }),
    }).pipe(
      switchMap(({ tenants, workspace }) => {
        const tenant = tenants.find((candidate) => candidate.id === workspace.tenantId || candidate.slug === workspace.slug);
        if (!tenant) throw new Error('Current tenant was not found.');
        return forkJoin({
          capabilities: this.http.get<WorkspaceFeature[]>('api/v1/workspace-features', { params: { workspaceId: workspace.id } }),
          preferences: this.http.get<WorkspacePreference[]>('api/v1/workspace-preferences', { params: { workspaceId: workspace.id } }),
        }).pipe(map(({ capabilities, preferences }) => ({ tenant, workspace, capabilities, preferences })));
      }),
    );
  }

  companyAdministration(tenantId: number, workspaceId: number): Observable<CompanyAdministrationSnapshot> {
    return forkJoin({
      tenant: this.http.get<Tenant>(`api/v1/tenants/${tenantId}`),
      workspaces: this.http.get<Workspace[]>('api/v1/workspaces', { params: { tenantId } }),
      members: this.http.get<TenantMember[]>('api/v1/tenant-members', { params: { tenantId } }),
      memberships: this.http.get<UserWorkspaceMembership[]>('api/v1/user-workspace-memberships', { params: { workspaceId } }),
      rules: this.http.get<TenantRule[]>('api/v1/tenant-rules', { params: { tenantId } }),
      customFields: this.http.get<TenantCustomField[]>('api/v1/tenant-custom-fields', { params: { tenantId } }),
      subscriptions: this.http.get<TenantSubscription[]>('api/v1/tenant-subscriptions', { params: { tenantId } }),
      preferences: this.http.get<WorkspacePreference[]>('api/v1/workspace-preferences', { params: { workspaceId } }),
      features: this.http.get<WorkspaceFeature[]>('api/v1/workspace-features', { params: { workspaceId } }),
    });
  }

  updateTenant(id: number, resource: Omit<Tenant, 'id'>): Observable<Tenant> {
    return this.http.put<Tenant>(`api/v1/tenants/${id}`, resource);
  }

  createWorkspace(resource: UpsertWorkspace): Observable<Workspace> {
    return this.http.post<Workspace>('api/v1/workspaces', resource);
  }

  updateWorkspace(id: number, resource: UpsertWorkspace): Observable<Workspace> {
    return this.http.put<Workspace>(`api/v1/workspaces/${id}`, resource);
  }

  createMember(resource: UpsertTenantMember): Observable<TenantMember> {
    return this.http.post<TenantMember>('api/v1/tenant-members', resource);
  }

  updateMember(id: number, resource: UpsertTenantMember): Observable<TenantMember> {
    return this.http.put<TenantMember>(`api/v1/tenant-members/${id}`, resource);
  }

  createWorkspaceUser(resource: { username: string; email: string; password: string; role: string; fullName: string }): Observable<WorkspaceUser> {
    return this.http.post<WorkspaceUser>('api/v1/users', resource);
  }

  createMembership(resource: Omit<UserWorkspaceMembership, 'id'>): Observable<UserWorkspaceMembership> {
    return this.http.post<UserWorkspaceMembership>('api/v1/user-workspace-memberships', resource);
  }

  updateMembership(id: number, resource: Omit<UserWorkspaceMembership, 'id'>): Observable<UserWorkspaceMembership> {
    return this.http.put<UserWorkspaceMembership>(`api/v1/user-workspace-memberships/${id}`, resource);
  }

  createRule(resource: UpsertTenantRule): Observable<TenantRule> {
    return this.http.post<TenantRule>('api/v1/tenant-rules', resource);
  }

  updateRule(id: number, resource: UpsertTenantRule): Observable<TenantRule> {
    return this.http.put<TenantRule>(`api/v1/tenant-rules/${id}`, resource);
  }

  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`api/v1/tenant-rules/${id}`);
  }

  createCustomField(resource: UpsertTenantCustomField): Observable<TenantCustomField> {
    return this.http.post<TenantCustomField>('api/v1/tenant-custom-fields', resource);
  }

  updateCustomField(id: number, resource: UpsertTenantCustomField): Observable<TenantCustomField> {
    return this.http.put<TenantCustomField>(`api/v1/tenant-custom-fields/${id}`, resource);
  }

  deleteCustomField(id: number): Observable<void> {
    return this.http.delete<void>(`api/v1/tenant-custom-fields/${id}`);
  }

  saveSubscription(resource: UpsertTenantSubscription, id?: number): Observable<TenantSubscription> {
    return id
      ? this.http.put<TenantSubscription>(`api/v1/tenant-subscriptions/${id}`, resource)
      : this.http.post<TenantSubscription>('api/v1/tenant-subscriptions', resource);
  }

  savePreference(resource: UpsertWorkspacePreference, id?: number): Observable<WorkspacePreference> {
    return id
      ? this.http.put<WorkspacePreference>(`api/v1/workspace-preferences/${id}`, resource)
      : this.http.post<WorkspacePreference>('api/v1/workspace-preferences', resource);
  }
}

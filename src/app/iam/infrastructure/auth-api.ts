import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '@app/iam/domain/model/user.model';
import { RoleKey } from '@app/iam/domain/model/role-key.model';

interface PlatformUserResponse {
  id: number;
  fullName: string;
  displayName?: string;
  email: string;
  roles: string[];
  profile?: string;
  scope?: string;
  segment?: string;
  workspace?: string;
  clientId?: string | null;
  tenantId?: number | null;
  workspaceId?: number | null;
  workspaceSlug?: string | null;
  clientAccountId?: number | null;
  phone?: string;
  preferredLanguage?: string;
  criticalNotificationsEnabled?: boolean;
}

export interface UpdateCurrentProfile {
  fullName: string;
  email: string;
  phone: string;
  preferredLanguage: 'en' | 'es';
  criticalNotificationsEnabled: boolean;
}

interface PlatformAuthResponse {
  token: string;
  tokenType: string;
  user: PlatformUserResponse;
}

/**
 * Infrastructure adapter for the IAM bounded context.
 *
 * Aligned with the User EventStorming:
 *  - Handles the `AuthenticateUser` command (see domain/commands/authenticate-user.command.ts).
 *  - On a found user, the orchestration layer (login page + IamStore) produces
 *    `UserIdentityVerified` and `UserLoggedIn` events.
 *  - On no match, it produces `UserIdentityVerificationFailed` / `LoginFailed`.
 * Domain events live in `iam/domain/events/` as pure type artifacts.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  login(email: string, password: string, workspaceSlug?: string): Observable<User | null> {
    return this.http.post<PlatformAuthResponse>('api/v1/auth/login', { email, password, workspaceSlug }).pipe(
      map((response) => this.fromPlatform(response)),
    );
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<void> {
    return this.http.post<void>('api/v1/profile/password-changes', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }

  currentProfile(): Observable<User> {
    return this.http.get<PlatformUserResponse>('api/v1/users/me').pipe(
      map((response) => this.fromUserResponse(response)),
    );
  }

  updateCurrentProfile(resource: UpdateCurrentProfile): Observable<User> {
    return this.http.put<PlatformUserResponse>('api/v1/users/me', resource).pipe(
      map((response) => this.fromUserResponse(response)),
    );
  }

  private fromPlatform(response: PlatformAuthResponse): User {
    return { ...this.fromUserResponse(response.user), token: response.token };
  }

  private fromUserResponse(user: PlatformUserResponse): User {
    const roleKey = this.roleKey(user.roles, user.profile, user.scope);
    const displayName = user.displayName || user.fullName;
    return {
      id: String(user.id),
      name: displayName,
      email: user.email,
      role: roleKey,
      scope: user.scope === 'portal' || roleKey === 'buyer' ? 'portal' : 'ops',
      roleKey,
      roleName: this.roleName(roleKey),
      department: this.department(roleKey),
      initials: this.initials(displayName),
      clientId: user.clientId ?? (roleKey === 'buyer' ? 'CLI-001' : null),
      tenantId: user.tenantId ?? null,
      workspaceId: user.workspaceId ?? null,
      workspaceSlug: user.workspaceSlug ?? null,
      clientAccountId: user.clientAccountId ?? null,
      phone: user.phone ?? '',
      preferredLanguage: user.preferredLanguage === 'es' ? 'es' : 'en',
      criticalNotificationsEnabled: user.criticalNotificationsEnabled !== false,
    };
  }

  private roleKey(roles: string[], profile?: string, scope?: string): RoleKey {
    if (roles.includes('ROLE_ADMIN')) return 'owner';
    if (profile === 'viewer' || roles.includes('ROLE_VIEWER')) return 'viewer';
    if (scope === 'portal' || profile === 'buyer' || roles.includes('ROLE_BUYER')) return 'buyer';
    if (profile === 'logistics' || profile === 'warehouse' || roles.includes('ROLE_LOGISTICS') || roles.includes('ROLE_WAREHOUSE') || roles.includes('ROLE_OPERATOR')) return 'logistics';
    if (profile === 'commercial' || roles.includes('ROLE_SALES')) return 'commercial';
    if (roles.includes('ROLE_BUYER')) return 'buyer';
    if (roles.includes('ROLE_OPERATOR')) return 'logistics';
    return 'commercial';
  }

  private roleName(role: RoleKey): string {
    if (role === 'owner') return 'Company Owner';
    if (role === 'viewer') return 'Viewer';
    if (role === 'buyer') return 'B2B Buyer';
    if (role === 'logistics') return 'Logistics';
    return 'Sales';
  }

  private department(role: RoleKey): string {
    if (role === 'owner') return 'Company Administration';
    if (role === 'viewer') return 'Read only';
    if (role === 'buyer') return 'Purchasing';
    if (role === 'logistics') return 'Logistics';
    return 'Sales';
  }

  private initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  }
}

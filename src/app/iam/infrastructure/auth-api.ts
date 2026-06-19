import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
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
  private static readonly WORKSPACE_EMAILS = new Set([
    'sales@nexa.com',
    'logistics@nexa.com',
    'buyer@nexa.com',
  ]);

  login(email: string, password: string): Observable<User | null> {
    return this.http.post<PlatformAuthResponse>('api/v1/auth/login', { email, password }).pipe(
      map((response) => this.fromPlatform(response)),
    );
  }

  workspaceUsers(): Observable<User[]> {
    return this.http.get<PlatformUserResponse[]>('api/v1/users').pipe(
      map((raw) => raw
        .filter((u) => AuthApi.WORKSPACE_EMAILS.has(u.email))
        .map((u) => this.fromUserResponse(u))),
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
    };
  }

  private roleKey(roles: string[], profile?: string, scope?: string): RoleKey {
    if (scope === 'portal' || profile === 'buyer' || roles.includes('ROLE_BUYER')) return 'buyer';
    if (profile === 'logistics' || profile === 'warehouse' || roles.includes('ROLE_LOGISTICS') || roles.includes('ROLE_WAREHOUSE') || roles.includes('ROLE_OPERATOR')) return 'logistics';
    if (profile === 'commercial' || roles.includes('ROLE_SALES') || roles.includes('ROLE_ADMIN')) return 'commercial';
    if (roles.includes('ROLE_BUYER')) return 'buyer';
    if (roles.includes('ROLE_OPERATOR')) return 'logistics';
    return 'commercial';
  }

  private roleName(role: RoleKey): string {
    if (role === 'buyer') return 'B2B Buyer';
    if (role === 'logistics') return 'Logistics';
    return 'Sales';
  }

  private department(role: RoleKey): string {
    if (role === 'buyer') return 'Purchasing';
    if (role === 'logistics') return 'Logistics';
    return 'Sales';
  }

  private initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  }
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthApi } from '@app/iam/infrastructure/auth-api';
import { User } from '@app/iam/domain/model/user.model';

const STORAGE_KEY = 'nexa.session';
const SOURCE_STORAGE_KEYS = ['nexa.user', 'nexa.token', 'nexa.scope'];

/**
 * Application-layer service for the IAM / User bounded context.
 *
 * Maps to the User EventStorming as follows:
 *  - `set(user)` corresponds to producing `UserLoggedIn` (and implicit `RoleAssigned`
 *    via `user.roleKey`).
 *  - `clear()` corresponds to handling `LogoutUser` and producing `UserLoggedOut`.
 * Domain commands/events are declared as pure TS types under iam/domain/{commands,events}.
 */
@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly auth = inject(AuthApi);
  private readonly _user = signal<User | null>(this.read());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly roleKey = computed(() => this._user()?.roleKey ?? null);

  set(user: User): void {
    this.clearStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem('nexa.user', JSON.stringify(user));
    localStorage.setItem('nexa.scope', user.scope);
    if (user.token) localStorage.setItem('nexa.token', user.token);
    this._user.set(user);
  }

  login(email: string, password: string) {
    return this.auth.login(email, password);
  }

  clear(): void {
    this.clearStorage();
    this._user.set(null);
  }

  private read(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('nexa.user');
      const user = raw ? (JSON.parse(raw) as User) : null;
      return user?.roleKey === 'buyer' || user?.roleKey === 'commercial' || user?.roleKey === 'logistics' ? user : null;
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
    for (const key of SOURCE_STORAGE_KEYS) localStorage.removeItem(key);
  }
}

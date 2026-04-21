import { Injectable, computed, signal } from '@angular/core';
import { User } from '@app/iam/domain/model/user.model';

const STORAGE_KEY = 'nexa.session';

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
  private readonly _user = signal<User | null>(this.read());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly roleKey = computed(() => this._user()?.roleKey ?? null);

  set(user: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
  }

  private read(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}

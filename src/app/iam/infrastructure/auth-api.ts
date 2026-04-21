import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '@app/iam/domain/model/user.model';

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

  login(email: string, password: string): Observable<User | null> {
    return this.http
      .get<User[]>('api/v1/users')
      .pipe(
        map(
          (list) =>
            list.find(
              (u) =>
                u.email.toLowerCase() === email.toLowerCase() &&
                u.password === password,
            ) ?? null,
        ),
      );
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '@app/iam/domain/model/user.model';
import { AuthApi } from '@app/iam/infrastructure/auth-api';

@Injectable({ providedIn: 'root' })
export class WorkspaceUsersStore {
  private readonly auth = inject(AuthApi);

  readonly users = signal<User[]>([]);

  load(): void {
    this.auth.workspaceUsers().pipe(catchError(() => of([] as User[]))).subscribe((users) => {
      this.users.set(users);
    });
  }
}

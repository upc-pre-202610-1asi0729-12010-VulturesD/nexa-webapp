import { Injectable, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompanyUser } from '@app/dashboard/domain/model';
import { DashboardApi } from '@app/dashboard/infrastructure/dashboard-api';

@Injectable({ providedIn: 'root' })
export class CompanyAdministrationStore {
  private readonly api = inject(DashboardApi);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly users = signal<CompanyUser[]>([]);

  readonly company = {
    legalName: 'Importaciones y Comercio Internacional S.A.',
    name: 'Nexa',
    country: 'Peru',
    subscriptionPlan: 'Enterprise Cold-Chain Plan',
    seats: '12 Seats',
  };

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.users().pipe(catchError(() => of([] as CompanyUser[]))).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load team access roster.');
        this.loading.set(false);
      },
    });
  }
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '@app/catalog/domain/model';
import { Promotion } from '@app/dashboard/domain/model';
import { DashboardApi } from '@app/dashboard/infrastructure/dashboard-api';

@Injectable({ providedIn: 'root' })
export class PromotionsStore {
  private readonly api = inject(DashboardApi);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly promotions = signal<Promotion[]>([]);
  readonly productsCount = signal<number>(0);
  readonly activeCount = computed(() => this.promotions().filter(p => p.status === 'active').length);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      promotions: this.api.promotions().pipe(catchError(() => of([] as Promotion[]))),
      products: this.api.products().pipe(catchError(() => of([] as Product[]))),
    }).subscribe({
      next: ({ promotions, products }) => {
        this.promotions.set(promotions);
        this.productsCount.set(products.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load promotions campaigns.');
        this.loading.set(false);
      },
    });
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Category, Product } from '@app/catalog/domain/model';
import { ProductsApi } from '@app/catalog/infrastructure/products-api';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly api = inject(ProductsApi);

  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  load(): void {
    this.loading.set(true);
    forkJoin({ products: this.api.list(), categories: this.api.categories() }).subscribe({
      next: ({ products, categories }) => {
        this.products.set(products);
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

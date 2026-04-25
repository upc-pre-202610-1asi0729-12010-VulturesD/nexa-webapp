import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, Product } from '@app/catalog/domain/model';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Product[]>('api/v1/products'); }
  categories() { return this.http.get<Category[]>('api/v1/categories'); }
}

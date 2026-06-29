import { Injectable, computed, signal } from '@angular/core';
import { Product } from '@app/catalog/domain/model';

export interface PortalCartItem {
  productId: string;
  name: string;
  sku?: string;
  qty: number;
  price: number;
  unit?: string;
  cat?: string;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class PortalCartStore {
  private readonly itemsState = signal<PortalCartItem[]>([]);
  readonly items = this.itemsState.asReadonly();
  readonly isOpen = signal(false);
  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.qty, 0));
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.qty * item.price, 0));

  add(product: Product): void {
    const id = String(product.id ?? product.productId ?? product.catalogItemId);
    const current = this.items();
    const existing = current.find((item) => item.productId === id);
    if (existing) {
      this.itemsState.set(current.map((item) => item.productId === id ? { ...item, qty: item.qty + 1 } : item));
      return;
    }

    this.itemsState.set([
      ...current,
      {
        productId: id,
        name: product.name,
        sku: product.sku,
        qty: 1,
        price: product.price,
        unit: product.unit,
        cat: product.cat,
        imageUrl: product.imageUrl,
      },
    ]);
  }

  remove(productId: string): void {
    this.itemsState.set(this.items().filter((item) => item.productId !== productId));
  }

  setQty(productId: string, qty: number): void {
    if (qty <= 0) {
      this.remove(productId);
      return;
    }
    this.itemsState.set(this.items().map((item) => item.productId === productId ? { ...item, qty } : item));
  }

  clear(): void {
    this.itemsState.set([]);
  }

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  close(): void {
    this.isOpen.set(false);
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrdersApi } from '../../infrastructure/orders-api';
import { Client } from '@app/clients/domain/model';
import { Order, OrderItem } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { IamStore } from '@app/iam/application/iam.store';

interface DraftLine {
  productId: string;
  qty: number;
  price: number;
  name: string;
  unit?: string;
  max: number;
}

@Component({
  selector: 'nx-order-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <button class="btn btn-ghost btn-sm" (click)="router.navigate(['/orders'])"><i class="pi pi-arrow-left"></i> Pedidos</button>
        <div style="flex:1">
          <div class="page-title">Crear pedido</div>
          <div class="page-subtitle">Nexa Cold Chain Distribution</div>
        </div>
      </div>

      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:14px"></div></div>
      } @else if (loadError()) {
        <div class="banner banner-danger"><i class="pi pi-exclamation-triangle"></i><span>{{ loadError() }}</span></div>
      } @else {
        <div class="stepper">
          @for (s of steps; track s; let idx = $index) {
            <div class="step-item" [class.step-active]="step() === idx + 1" [class.step-done]="step() > idx + 1" [class.step-pending]="step() < idx + 1">
              <div class="step-circle">
                @if (step() > idx + 1) { <i class="pi pi-check"></i> } @else { <span>{{ idx + 1 }}</span> }
              </div>
              <div class="step-label">{{ s }}</div>
            </div>
            @if (idx < steps.length - 1) {
              <div class="step-connector" [class.step-connector-done]="step() > idx + 1" [class.step-connector-pending]="step() <= idx + 1"></div>
            }
          }
        </div>

        @if (step() === 1) {
          <div>
            <div class="card-title" style="margin-bottom:12px">Selecciona el cliente</div>
            <div class="order-client-grid">
              <div style="display:flex;flex-direction:column;gap:10px">
                @for (c of clients(); track c.id) {
                  <button class="card card-pad client-select-card" [class.selected]="selectedClient()?.id === c.id" (click)="pickClient(c)">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                      <div style="text-align:left">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
                          <div style="font-weight:600;font-size:14px">{{ c.name }}</div>
                          @if (selectedClient()?.id === c.id) { <i class="pi pi-check-circle" style="color:#2563EB;font-size:14px"></i> }
                        </div>
                        <div style="font-size:12px;color:#6B7280;margin-top:4px">{{ c.contact }} · {{ c.phone }}</div>
                        <div style="font-size:11px;color:#9CA3AF;margin-top:6px">{{ c.address }}</div>
                      </div>
                      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                        <span [class]="'badge ' + (c.status === 'active' ? 'badge-green' : 'badge-orange')">{{ c.status === 'active' ? 'Activo' : 'Observado' }}</span>
                        <span style="font-size:10px;color:#9CA3AF">{{ c.type }}</span>
                      </div>
                    </div>
                  </button>
                }
              </div>

              <div style="position:sticky;top:24px">
                @if (!selectedClient()) {
                  <div class="card card-pad" style="text-align:center;color:#9CA3AF">
                    <div style="font-size:32px;margin-bottom:12px"><i class="pi pi-user"></i></div>
                    <div style="font-size:13px">Selecciona un cliente para ver sus condiciones comerciales</div>
                  </div>
                } @else {
                  <div class="card card-pad" style="margin-bottom:12px">
                    <div style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px;display:flex;align-items:center;gap:5px">
                      <i class="pi pi-file-edit"></i> Condiciones comerciales
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
                      <span style="color:#6B7280">Condición de pago</span>
                      <span style="font-weight:600">{{ selectedClient()?.condition }}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
                      <span style="color:#6B7280">Tipo de cliente</span>
                      <span style="font-weight:600">{{ selectedClient()?.type }}</span>
                    </div>
                    <div class="divider" style="margin:10px 0"></div>
                    @if (selectedClient()?.creditLimit) {
                      <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;margin-bottom:6px">Crédito</div>
                      <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:4px">
                        <span>Utilizado: S/ {{ selectedClient()?.creditUsed || 0 | number:'1.0-0' }}</span>
                        <span>Límite: S/ {{ selectedClient()?.creditLimit || 0 | number:'1.0-0' }}</span>
                      </div>
                      <div class="credit-bar-wrap" style="margin-bottom:6px">
                        <div class="credit-bar" [style.width.%]="creditPercent(selectedClient())" [style.background]="creditColor(selectedClient())"></div>
                      </div>
                      @if (isCreditBlocked()) {
                        <div class="banner banner-danger" style="margin-top:8px"><i class="pi pi-times-circle"></i><div>Crédito agotado. El pedido quedará bloqueado hasta regularizar.</div></div>
                      } @else if (creditPercent(selectedClient()) >= 80) {
                        <div class="banner banner-warning" style="margin-top:8px"><i class="pi pi-exclamation-triangle"></i><div>Crédito al {{ creditPercent(selectedClient()) }}%. Verifica antes de confirmar.</div></div>
                      }
                    } @else {
                      <div style="font-size:12px;color:#6B7280;display:flex;align-items:center;gap:5px">
                        <i class="pi pi-credit-card"></i> Cliente al contado
                      </div>
                    }
                  </div>
                  <button class="btn btn-primary" style="width:100%;justify-content:center" [disabled]="isCreditBlocked()" (click)="proceedToProducts()">
                    Continuar <i class="pi pi-arrow-right"></i>
                  </button>
                }
              </div>
            </div>
          </div>
        }

        @if (step() === 2) {
          <div>
            <div class="card-title" style="margin-bottom:12px">Agregar productos para {{ selectedClient()?.name }}</div>
            <div class="grid-2" style="align-items:start">
              <div class="card" style="overflow:hidden">
                <div class="card-header"><span class="card-title">Catálogo</span></div>
                <table class="data-table">
                  <thead><tr><th>Producto</th><th>Disp.</th><th>Precio</th><th></th></tr></thead>
                  <tbody>
                    @for (p of orderableProducts(); track p.id) {
                      <tr>
                        <td>
                          <div style="font-weight:500;font-size:13px">{{ p.name }}</div>
                          <div class="mono" style="font-size:10px">{{ p.sku }}</div>
                        </td>
                        <td style="font-size:12px;color:#6B7280">{{ available(p) }} {{ p.unit }}</td>
                        <td style="font-weight:600">S/ {{ p.price | number:'1.2-2' }}</td>
                        <td><button class="btn btn-secondary btn-sm" (click)="addLine(p)" [disabled]="available(p) <= 0"><i class="pi pi-plus"></i></button></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="card card-pad" style="position:sticky;top:24px">
                <div class="card-title" style="margin-bottom:12px">Resumen ({{ lines().length }} ítems)</div>
                @if (!lines().length) {
                  <div class="empty-state" style="padding:24px">
                    <div class="empty-state-icon"><i class="pi pi-shopping-cart"></i></div>
                    <div class="empty-state-title">Sin productos aún</div>
                    <div class="empty-state-desc">Selecciona productos del catálogo para construir el pedido</div>
                  </div>
                } @else {
                  @for (l of lines(); track l.productId; let i = $index) {
                    <div style="display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #F3F0EC">
                      <div style="flex:1">
                        <div style="font-size:13px;font-weight:500">{{ l.name }}</div>
                        <div style="font-size:11px;color:#9CA3AF">S/ {{ l.price | number:'1.2-2' }} / {{ l.unit }} · max {{ l.max }}</div>
                      </div>
                      <input type="number" [ngModel]="l.qty" (ngModelChange)="setQty(i, $event)" [max]="l.max" min="1" class="qty-input" />
                      <button class="btn btn-ghost btn-sm" (click)="removeLine(l.productId)"><i class="pi pi-trash"></i></button>
                    </div>
                  }
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:12px">
                    <span style="color:#6B7280">Subtotal</span><span>S/ {{ subtotal() | number:'1.2-2' }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;margin-top:8px;padding-top:12px;border-top:2px solid #E5E7EB">
                    <span>Total</span><span>S/ {{ total() | number:'1.2-2' }}</span>
                  </div>
                  @if (hasInvalidLines()) {
                    <div class="banner banner-danger" style="margin-top:12px">
                      <i class="pi pi-exclamation-triangle"></i>
                      <div>Ajusta cantidades: deben ser mayores a 0 y no pueden superar stock disponible.</div>
                    </div>
                  }
                  <button class="btn btn-primary" style="width:100%;margin-top:16px;justify-content:center" [disabled]="hasInvalidLines()" (click)="step.set(3)">
                    Continuar a entrega
                  </button>
                }
              </div>
            </div>
          </div>
        }

        @if (step() === 3) {
          <div class="card card-pad" style="max-width:560px">
            <div class="card-title" style="margin-bottom:16px">Información de entrega</div>
            <div class="field" style="margin-bottom:14px">
              <div class="field-label">Fecha de entrega</div>
              <div class="field-input"><i class="pi pi-calendar"></i><input type="date" [(ngModel)]="deliveryDate" /></div>
            </div>
            <div class="field" style="margin-bottom:14px">
              <div class="field-label">Dirección</div>
              <div class="field-input"><i class="pi pi-map-marker"></i><input type="text" [(ngModel)]="deliveryAddress" /></div>
            </div>
            <div class="field" style="margin-bottom:14px">
              <div class="field-label">Prioridad</div>
              <div class="field-input"><i class="pi pi-flag"></i>
                <select [(ngModel)]="priority"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select>
              </div>
            </div>
            <div class="field" style="margin-bottom:14px">
              <div class="field-label">Notas (opcional)</div>
              <div class="field-input" style="align-items:flex-start"><i class="pi pi-pencil" style="margin-top:2px"></i>
                <textarea [(ngModel)]="notes" rows="3" style="border:none;outline:none;font-size:13px;flex:1;background:transparent;resize:none" placeholder="Instrucciones para el repartidor..."></textarea>
              </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:20px">
              <button class="btn btn-ghost" (click)="step.set(2)"><i class="pi pi-arrow-left"></i> Volver</button>
              <button class="btn btn-primary" style="flex:1;justify-content:center" [disabled]="!deliveryDate || !deliveryAddress" (click)="step.set(4)">Continuar a confirmación</button>
            </div>
          </div>
        }

        @if (step() === 4) {
          <div class="grid-2" style="align-items:start">
            <div class="card card-pad">
              <div class="card-title" style="margin-bottom:12px">Cliente</div>
              <div style="font-weight:600">{{ selectedClient()?.name }}</div>
              <div style="font-size:12px;color:#6B7280">{{ selectedClient()?.contact }}</div>
              <div style="font-size:12px;color:#6B7280;margin-top:8px">{{ deliveryAddress }}</div>
              <div class="divider"></div>
              <div class="card-title" style="margin-bottom:12px">Items</div>
              @for (l of lines(); track l.productId) {
                <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0">
                  <span>{{ l.qty }} × {{ l.name }}</span>
                  <span style="font-weight:600">S/ {{ l.qty * l.price | number:'1.2-2' }}</span>
                </div>
              }
              <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;margin-top:12px;padding-top:12px;border-top:2px solid #E5E7EB">
                <span>Total</span><span>S/ {{ total() | number:'1.2-2' }}</span>
              </div>
            </div>
            <div class="card card-pad">
              <div class="card-title" style="margin-bottom:12px">Detalles de entrega</div>
              <div style="font-size:13px"><strong>Fecha:</strong> {{ deliveryDate }}</div>
              <div style="font-size:13px;margin-top:4px"><strong>Prioridad:</strong> {{ priority }}</div>
              @if (notes) { <div style="font-size:13px;margin-top:4px"><strong>Notas:</strong> {{ notes }}</div> }
              <div class="banner banner-info" style="margin-top:16px">
                <i class="pi pi-info-circle"></i>
                <div>El pedido entrará en estado <strong>En validación</strong>. Stock y condiciones se revisarán antes de confirmar.</div>
              </div>
              @if (submitError()) {
                <div class="banner banner-danger"><i class="pi pi-times-circle"></i><span>{{ submitError() }}</span></div>
              }
              <div style="display:flex;gap:8px;margin-top:16px">
                <button class="btn btn-ghost" (click)="step.set(3)"><i class="pi pi-arrow-left"></i> Volver</button>
                <button class="btn btn-primary" style="flex:1;justify-content:center" (click)="confirm()" [disabled]="submitting() || hasInvalidLines()">
                  @if (submitting()) { <i class="pi pi-spin pi-spinner"></i> Guardando... } @else { <i class="pi pi-check"></i> Confirmar pedido }
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class OrderNewPage {
  private readonly api = inject(OrdersApi);
  private readonly session = inject(IamStore);
  readonly router = inject(Router);

  readonly steps = ['Cliente', 'Productos', 'Entrega', 'Confirmar'];
  readonly step = signal(1);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly clients = signal<Client[]>([]);
  readonly products = signal<Product[]>([]);
  readonly existingOrders = signal<Order[]>([]);
  readonly lines = signal<DraftLine[]>([]);
  readonly selectedClientId = signal<string>('');

  readonly today = new Date().toISOString().slice(0, 10);
  deliveryDate = this.tomorrowISO();
  deliveryAddress = '';
  priority = 'medium';
  notes = '';

  readonly selectedClient = computed(() => this.clients().find((c) => c.id === this.selectedClientId()) ?? null);
  readonly subtotal = computed(() => this.lines().reduce((sum, l) => sum + l.price * l.qty, 0));
  readonly total = computed(() => this.subtotal());
  readonly hasInvalidLines = computed(() => this.lines().some((l) => !l.qty || l.qty < 1 || l.qty > l.max));

  constructor() {
    forkJoin({
      clients: this.api.clients(),
      products: this.api.products(),
      orders: this.api.list(),
    }).subscribe({
      next: ({ clients, products, orders }) => {
        this.clients.set(clients);
        this.products.set(products);
        this.existingOrders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar catálogo/clientes. Inicia la Fake API local con npm run dev:all.');
        this.loading.set(false);
      },
    });
  }

  private tomorrowISO(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  pickClient(c: Client): void {
    this.selectedClientId.set(c.id);
    this.deliveryAddress = c.address || '';
  }

  proceedToProducts(): void {
    if (!this.selectedClient() || this.isCreditBlocked()) return;
    this.step.set(2);
  }

  isCreditBlocked(): boolean {
    const c = this.selectedClient();
    return !!c?.creditLimit && (c.creditUsed || 0) >= c.creditLimit;
  }

  creditPercent(c: Client | null): number {
    if (!c?.creditLimit) return 0;
    return Math.min(100, Math.round(((c.creditUsed || 0) / c.creditLimit) * 100));
  }

  creditColor(c: Client | null): string {
    const pct = this.creditPercent(c);
    return pct >= 100 ? '#EF4444' : pct >= 80 ? '#F97316' : '#22C55E';
  }

  available(p: Product): number { return Math.max(0, (p.stock || 0) - (p.reserved || 0)); }

  orderableProducts(): Product[] { return this.products().filter((p) => p.status !== 'out'); }

  addLine(p: Product): void {
    const max = this.available(p);
    if (!max) return;
    const current = this.lines();
    const existing = current.find((l) => l.productId === p.id);
    if (existing) {
      this.lines.set(current.map((l) => l.productId === p.id ? { ...l, qty: Math.min(l.qty + 1, l.max) } : l));
      return;
    }
    this.lines.set([...current, { productId: p.id, qty: 1, price: p.price, name: p.name, unit: p.unit, max }]);
  }

  removeLine(id: string): void {
    this.lines.set(this.lines().filter((l) => l.productId !== id));
  }

  setQty(index: number, value: number | string): void {
    const qty = Number(value) || 0;
    this.lines.set(this.lines().map((l, i) => i === index ? { ...l, qty } : l));
  }

  private nextId(): string {
    const year = new Date().getFullYear();
    const re = /^ORD-(\d{4})-(\d{4})$/;
    const max = this.existingOrders().reduce((m, o) => {
      const x = re.exec(o.id);
      return x ? Math.max(m, Number(x[2])) : m;
    }, 0);
    return `ORD-${year}-${String(max + 1).padStart(4, '0')}`;
  }

  confirm(): void {
    this.submitError.set(null);
    const c = this.selectedClient();
    if (!c || !this.lines().length || this.hasInvalidLines()) return;

    const items: OrderItem[] = this.lines().map((l) => ({
      productId: l.productId,
      qty: l.qty,
      price: l.price,
      stockOk: l.qty <= l.max,
    }));
    const order: Order = {
      id: this.nextId(),
      clientId: c.id,
      status: 'validating',
      priority: this.priority,
      date: this.today,
      items,
      total: this.total(),
      notes: this.notes || '',
      deliveryDate: this.deliveryDate,
    };
    const user = this.session.user();
    const payload = {
      ...order,
      source: 'assisted_order',
      createdBy: user?.id || null,
      createdByName: user?.name || '',
      createdByRole: user?.roleName || '',
      createdByRoleKey: user?.roleKey || '',
    } as Order;

    this.submitting.set(true);
    this.api.create(payload).subscribe({
      next: (saved) => {
        this.submitting.set(false);
        this.router.navigate(['/orders', saved.id || order.id]);
      },
      error: (e) => {
        this.submitting.set(false);
        const code = e?.status ?? 0;
        if (code === 404 || code === 405 || code === 0) {
          this.submitError.set('La creación requiere Fake API local. Inicia npm run dev:all y reintenta.');
        } else {
          this.submitError.set(`No se pudo crear el pedido (HTTP ${code}).`);
        }
      },
    });
  }
}

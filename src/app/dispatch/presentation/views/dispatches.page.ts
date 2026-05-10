import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DispatchesApi } from '../../infrastructure/dispatches-api';
import { Client } from '@app/clients/domain/model';
import { Dispatch } from '@app/dispatch/domain/model';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';

type PodForm = {
  tempArrival: string;
  notes: string;
  photoConfirmed: boolean;
  clientSigned: boolean;
};

@Component({
  selector: 'nx-dispatches',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page">
    <div class="page-header" role="banner">
      <div>
        <div class="page-title">{{ 'nav.dispatch' | t }}</div>
        <div class="page-subtitle">{{ dispatches().length }} {{ 'dispatch.subtitle' | t }}</div>
      </div>
      <button class="btn btn-secondary" disabled title="Disponible en AV2">
        <i class="pi pi-plus" aria-hidden="true"></i> {{ 'dispatch.schedule' | t }}
      </button>
    </div>

    @if (loadError()) {
      <div class="banner banner-danger">
        <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
        <div>No se pudieron cargar los despachos. Inicia la Fake API local con npm run dev:all.</div>
      </div>
    }

    @if (loading()) {
      <div class="grid-3" style="margin-bottom:20px">
        <div class="card kpi-card"><div class="skeleton" style="height:70px"></div></div>
        <div class="card kpi-card"><div class="skeleton" style="height:70px"></div></div>
        <div class="card kpi-card"><div class="skeleton" style="height:70px"></div></div>
      </div>
      <div class="grid-2">
        <div class="card card-pad"><div class="skeleton" style="height:250px"></div></div>
        <div class="card card-pad"><div class="skeleton" style="height:250px"></div></div>
      </div>
    } @else if (dispatches().length === 0) {
      <div class="empty-state">
        <div class="empty-state-icon"><i class="pi pi-truck"></i></div>
        <div class="empty-state-title">Sin despachos activos</div>
        <div class="empty-state-text">Los despachos programados aparecerán en esta vista.</div>
      </div>
    } @else {
      <div class="grid-3" style="margin-bottom:20px" role="region" aria-label="KPIs despacho">
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B" aria-hidden="true"></i> {{ 'dispatch.kpi.ready' | t }}</div>
          <div class="kpi-value" style="color:#F59E0B">{{ countByStatus('ready') }}</div>
          <div class="kpi-sub">{{ 'dispatch.kpi.readySub' | t }}</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-send" style="color:#2563EB" aria-hidden="true"></i> {{ 'dispatch.kpi.transit' | t }}</div>
          <div class="kpi-value" style="color:#2563EB">{{ countByStatus('in_transit') }}</div>
          <div class="kpi-sub">{{ 'dispatch.kpi.transitSub' | t }}</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-check-circle" style="color:#22C55E" aria-hidden="true"></i> {{ 'dispatch.kpi.delivered' | t }}</div>
          <div class="kpi-value" style="color:#22C55E">{{ countByStatus('delivered') }}</div>
          <div class="kpi-sub">{{ 'dispatch.kpi.deliveredSub' | t }}</div>
        </div>
      </div>

      <div class="grid-2">
        @for (d of dispatches(); track d.id) {
          <div class="card card-pad">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
              <div>
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
                  <span class="mono" style="font-size:13px;color:#374151">{{ d.id }}</span>
                  <span class="badge" [class]="statusBadge(d.status)">{{ statusLabel(d.status) }}</span>
                </div>
                <div style="font-size:13px;font-weight:500">{{ clientName(d.clientId) }}</div>
                <div style="font-size:12px;color:#6B7280">Pedido <span class="mono">{{ d.orderId }}</span></div>
              </div>
              <button class="btn btn-ghost btn-sm" aria-label="Opciones">
                <i class="pi pi-ellipsis-v" aria-hidden="true"></i>
              </button>
            </div>

            <div class="divider" style="margin:0 0 14px"></div>

            <div style="display:flex;flex-direction:column;gap:8px;font-size:12px">
              <div style="display:flex;gap:8px"><i class="pi pi-user" style="color:#9CA3AF" aria-hidden="true"></i><span>{{ d.driver }}</span></div>
              <div style="display:flex;gap:8px"><i class="pi pi-truck" style="color:#9CA3AF" aria-hidden="true"></i><span>{{ d.vehicle }}</span></div>
              <div style="display:flex;gap:8px"><i class="pi pi-map-marker" style="color:#9CA3AF" aria-hidden="true"></i><span>{{ d.dest }}</span></div>
              @if (d.tempExit) {
                <div style="display:flex;gap:8px"><i class="pi pi-thermometer" style="color:#2563EB" aria-hidden="true"></i><span class="mono">{{ d.tempExit }}°C salida</span></div>
              }
            </div>

            <div class="divider" style="margin:14px 0"></div>

            <div class="card-title" style="margin-bottom:8px;font-size:12px">{{ 'dispatch.checklist' | t }}</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              @for (item of d.checklist ?? []; track item) {
                <div style="display:flex;gap:8px;align-items:center;font-size:12px;color:#374151">
                  <i class="pi pi-check-circle" style="color:#22C55E" aria-hidden="true"></i> {{ item }}
                </div>
              }
            </div>

            @if (d.evidenceRequired) {
              <div style="margin-top:14px" [class]="d.evidenceDone ? 'banner banner-success' : 'banner banner-warning'">
                <i [class]="d.evidenceDone ? 'pi pi-check' : 'pi pi-camera'" aria-hidden="true"></i>
                <div>{{ d.evidenceDone ? ('dispatch.evidenceDone' | t) : ('dispatch.evidencePending' | t) }}</div>
              </div>
            }

            <div style="display:flex;gap:8px;margin-top:14px">
              @if (d.status === 'ready') {
                <button class="btn btn-primary btn-sm" style="flex:1;justify-content:center" (click)="markInRoute(d)">
                  <i class="pi pi-send" aria-hidden="true"></i> {{ 'dispatch.markInRoute' | t }}
                </button>
              }
              @if (d.status === 'in_transit') {
                <button class="btn btn-success btn-sm" style="flex:1;justify-content:center" (click)="openPod(d)">
                  <i class="pi pi-check" aria-hidden="true"></i> {{ 'dispatch.confirmDelivery' | t }}
                </button>
              }
              @if (d.status === 'delivered') {
                <button class="btn btn-ghost btn-sm" style="flex:1;justify-content:center" disabled>
                  <i class="pi pi-check-circle" aria-hidden="true"></i> {{ 'dispatch.deliveredBtn' | t }}
                </button>
              }
              <button class="btn btn-ghost btn-sm" (click)="goOrderDetail(d.orderId)">
                <i class="pi pi-eye" aria-hidden="true"></i> {{ 'dispatch.detail' | t }}
              </button>
            </div>
          </div>
        }
      </div>
    }
    </div>

    @if (podDispatch()) {
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Registro de entrega" tabindex="-1" (keydown.escape)="closePod()">
        <div class="card card-pad" style="max-width:480px;width:100%;margin:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div class="card-title">Registro de entrega — {{ podDispatch()?.id }}</div>
            <button class="btn btn-ghost btn-sm" (click)="closePod()" aria-label="Cerrar modal">
              <i class="pi pi-times" aria-hidden="true"></i>
            </button>
          </div>

          <div class="banner banner-warning" style="margin-bottom:16px">
            <i class="pi pi-info-circle" aria-hidden="true"></i>
            <div>Completa foto y firma para registrar la entrega.</div>
          </div>

          @if (podError()) {
            <div class="field-error" style="margin-bottom:12px">{{ podError() }}</div>
          }

          <div class="field" style="margin-bottom:14px">
            <label class="field-label" for="pod-temp">Temperatura de llegada (°C)</label>
            <div class="field-input">
              <input id="pod-temp" type="number" placeholder="-18.0" [(ngModel)]="podForm.tempArrival" step="0.1" />
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px">
            <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer">
              <input type="checkbox" [(ngModel)]="podForm.photoConfirmed" />
              Foto del producto entregado capturada
            </label>
            <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer">
              <input type="checkbox" [(ngModel)]="podForm.clientSigned" />
              Firma del cliente obtenida
            </label>
          </div>

          <div class="field" style="margin-bottom:20px">
            <label class="field-label" for="pod-notes">Notas (opcional)</label>
            <div class="field-input">
              <textarea id="pod-notes" [(ngModel)]="podForm.notes" rows="3" placeholder="Observaciones de la entrega..." style="resize:vertical"></textarea>
            </div>
          </div>

          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn btn-ghost btn-sm" (click)="closePod()">Cancelar</button>
            <button class="btn btn-primary btn-sm" (click)="submitPod()">
              <i class="pi pi-check" aria-hidden="true"></i> Registrar entrega
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DispatchesPage {
  private readonly api = inject(DispatchesApi);
  private readonly router = inject(Router);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly dispatches = signal<Dispatch[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly podDispatch = signal<Dispatch | null>(null);
  readonly podError = signal('');
  podForm: PodForm = { tempArrival: '', notes: '', photoConfirmed: false, clientSigned: false };

  constructor() {
    forkJoin({ dispatches: this.api.list(), clients: this.api.clients() }).subscribe({
      next: ({ dispatches, clients }) => {
        this.dispatches.set(dispatches);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  clientName(id: string): string {
    return this.clients().find((c) => c.id === id)?.name ?? id;
  }

  countByStatus(status: string): number {
    return this.dispatches().filter((d) => d.status === status).length;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ready: 'Listo',
      in_transit: 'En ruta',
      delivered: 'Entregado',
    };
    return map[status] ?? status;
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      ready: 'badge-amber',
      in_transit: 'badge-blue',
      delivered: 'badge-green',
    };
    return `badge ${map[status] ?? 'badge-gray'}`;
  }

  markInRoute(dispatch: Dispatch): void {
    this.patchLocal(dispatch.id, { status: 'in_transit' });
    this.api.updateDispatch(dispatch.id, { status: 'in_transit' }).subscribe({ error: () => undefined });
    this.api.updateOrderStatus(dispatch.orderId, 'dispatched').subscribe({ error: () => undefined });
  }

  openPod(dispatch: Dispatch): void {
    this.podError.set('');
    this.podForm = { tempArrival: '', notes: '', photoConfirmed: false, clientSigned: false };
    this.podDispatch.set(dispatch);
  }

  closePod(): void {
    this.podDispatch.set(null);
    this.podError.set('');
  }

  submitPod(): void {
    const dispatch = this.podDispatch();
    if (!dispatch) return;
    if (!this.podForm.photoConfirmed || !this.podForm.clientSigned) {
      this.podError.set('Confirma foto y firma del cliente para cerrar');
      return;
    }
    this.patchLocal(dispatch.id, {
      status: 'delivered',
      evidenceDone: true,
      tempArrival: this.podForm.tempArrival || null,
    });
    this.api.updateDispatch(dispatch.id, {
      status: 'delivered',
      evidenceDone: true,
      tempArrival: this.podForm.tempArrival || null,
    }).subscribe({ error: () => undefined });
    this.api.updateOrderStatus(dispatch.orderId, 'delivered').subscribe({ error: () => undefined });
    this.closePod();
  }

  goOrderDetail(orderId: string): void {
    void this.router.navigate(['/orders', orderId]);
  }

  private patchLocal(id: string, patch: Partial<Dispatch>): void {
    this.dispatches.update((items) => items.map((d) => d.id === id ? { ...d, ...patch } : d));
  }
}

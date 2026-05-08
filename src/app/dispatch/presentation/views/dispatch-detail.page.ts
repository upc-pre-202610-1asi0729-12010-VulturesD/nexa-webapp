import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '@app/shared/presentation/components/page-header.component';
import { StatusBadgeComponent } from '@app/shared/presentation/components/status-badge.component';
import { DispatchesApi } from '../../infrastructure/dispatches-api';
import { Client } from '@app/clients/domain/model';
import { Dispatch } from '@app/dispatch/domain/model';

@Component({
  selector: 'nx-dispatch-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <div class="page">
      <nx-page-header [title]="'Despacho ' + (dispatch()?.id || '')" subtitle="Detalle operativo">
        <a routerLink="/dispatches" class="btn btn-ghost"><i class="pi pi-arrow-left"></i> Volver</a>
      </nx-page-header>

      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:14px"></div></div>
      } @else if (!dispatch()) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-exclamation-circle"></i></div>
            <div class="empty-state-title">Despacho no encontrado</div>
          </div>
        </div>
      } @else {
        <div class="grid-3">
          <div class="card card-pad">
            <div class="section-label">Orden origen</div>
            <div class="text-mono" style="font-weight:600; font-size:14px; color:#111827">{{ dispatch()!.orderId }}</div>
          </div>
          <div class="card card-pad">
            <div class="section-label">Cliente</div>
            <div style="font-weight:600">{{ clientName() }}</div>
          </div>
          <div class="card card-pad">
            <div class="section-label">Estado</div>
            <nx-status [status]="dispatch()!.status" [label]="dispatch()!.status"></nx-status>
          </div>
          <div class="card card-pad">
            <div class="section-label">Conductor</div>
            <div style="font-weight:500">{{ dispatch()!.driver }}</div>
          </div>
          <div class="card card-pad">
            <div class="section-label">Vehículo</div>
            <div class="text-mono">{{ dispatch()!.vehicle }}</div>
          </div>
          <div class="card card-pad">
            <div class="section-label">Temperatura de salida</div>
            @if (dispatch()!.tempExit) {
              <span class="badge-temp">{{ dispatch()!.tempExit }}</span>
            } @else {
              <span class="muted">— pendiente</span>
            }
          </div>
        </div>

        @if (dispatch()!.checklist && dispatch()!.checklist!.length) {
          <div class="card" style="margin-top: 20px;">
            <div class="card-header"><div class="card-title">Checklist operativo</div></div>
            <div class="card-pad">
              @for (label of dispatch()!.checklist!; track label) {
                <div class="check-row">
                  <span class="check-mark"><i class="pi pi-check"></i></span>
                  <span>{{ label }}</span>
                </div>
              }
            </div>
          </div>
        }

        @if (dispatch()!.evidenceRequired) {
          <div class="card" style="margin-top:16px">
            <div class="card-header"><div class="card-title">Proof of Delivery (simulado)</div></div>
            <div class="card-pad">
              @if (dispatch()!.evidenceDone) {
                <div class="banner banner-success"><i class="pi pi-check-circle"></i><span>Evidencia registrada.</span></div>
              } @else {
                <div class="banner banner-warning"><i class="pi pi-clock"></i><span>Evidencia pendiente.</span></div>
              }
              <p class="muted" style="font-size:12px; margin-top:8px;">
                El despacho y la entrega se consideran etapas separadas.
              </p>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .check-row { display: flex; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid #F3F0EC; font-size: 13px; color: #1F2937; }
    .check-row:last-child { border-bottom: none; }
    .check-mark { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #DCFCE7; color: #15803D; font-size: 11px; }
  `],
})
export class DispatchDetailPage {
  private readonly api = inject(DispatchesApi);
  private readonly route = inject(ActivatedRoute);
  readonly loading = signal(true);
  readonly dispatch = signal<Dispatch | null>(null);
  readonly clients = signal<Client[]>([]);

  clientName(): string {
    const d = this.dispatch();
    return d ? this.clients().find((c) => c.id === d.clientId)?.name ?? d.clientId : '';
  }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    forkJoin({ d: this.api.byId(id), clients: this.api.clients() }).subscribe({
      next: ({ d, clients }) => {
        this.dispatch.set(d);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

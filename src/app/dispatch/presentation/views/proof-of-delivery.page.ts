import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { Dispatch } from '@app/dispatch/domain/model';
import { DispatchStore } from '@app/dispatch/application/dispatch.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';

@Component({
  selector: 'nx-proof-of-delivery',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'dispatch.evidenceTitle' | t }}</div>
          <div class="page-subtitle">{{ 'dispatch.evidenceSubtitle' | t }}</div>
        </div>
        <a routerLink="/dispatches" class="btn btn-secondary"><i class="pi pi-send"></i>{{ 'nav.dispatchBoard' | t }}</a>
      </div>

      <div class="grid-3" style="margin-bottom:20px">
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-camera" style="color:#F59E0B"></i>{{ 'dispatch.evidencePending' | t }}</div>
          <div class="kpi-value" style="color:#F59E0B">{{ pendingEvidence() }}</div>
          <div class="kpi-sub">{{ 'dispatch.kpi.evidenceSub' | t }}</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-check-circle" style="color:#22C55E"></i>{{ 'dispatch.evidenceDone' | t }}</div>
          <div class="kpi-value" style="color:#22C55E">{{ completedEvidence() }}</div>
          <div class="kpi-sub">{{ 'dispatch.kpi.deliveredSub' | t }}</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-truck" style="color:#2563EB"></i>{{ 'dispatch.kpi.transit' | t }}</div>
          <div class="kpi-value" style="color:#2563EB">{{ inRoute() }}</div>
          <div class="kpi-sub">{{ 'dispatch.kpi.transitSub' | t }}</div>
        </div>
      </div>

      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else {
        <div class="grid-2">
          @for (dispatch of evidenceRows(); track dispatch.id) {
            <article class="flow-panel flow-panel-pad">
              <div class="flow-row-between" style="align-items:flex-start">
                <div>
                  <div class="mono">{{ dispatch.id }}</div>
                  <h2 style="margin:6px 0 2px">{{ clientName(dispatch.clientId) }}</h2>
                  <p class="flow-note">{{ dispatch.dest }} · {{ dispatch.driver }} · {{ dispatch.vehicle }}</p>
                </div>
                <span [class]="'badge ' + (dispatch.evidenceDone ? 'badge-green' : 'badge-amber')">
                  {{ dispatch.evidenceDone ? ('dispatch.evidenceDone' | t) : ('dispatch.evidencePending' | t) }}
                </span>
              </div>
              <div class="divider"></div>
              <div class="flow-row" style="flex-wrap:wrap">
                <span class="badge-temp">{{ dispatch.tempExit || '-' }}°C salida</span>
                <span class="flow-pill">{{ dispatch.orderId }}</span>
                <span class="flow-pill flow-pill-blue">{{ dispatch.status }}</span>
              </div>
              <div class="flow-row" style="margin-top:14px">
                <button class="btn btn-primary btn-sm" [disabled]="dispatch.evidenceDone"><i class="pi pi-camera"></i>{{ 'dispatch.confirmDelivery' | t }}</button>
                <a class="btn btn-ghost btn-sm" [routerLink]="['/dispatches', dispatch.id]">{{ 'dispatch.detail' | t }}</a>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class ProofOfDeliveryPage {
  private readonly api = inject(DispatchStore);
  readonly loading = signal(true);
  readonly dispatches = signal<Dispatch[]>([]);
  readonly clients = signal<Client[]>([]);

  constructor() {
    forkJoin({ dispatches: this.api.list(), clients: this.api.clients() }).subscribe({
      next: ({ dispatches, clients }) => {
        this.dispatches.set(dispatches);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  evidenceRows(): Dispatch[] {
    return this.dispatches().filter((item) => item.evidenceRequired || item.status === 'delivered');
  }

  pendingEvidence(): number {
    return this.dispatches().filter((item) => item.evidenceRequired && !item.evidenceDone).length;
  }

  completedEvidence(): number {
    return this.dispatches().filter((item) => item.evidenceDone).length;
  }

  inRoute(): number {
    return this.dispatches().filter((item) => item.status === 'in_transit').length;
  }

  clientName(id: string): string {
    return this.clients().find((item) => item.id === id)?.name ?? id;
  }
}

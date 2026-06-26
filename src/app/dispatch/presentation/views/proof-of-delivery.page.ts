import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { DispatchStore } from '@app/dispatch/application/dispatch.store';
import { Dispatch, ProofOfDelivery, TemperatureLog } from '@app/dispatch/domain/model';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';

interface EvidenceRow {
  dispatch: Dispatch;
  proof: ProofOfDelivery | null;
  latestTemperature: TemperatureLog | null;
}

@Component({
  selector: 'nx-proof-of-delivery',
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="page">
      <header class="page-header" role="banner"><div><h1 class="page-title">{{ 'dispatch.evidenceTitle' | t }}</h1><p class="page-subtitle">{{ 'dispatch.evidenceSubtitle' | t }}</p></div><a routerLink="/dispatches" class="btn btn-secondary"><i class="pi pi-send"></i>{{ 'nav.dispatchBoard' | t }}</a></header>
      <div class="grid-3 kpis"><article class="card kpi-card"><div class="kpi-label"><i class="pi pi-camera pending"></i>{{ 'dispatch.evidencePending' | t }}</div><strong class="kpi-value pending">{{ pendingEvidence() }}</strong></article><article class="card kpi-card"><div class="kpi-label"><i class="pi pi-check-circle complete"></i>{{ 'dispatch.evidenceDone' | t }}</div><strong class="kpi-value complete">{{ completedEvidence() }}</strong></article><article class="card kpi-card"><div class="kpi-label"><i class="pi pi-truck route"></i>{{ 'dispatch.kpi.transit' | t }}</div><strong class="kpi-value route">{{ inRoute() }}</strong></article></div>
      @if (loading()) { <div class="card card-pad"><div class="skeleton"></div></div> }
      @else if (!rows().length) { <div class="empty-state"><i class="pi pi-camera"></i><h2>{{ 'dispatch.evidenceEmpty' | t }}</h2></div> }
      @else { <div class="grid-2">@for (row of rows(); track row.dispatch.id) { <article class="flow-panel flow-panel-pad"><div class="flow-row-between"><div><span class="mono">{{ row.dispatch.code }}</span><h2>{{ clientName(row.dispatch.clientAccountId) }}</h2><p class="flow-note">{{ row.dispatch.routeName }} · {{ row.dispatch.responsible || ('dispatch.board.unassigned' | t) }}</p></div><span [class]="'badge ' + (row.proof ? 'badge-green' : 'badge-amber')">{{ (row.proof ? 'dispatch.evidenceDone' : 'dispatch.evidencePending') | t }}</span></div><div class="divider"></div><div class="flow-row"><span class="badge-temp">{{ row.latestTemperature ? row.latestTemperature.celsius + ' °C' : '-' }}</span><span class="flow-pill">#{{ row.dispatch.orderId }}</span><span class="flow-pill flow-pill-blue">{{ ('dispatch.status.' + row.dispatch.status) | t }}</span></div><div class="flow-row actions"><a class="btn btn-primary btn-sm" [routerLink]="['/dispatches', row.dispatch.id]">{{ row.proof ? ('dispatch.detail' | t) : ('dispatch.confirmDelivery' | t) }}</a></div></article> }</div> }
    </section>
  `,
  styles: [`.page{display:grid;gap:20px}.page-header{display:flex;justify-content:space-between;align-items:flex-start}.page-title{margin:0;font-size:27px}.page-subtitle{margin:6px 0 0;color:#64748b}.kpis{margin:0}.kpi-value{display:block;margin-top:8px}.pending{color:#d97706}.complete{color:#16a34a}.route{color:#2563eb}.flow-panel h2{margin:6px 0 2px;font-size:15px}.actions{margin-top:14px}.skeleton{height:16px}.empty-state{padding:50px;text-align:center;color:#64748b}@media(max-width:650px){.page-header{display:grid;gap:14px}}`],
})
export class ProofOfDeliveryPage {
  private readonly store = inject(DispatchStore);
  readonly loading = signal(true);
  readonly rows = signal<EvidenceRow[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly pendingEvidence = computed(() => this.rows().filter((row) => row.dispatch.status === 'delivered' && !row.proof).length);
  readonly completedEvidence = computed(() => this.rows().filter((row) => !!row.proof).length);
  readonly inRoute = computed(() => this.rows().filter((row) => row.dispatch.status === 'in_route').length);

  constructor() {
    forkJoin({ dispatches: this.store.list(), clients: this.store.clients() }).pipe(
      switchMap(({ dispatches, clients }) => {
        this.clients.set(clients);
        const relevant = dispatches.filter((item) => ['in_route', 'delivered'].includes(item.status));
        return relevant.length ? forkJoin(relevant.map((dispatch) => this.store.detail(dispatch.id))) : of([]);
      }),
    ).subscribe({
      next: (details) => {
        this.rows.set(details.map((detail) => ({
          dispatch: detail.dispatch,
          proof: detail.proofs.find((proof) => ['complete', 'completed'].includes(proof.status)) ?? null,
          latestTemperature: detail.temperatures.at(-1) ?? null,
        })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  clientName(id: number): string { return this.clients().find((client) => Number(client.id) === id)?.name ?? `#${id}`; }
}

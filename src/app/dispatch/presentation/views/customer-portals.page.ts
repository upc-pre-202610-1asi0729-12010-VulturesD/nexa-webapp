import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientsStore } from '@app/clients/application/clients.store';
import { Client } from '@app/clients/domain/model';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';

@Component({
  selector: 'nx-customer-portals',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'dispatch.customerPortalsTitle' | t }}</div>
          <div class="page-subtitle">{{ 'dispatch.customerPortalsSubtitle' | t }}</div>
        </div>
        <a routerLink="/proof-of-delivery" class="btn btn-secondary"><i class="pi pi-camera"></i>{{ 'nav.proofOfDelivery' | t }}</a>
      </div>

      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else {
        <div class="customer-portals-grid">
          @for (client of clients(); track client.id) {
            <article class="flow-panel customer-portal-card">
              <div class="flow-panel-head">
                <div class="customer-portal-title">
                  <div class="meta-label">{{ client.ruc }}</div>
                  <h2>{{ client.name }}</h2>
                  <p>{{ client.contact }} · {{ client.phone }}</p>
                </div>
                <span [class]="'badge ' + (client.status === 'active' ? 'badge-green' : 'badge-amber')">{{ client.status || 'active' }}</span>
              </div>
              <div class="flow-stack">
                <div>
                  <div class="flow-title">{{ 'dispatch.requirements' | t }}</div>
                  <div class="flow-row" style="flex-wrap:wrap;margin-top:10px">
                    <span class="badge badge-blue">Factura</span>
                    <span class="badge badge-blue">Guía de remisión</span>
                    <span class="badge badge-blue">Evidencia POD</span>
                  </div>
                </div>
                <div>
                  <div class="flow-title">{{ 'dispatch.tasks' | t }}</div>
                  <div class="mini-row customer-portal-task">
                    <span class="mono">TASK-{{ client.id }}</span>
                    <span>{{ client.lastOrder || 'ORD-2026-0412' }}</span>
                    <span class="badge badge-amber">pending</span>
                  </div>
                </div>
                <div class="flow-row-between">
                  <span class="flow-note">{{ 'dispatch.portalOwner' | t }}: {{ client.contact || '-' }}</span>
                  <span class="flow-note">{{ 'dispatch.portalMode' | t }}: B2B</span>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class CustomerPortalsPage {
  private readonly api = inject(ClientsStore);
  readonly loading = signal(true);
  readonly clients = signal<Client[]>([]);

  constructor() {
    this.api.list().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

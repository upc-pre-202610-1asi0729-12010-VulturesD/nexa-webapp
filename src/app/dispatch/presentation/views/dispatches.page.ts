import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DispatchStore } from '@app/dispatch/application/dispatch.store';
import { Dispatch } from '@app/dispatch/domain/model';
import { Client } from '@app/clients/domain/model';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

interface KanbanLane {
  key: string;
  labelKey: string;
  statuses: string[];
}

const KANBAN_LANES: KanbanLane[] = [
  { key: 'ready_for_operations', labelKey: 'dispatch.board.columns.ready_for_operations', statuses: ['ready_for_operations'] },
  { key: 'preparing', labelKey: 'dispatch.board.columns.preparing', statuses: ['assigned', 'scheduled', 'preparing', 'ready_for_route', 'reprogrammed'] },
  { key: 'in_route', labelKey: 'dispatch.board.columns.in_route', statuses: ['in_route', 'delayed'] },
  { key: 'delivered', labelKey: 'dispatch.board.columns.delivered', statuses: ['delivered'] },
  { key: 'incident', labelKey: 'dispatch.board.columns.incident', statuses: ['incident', 'cancelled', 'rejected'] }
];

@Component({
  selector: 'nx-dispatches',
  imports: [CommonModule, FormsModule, TranslatePipe, NexaIconComponent],
  template: `
    <section class="dispatch-board-page">
      <header class="page-header" role="banner">
        <div>
          <h1 class="page-title">Dispatch Board</h1>
          <p class="page-subtitle">{{ dispatches().length }} dispatch orders - S2 operational board for route execution.</p>
        </div>
        <button type="button" class="btn btn-secondary" (click)="goToProofOfDelivery()">
          <nx-icon name="pi-camera" style="margin-right: 6px;"></nx-icon> Proof of Delivery
        </button>
      </header>

      <!-- Filter and Search Bar -->
      <div class="filter-bar">
        <div class="search-input">
          <i class="pi pi-search"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search dispatch order, purchase..."
            aria-label="Search dispatches" />
        </div>

        <label class="dispatch-filter-select">
          <span>Route</span>
          <select [(ngModel)]="routeFilter" aria-label="Route filter">
            <option value="all">All routes</option>
            @for (route of availableRoutes(); track route) {
              <option [value]="route">{{ route }}</option>
            }
          </select>
        </label>

        <label class="dispatch-filter-select">
          <span>Sort</span>
          <select [(ngModel)]="sortOption" aria-label="Sort options">
            <option value="priority">Priority</option>
            <option value="eta">ETA</option>
            <option value="route">Route</option>
            <option value="client">Client</option>
            <option value="status">Status</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>

      @if (store.error()) {
        <div class="banner banner-danger" role="alert" style="margin-bottom: 16px;">
          <nx-icon name="pi-exclamation-triangle"></nx-icon>
          <span>Failed to load or update dispatches.</span>
        </div>
      }

      @if (store.loading()) {
        <div class="board-loading" aria-live="polite">
          @for (_ of [1,2,3,4,5]; track _) {
            <div class="skeleton"></div>
          }
        </div>
      } @else if (!filteredDispatches().length && searchQuery() === '') {
        <div class="empty-state">
          <nx-icon name="pi-truck"></nx-icon>
          <h2>No dispatch orders loaded</h2>
          <p>Please check backend connections or run swagger requests to trigger dispatches.</p>
        </div>
      } @else {
        <div class="kanban-board" [attr.aria-label]="'dispatch.a11y.lifecycleBoard' | t">
          @for (lane of lanes; track lane.key) {
            <section class="kanban-column">
              <div class="kanban-column-head">
                <span class="kanban-column-title">{{ lane.key.replace(/_/g, ' ') | titlecase }}</span>
                <span class="flow-pill">{{ getDispatchesInLane(lane).length }}</span>
              </div>

              <div class="lane-list" style="display: flex; flex-direction: column; gap: 10px;">
                @for (dispatch of getDispatchesInLane(lane); track dispatch.id) {
                  <article class="dispatch-card" (click)="openDetail(dispatch.id)">
                    <div class="card-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span class="code" style="color: #1d4ed8; font-family: monospace; font-size: 11px; font-weight: 800;">{{ dispatch.code }}</span>
                      <div class="dispatch-card-badges">
                        <span class="badge-priority" [class]="'badge-priority-' + (dispatch.priority || 'medium')">
                          {{ (dispatch.priority || 'MEDIUM') | uppercase }}
                        </span>
                      </div>
                    </div>

                    <h3 style="margin: 4px 0; font-size: 13px; font-weight: 800; color: #0f172a;">{{ clientName(dispatch.clientAccountId) }}</h3>
                    <p style="font-size: 11px; color: #64748b; margin: 0 0 10px;">Purchase Order #{{ dispatch.orderId }}</p>

                    <!-- Tags row -->
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                      <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; background: #eff6ff; color: #2563eb;">Chilled</span>
                      <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; background: #ecfdf5; color: #059669;">Credit OK</span>
                      <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px;"
                            [style.background]="dispatch.status === 'ready_for_operations' ? '#fef2f2' : '#f8fafc'"
                            [style.color]="dispatch.status === 'ready_for_operations' ? '#dc2626' : '#475569'"
                            [style.border]="dispatch.status === 'ready_for_operations' ? '1px solid #fee2e2' : '1px solid #e2e8f0'">
                        {{ dispatch.status === 'ready_for_operations' ? 'NEW' : (dispatch.status.replace(/_/g, ' ') | titlecase) }}
                      </span>
                    </div>

                    <!-- Meta specs -->
                    <div class="flow-stack" style="display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
                      <div class="dispatch-meta-row">
                        <span>Business Documents</span>
                        <strong>{{ dispatch.documentProgress || '0/3' }}</strong>
                      </div>
                      <div class="dispatch-meta-row">
                        <span>Route</span>
                        <strong>{{ dispatch.routeName || 'Unscheduled Route' }}</strong>
                      </div>
                      <div class="dispatch-meta-row">
                        <span>ETA</span>
                        <strong>{{ dispatch.eta ? (dispatch.eta | date:'MM/dd/yyyy') : 'Unscheduled' }}</strong>
                      </div>
                      <div class="dispatch-meta-row">
                        <span>Responsible</span>
                        <strong>{{ dispatch.responsible || 'Unassigned' }}</strong>
                      </div>
                      @if (clientById(dispatch.clientAccountId); as client) {
                        <div class="dispatch-meta-row">
                          <span>Client credit</span>
                          <strong>S/ {{ (client.monthlyCreditAvailable || 0).toLocaleString() }} available</strong>
                        </div>
                      }
                    </div>

                    <!-- Transition button -->
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      style="margin-top: 12px; width: 100%; justify-content: center; font-size: 11px;"
                      [disabled]="isTransitionDisabled(dispatch)"
                      (click)="moveForward(dispatch, $event)">
                      <i [class]="getTransitionIcon(dispatch)"></i>
                      {{ getTransitionText(dispatch) }}
                    </button>
                  </article>
                } @empty {
                  <div class="lane-empty" style="padding: 20px 8px; color: #94a3b8; font-size: 11px; text-align: center;">No dispatches in lane</div>
                }
              </div>
            </section>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .dispatch-board-page {
      display: grid;
      gap: 16px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
    }
    .page-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
    .filter-bar {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
    .search-input {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
    }
    .search-input i {
      position: absolute;
      left: 12px;
      color: #64748b;
    }
    .search-input input {
      width: 100%;
      height: 38px;
      padding-left: 34px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      box-sizing: border-box;
    }
    .search-input input:focus {
      outline: 0;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    }
    .dispatch-filter-select {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
    }
    .dispatch-filter-select select {
      height: 38px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0 10px;
      background: #ffffff;
      font-size: 13px;
    }
    .board-loading {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }
    .board-loading .skeleton {
      height: 420px;
    }
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(5, minmax(220px, 1fr));
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
    }
    .kanban-column {
      min-width: 220px;
      padding: 12px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-sizing: border-box;
    }
    .kanban-column-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .kanban-column-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
    }
    .flow-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 4px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      font-size: 10px;
      font-weight: 800;
      color: #0f172a;
    }
    .dispatch-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #ffffff;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(15,23,42,0.03);
      cursor: pointer;
      transition: all 140ms;
      box-sizing: border-box;
    }
    .dispatch-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15,23,42,0.06);
    }
    .badge-priority {
      font-size: 9px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 999px;
    }
    .badge-priority-high {
      background: #fee2e2;
      color: #b91c1c;
    }
    .badge-priority-medium {
      background: #fef3c7;
      color: #d97706;
    }
    .badge-priority-low {
      background: #f1f5f9;
      color: #475569;
    }
    .dispatch-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
    }
    .dispatch-meta-row span {
      color: #64748b;
    }
    .dispatch-meta-row strong {
      color: #0f172a;
      font-weight: 700;
    }
    .empty-state {
      padding: 50px;
      text-align: center;
      background: #ffffff;
      border-radius: 12px;
      border: 1px dashed #cbd5e1;
    }
    .empty-state nx-icon {
      font-size: 32px;
      color: #94a3b8;
    }
    .empty-state h2 {
      margin: 12px 0 6px;
      font-size: 18px;
      font-weight: 800;
    }
    .empty-state p {
      margin: 0;
      color: #64748b;
      font-size: 13px;
    }
  `]
})
export class DispatchesPage {
  readonly store = inject(DispatchStore);
  private readonly router = inject(Router);

  readonly dispatches = this.store.dispatches;
  readonly clients = signal<Client[]>([]);
  readonly lanes = KANBAN_LANES;

  // Filter signals
  searchQuery = signal('');
  routeFilter = signal('all');
  sortOption = signal('priority');

  // Available routes list computed dynamically
  readonly availableRoutes = computed(() => {
    const routes = new Set<string>();
    this.dispatches().forEach(d => {
      if (d.routeName) routes.add(d.routeName);
    });
    return Array.from(routes);
  });

  // Filtered and sorted dispatches
  readonly filteredDispatches = computed(() => {
    let list = this.dispatches();

    // 1. Search Query filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query !== '') {
      list = list.filter(d => {
        return d.code.toLowerCase().includes(query) ||
               String(d.orderId).toLowerCase().includes(query) ||
               this.clientName(d.clientAccountId).toLowerCase().includes(query) ||
               (d.routeName && d.routeName.toLowerCase().includes(query)) ||
               d.status.toLowerCase().includes(query);
      });
    }

    // 2. Route filter
    const route = this.routeFilter();
    if (route !== 'all') {
      list = list.filter(d => d.routeName === route);
    }

    // 3. Sorting
    const sort = this.sortOption();
    list = [...list].sort((a, b) => {
      if (sort === 'eta') {
        const dateA = a.eta ? new Date(a.eta).getTime() : 9999999999999;
        const dateB = b.eta ? new Date(b.eta).getTime() : 9999999999999;
        return dateA - dateB;
      }
      if (sort === 'route') {
        return (a.routeName || '').localeCompare(b.routeName || '');
      }
      if (sort === 'client') {
        return this.clientName(a.clientAccountId).localeCompare(this.clientName(b.clientAccountId));
      }
      if (sort === 'status') {
        return a.status.localeCompare(b.status);
      }
      if (sort === 'newest') {
        return b.id - a.id;
      }
      // default: priority (HIGH -> MEDIUM -> NORMAL -> LOW)
      const priorityWeight: Record<string, number> = { high: 1, medium: 2, normal: 3, low: 4 };
      const weightA = priorityWeight[(a.priority || 'medium').toLowerCase()] || 2;
      const weightB = priorityWeight[(b.priority || 'medium').toLowerCase()] || 2;
      return weightA - weightB;
    });

    return list;
  });

  constructor() {
    this.store.load();
    this.store.clients().subscribe({ next: (clients) => this.clients.set(clients) });
  }

  getDispatchesInLane(lane: KanbanLane): Dispatch[] {
    return this.filteredDispatches().filter((d) => lane.statuses.includes(d.status));
  }

  clientName(id: number): string {
    return this.clients().find((client) => client.backendId === id)?.name ?? `#${id}`;
  }

  clientById(id: number): Client | undefined {
    return this.clients().find(c => c.backendId === id);
  }

  goToProofOfDelivery(): void {
    this.router.navigate(['/ops/operations/proof-of-delivery']);
  }

  openDetail(id: number): void {
    this.router.navigate(['/dispatches', id]);
  }

  // Transitions & state logic
  isTransitionDisabled(dispatch: Dispatch): boolean {
    return ['incident', 'cancelled', 'rejected', 'delivered'].includes(dispatch.status);
  }

  getTransitionIcon(dispatch: Dispatch): string {
    return 'pi pi-arrow-right';
  }

  getTransitionText(dispatch: Dispatch): string {
    if (dispatch.status === 'delivered') return 'Delivered';
    if (['cancelled', 'rejected'].includes(dispatch.status)) return 'Returned to Sales';
    if (dispatch.status === 'incident') return 'Incident Locked';
    return 'Move dispatch forward';
  }

  moveForward(dispatch: Dispatch, event: Event): void {
    event.stopPropagation(); // Avoid opening details page
    
    // Map status forward path
    const nextStatusMap: Record<string, string> = {
      ready_for_operations: 'preparing',
      preparing: 'ready_for_route',
      scheduled: 'ready_for_route',
      assigned: 'ready_for_route',
      ready_for_route: 'in_route',
      in_route: 'delivered',
      delayed: 'in_route'
    };

    const nextStatus = nextStatusMap[dispatch.status] || 'preparing';
    
    this.store.changeStatus(dispatch.id, nextStatus).subscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { DispatchStore } from '@app/dispatch/application/dispatch.store';
import { Dispatch, DispatchDetail } from '@app/dispatch/domain/model';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

type DetailSection = 'operations' | 'coldChain' | 'timeline';

@Component({
  selector: 'nx-dispatch-detail',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    NexaIconComponent,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './dispatch-detail.page.html',
  styleUrl: './dispatch-detail.page.scss',
})
export class DispatchDetailPage {
  readonly store = inject(DispatchStore);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18nService);
  readonly loading = signal(true);
  readonly detail = signal<DispatchDetail | null>(null);
  readonly clients = signal<Client[]>([]);
  readonly activeSection = signal<DetailSection>('operations');
  readonly dispatch = computed(() => this.detail()?.dispatch ?? null);
  readonly temperatureAlerts = computed(() => this.detail()?.temperatures.filter((item) => item.status !== 'ok').length ?? 0);
  readonly completedPod = computed(() => this.detail()?.proofs.find((item) => item.status === 'completed' || item.status === 'complete') ?? null);
  readonly id: number;

  responsible = '';
  eta = '';
  deliveryWindow = '';
  actionNote = '';
  temperature: number | null = null;
  temperatureZone = 'truck-cabin';
  temperatureStatus = 'ok';
  receiver = '';
  podPhoto = true;
  podSignature = true;
  podNotes = '';

  constructor() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(this.id)) {
      this.loading.set(false);
      return;
    }
    this.load();
  }

  clientName(): string {
    const dispatch = this.dispatch();
    if (!dispatch) return '';
    return this.clients().find((client) => Number(client.id) === dispatch.clientAccountId)?.name ?? `#${dispatch.clientAccountId}`;
  }

  setSection(section: DetailSection): void { this.activeSection.set(section); }

  changeStatus(status: string, visibleToBuyer: boolean): void {
    if (this.store.saving()) return;
    if (status === 'incident' && !window.confirm(this.i18n.t('dispatch.detailView.incidentConfirm'))) return;
    const request = status === 'in_route' ? this.store.startRoute(this.id)
      : status === 'delivered' ? this.store.complete(this.id)
      : status === 'incident' ? this.store.incident(this.id, this.actionNote)
      : this.store.changeStatus(this.id, status, this.actionNote, visibleToBuyer);
    request.subscribe({ next: () => this.reload(), error: () => undefined });
  }

  assign(): void {
    const responsible = this.responsible.trim();
    if (!responsible) return;
    this.store.assign(this.id, responsible).subscribe({ next: () => this.reload(), error: () => undefined });
  }

  schedule(): void {
    if (!this.eta || !this.deliveryWindow.trim()) return;
    const request = this.dispatch()?.status === 'scheduled' || this.dispatch()?.status === 'reprogrammed'
      ? this.store.reschedule(this.id, new Date(this.eta).toISOString(), this.deliveryWindow, this.actionNote)
      : this.store.schedule(this.id, new Date(this.eta).toISOString(), this.deliveryWindow, this.actionNote);
    request.subscribe({ next: () => this.reload(), error: () => undefined });
  }

  addTemperature(): void {
    if (this.temperature === null) return;
    this.store.createTemperature(this.id, this.temperature, this.temperatureZone, this.temperatureStatus).subscribe({
      next: () => { this.temperature = null; this.reload(); },
      error: () => undefined,
    });
  }

  completePod(): void {
    if (!this.receiver.trim()) return;
    this.store.completePod(this.id, this.receiver, this.podPhoto, this.podSignature, this.podNotes).subscribe({
      next: () => this.reload(),
      error: () => undefined,
    });
  }

  private load(): void {
    this.loading.set(true);
    forkJoin({ detail: this.store.detail(this.id), clients: this.store.clients() }).subscribe({
      next: ({ detail, clients }) => {
        this.detail.set(detail);
        this.clients.set(clients);
        this.syncDraft(detail.dispatch);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private reload(): void {
    this.store.detail(this.id).subscribe({
      next: (detail) => { this.detail.set(detail); this.syncDraft(detail.dispatch); },
      error: () => undefined,
    });
  }

  private syncDraft(dispatch: Dispatch): void {
    this.responsible = dispatch.responsible ?? '';
    this.deliveryWindow = dispatch.deliveryWindow ?? '';
    this.eta = dispatch.eta ? dispatch.eta.slice(0, 16) : '';
  }
}

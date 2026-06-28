import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CommercialActionResult, CommercialValidationStore } from '@app/ordering/application/commercial-validation.store';
import { IamStore } from '@app/iam/application/iam.store';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

type CommercialAction = 'accept' | 'adjust' | 'reject';

@Component({
  selector: 'nx-commercial-validation',
  imports: [CommonModule, MatButtonModule, MatInputModule, RouterLink, NexaIconComponent, TranslatePipe],
  template: `
    @if (loading()) {
      <div class="flow-panel flow-panel-pad" aria-live="polite">
        <div class="skeleton" style="height:24px;margin-bottom:12px"></div>
        <div class="skeleton" style="height:16px;width:60%"></div>
      </div>
    } @else if (!request()) {
      <div class="empty-state">
        <div class="empty-state-icon"><nx-icon name="pi-check-square"></nx-icon></div>
        <div class="empty-state-title">{{ 'commercialValidation.notFound' | t }}</div>
        <a routerLink="/commercial/purchase-requests" class="btn btn-primary">
          {{ 'commercialValidation.backInbox' | t }}
        </a>
      </div>
    } @else if (request(); as item) {
      <div class="page-header">
        <div>
          <div class="page-title">{{ 'commercialValidation.title' | t }}</div>
          <div class="page-subtitle">{{ item.id }} · {{ clientName() }}</div>
        </div>
        <span class="badge" [class]="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
      </div>

      @if (actionSuccess()) {
        <div class="banner banner-success" role="status" aria-live="polite">
          <nx-icon name="pi-check-circle"></nx-icon><div>{{ actionSuccess() }}</div>
        </div>
      }
      @if (actionError()) {
        <div class="banner banner-danger" role="alert">
          <nx-icon name="pi-exclamation-triangle"></nx-icon><div>{{ actionError() }}</div>
        </div>
      }

      <div class="flow-grid-12 sales-review-grid">
        <section class="flow-panel span-7" aria-labelledby="buyer-request-title">
          <div class="flow-panel-head">
            <div>
              <div id="buyer-request-title" class="flow-title">{{ 'commercialValidation.buyerRequest' | t }}</div>
              <div class="flow-subtitle">{{ 'commercialValidation.buyerRequestSubtitle' | t }}</div>
            </div>
          </div>
          <div class="flow-panel-pad flow-stack">
            <div class="request-detail-meta">
              <div><span>{{ 'commercialValidation.credit' | t }}</span><strong class="badge" [class]="creditClass()">{{ creditLabel() }}</strong></div>
              <div><span>{{ 'commercialValidation.delivery' | t }}</span><strong>{{ item.requestedDeliveryDate || ('commercialValidation.pending' | t) }}</strong></div>
              <div><span>{{ 'commercialValidation.priority' | t }}</span><strong>{{ item.priority || 'normal' }}</strong></div>
              <div><span>{{ 'commercialValidation.payment' | t }}</span><strong>{{ item.paymentOption || client()?.condition || ('commercialValidation.notAvailable' | t) }}</strong></div>
            </div>

            <article class="buyer-note">
              <strong>{{ 'commercialValidation.buyerSpecifications' | t }}</strong>
              <p>{{ item.comments || ('commercialValidation.noBuyerNotes' | t) }}</p>
            </article>

            <div class="request-product-grid">
              @for (line of item.items; track line.productId) {
                <article class="request-product-card">
                  <div class="request-product-image"><nx-icon name="pi-box"></nx-icon></div>
                  <div>
                    <strong>{{ line.name }}</strong>
                    <span>{{ line.productId }}</span>
                    <small>{{ line.qty }} {{ line.unit }} · S/ {{ line.price | number:'1.2-2' }}</small>
                  </div>
                </article>
              }
              @if (!item.items.length) {
                <div class="empty-state compact request-lines-empty">
                  <div class="empty-state-title">{{ 'commercialValidation.noItems' | t }}</div>
                </div>
              }
            </div>
          </div>
        </section>

        <section class="flow-panel span-5" aria-labelledby="sales-response-title">
          <div class="flow-panel-head">
            <div>
              <div id="sales-response-title" class="flow-title">{{ 'commercialValidation.salesResponse' | t }}</div>
              <div class="flow-subtitle">{{ 'commercialValidation.salesResponseSubtitle' | t }}</div>
            </div>
          </div>
          <div class="flow-panel-pad flow-stack">
            <div class="doc-chip-row" [attr.aria-label]="'commercialValidation.requiredDocs' | t">
              <span class="badge badge-blue">{{ 'commercialValidation.invoiceXml' | t }}</span>
              <span class="badge badge-blue">{{ 'commercialValidation.invoicePdf' | t }}</span>
              <span class="badge badge-blue">{{ 'commercialValidation.dispatchGuidePdf' | t }}</span>
            </div>

            <label class="field" for="commercial-observation">
              <span class="field-label">{{ 'commercialValidation.observationLabel' | t }}</span>
              <textarea
                id="commercial-observation"
                matInput
                class="plain-input sales-note-box"
                rows="5"
                [value]="actionNote()"
                [disabled]="saving()"
                [attr.aria-describedby]="actionError() ? 'commercial-action-error' : null"
                [placeholder]="'commercialValidation.observationPlaceholder' | t"
                (input)="onNoteInput($event)"></textarea>
            </label>

            @if (canRespond()) {
              <div class="sales-action-grid">
                <button mat-flat-button class="btn btn-primary" type="button" [disabled]="saving() || !item.items.length" (click)="runAction('accept')">
                  <nx-icon name="pi-check"></nx-icon>{{ 'commercialValidation.accept' | t }}
                </button>
                <button mat-stroked-button class="btn btn-secondary" type="button" [disabled]="saving()" (click)="runAction('adjust')">
                  <nx-icon name="pi-comments"></nx-icon>{{ 'commercialValidation.adjust' | t }}
                </button>
                <button mat-stroked-button class="btn btn-danger" type="button" [disabled]="saving()" (click)="runAction('reject')">
                  <nx-icon name="pi-times"></nx-icon>{{ 'commercialValidation.reject' | t }}
                </button>
              </div>
            } @else {
              <div class="banner banner-info closed-banner">
                <nx-icon name="pi-lock"></nx-icon>
                <div>{{ 'commercialValidation.closed' | t }}</div>
              </div>
            }
          </div>
        </section>

        <section class="flow-panel span-12" aria-labelledby="request-chat-title">
          <div class="flow-panel-head">
            <div>
              <div id="request-chat-title" class="flow-title">{{ 'commercialValidation.chat' | t }}</div>
              <div class="flow-subtitle">{{ 'commercialValidation.chatSubtitle' | t }}</div>
            </div>
          </div>
          <div class="flow-panel-pad flow-stack">
            @for (message of messages(); track message.id) {
              <div class="message-row">
                <div><strong>{{ message.senderName || message.senderRole }}</strong><span>{{ message.senderRole }}</span></div>
                <p>{{ message.body }}</p>
              </div>
            }
            @if (!messages().length) {
              <div class="empty-state compact">
                <div class="empty-state-title">{{ 'commercialValidation.noMessages' | t }}</div>
                <div class="empty-state-desc">{{ 'commercialValidation.noMessagesDescription' | t }}</div>
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .sales-review-grid { align-items: start; }
    .request-detail-meta { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .request-detail-meta div { border:1px solid #e8eef7; border-radius:14px; background:#f8fafc; padding:14px; }
    .request-detail-meta span { display:block; color:#64748b; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:6px; }
    .buyer-note { border:1px solid #dbeafe; background:#eff6ff; border-radius:16px; padding:16px; }
    .buyer-note strong { color:#0f172a; }
    .buyer-note p { margin:8px 0 0; color:#334155; white-space:pre-line; line-height:1.5; }
    .request-product-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
    .request-product-card { display:grid; grid-template-columns:96px minmax(0,1fr); gap:14px; align-items:center; border:1px solid #e2e8f0; border-radius:16px; padding:12px; background:#fff; }
    .request-product-image { width:96px; height:82px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:#f8fafc; overflow:hidden; color:#94a3b8; --nexa-icon-size:28px; }
    .request-product-card strong { display:block; color:#0f172a; line-height:1.25; }
    .request-product-card span,.request-product-card small { display:block; color:#64748b; margin-top:4px; }
    .request-lines-empty { grid-column:1 / -1; }
    .doc-chip-row { display:flex; flex-wrap:wrap; gap:8px; }
    .sales-note-box { min-height:132px; width:100%; padding:12px; resize:vertical; border:1px solid #e2e8f0; border-radius:10px; box-sizing:border-box; }
    .sales-note-box:focus { outline:2px solid #2563eb; outline-offset:2px; }
    .sales-action-grid { display:grid; gap:10px; }
    .sales-action-grid .btn { justify-content:center; min-height:42px; width:100%; }
    .closed-banner { margin:0; }
    .message-row { border:1px solid #e2e8f0; border-radius:14px; padding:14px 16px; background:#fff; }
    .message-row div { display:flex; justify-content:space-between; gap:12px; color:#64748b; font-size:12px; }
    .message-row div strong { color:#0f172a; }
    .message-row p { margin:8px 0 0; color:#334155; line-height:1.5; white-space:pre-line; }
    @media (max-width:860px) { .request-detail-meta,.request-product-grid { grid-template-columns:1fr; } }
  `],
})
export class CommercialValidationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(CommercialValidationStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly loading = this.store.loading;
  readonly saving = this.store.saving;
  readonly request = this.store.request;
  readonly client = this.store.client;
  readonly messages = this.store.messages;
  readonly actionNote = signal('');
  readonly actionError = signal('');
  readonly actionSuccess = signal('');

  readonly canRespond = computed(() => {
    const status = this.request()?.status;
    return !!status && !['rejected', 'cancelled', 'converted_to_order'].includes(status);
  });
  readonly creditAvailable = computed(() => Math.max(0, Number(this.client()?.creditLimit ?? 0) - Number(this.client()?.creditUsed ?? 0)));
  readonly creditClass = computed(() => {
    const limit = Number(this.client()?.creditLimit ?? 0);
    if (!limit) return 'badge-amber';
    return this.creditAvailable() > 0 ? 'badge-green' : 'badge-red';
  });
  readonly creditLabel = computed(() => {
    const limit = Number(this.client()?.creditLimit ?? 0);
    if (!limit) return this.i18n.t('commercialValidation.creditToValidate');
    return this.creditAvailable() > 0
      ? this.i18n.t('commercialValidation.creditAvailable', { amount: this.creditAvailable().toLocaleString() })
      : this.i18n.t('commercialValidation.creditBlocked');
  });

  constructor() {
    this.store.load(this.route.snapshot.paramMap.get('id') ?? '');
  }

  clientName(): string {
    return this.client()?.commercialName || this.client()?.name || this.request()?.clientId || '';
  }

  onNoteInput(event: Event): void {
    this.actionNote.set((event.target as HTMLTextAreaElement).value);
  }

  runAction(action: CommercialAction): void {
    if (!this.request() || this.saving()) return;
    const note = this.actionNote().trim();
    if (action !== 'accept' && !note) {
      this.actionError.set(this.i18n.t('commercialValidation.noteRequired'));
      return;
    }

    this.actionError.set('');
    this.actionSuccess.set('');
    const senderName = this.session.user()?.name || this.session.user()?.email || 'Sales';
    const operation: Observable<CommercialActionResult> = action === 'accept'
      ? this.store.accept(note, senderName)
      : action === 'adjust'
        ? this.store.requestAdjustment(note, senderName)
        : this.store.reject(note, senderName);

    operation.subscribe({
      next: (result) => {
        if (action === 'accept' && 'orderId' in result) {
          const orderCode = `ORD-2026-${String(result.orderId).padStart(4, '0')}`;
          this.actionSuccess.set(this.i18n.t('commercialValidation.acceptedSuccess', { order: orderCode }));
        } else {
          this.actionSuccess.set(this.i18n.t(action === 'adjust'
            ? 'commercialValidation.adjustedSuccess'
            : 'commercialValidation.rejectedSuccess'));
        }
        this.actionNote.set('');
      },
      error: () => this.actionError.set(this.i18n.t('commercialValidation.actionError')),
    });
  }

  statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  statusClass(status: string): string {
    if (/submitted|adjustment|review/i.test(status)) return 'badge-amber';
    if (/validated|converted|approved/i.test(status)) return 'badge-green';
    if (/rejected|cancelled/i.test(status)) return 'badge-red';
    return 'badge-gray';
  }
}

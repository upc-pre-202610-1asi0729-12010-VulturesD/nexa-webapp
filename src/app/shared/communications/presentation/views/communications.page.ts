import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { CommunicationsStore } from '@app/shared/communications/application/communications.store';

@Component({
  selector: 'nx-communications-page',
  standalone: true,
  imports: [DatePipe, TranslatePipe, NexaIconComponent],
  template: `
    <section class="page communications-page">
      <header class="page-header">
        <div>
          <div class="page-title">{{ 'communications.title' | t }}</div>
          <div class="page-subtitle">{{ 'communications.subtitle' | t }}</div>
        </div>
      </header>

      @if (store.loading()) {
        <div class="communications-grid">
          <div class="skeleton panel-skeleton"></div>
          <div class="skeleton panel-skeleton"></div>
        </div>
      } @else {
        <div class="communications-grid">
          <section class="comm-panel">
            <header>
              <div>
                <h2>{{ 'communications.notifications' | t }}</h2>
                <p>{{ 'communications.notificationsDesc' | t }}</p>
              </div>
              <strong>{{ store.unreadCount() }}</strong>
            </header>
            <div class="comm-list">
              @for (item of store.notifications(); track item.id) {
                <article class="comm-row" [class.unread]="!item.read">
                  <div class="row-icon"><nx-icon name="pi-bell"></nx-icon></div>
                  <div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.body }}</p>
                    <span>{{ item.type }} · {{ item.createdAt | date:'short' }}</span>
                  </div>
                  @if (!item.read) {
                    <button type="button" class="btn btn-secondary" (click)="store.markRead(item.id)">
                      {{ 'communications.markRead' | t }}
                    </button>
                  }
                </article>
              } @empty {
                <div class="empty-state compact">
                  <div class="empty-state-title">{{ 'communications.noNotifications' | t }}</div>
                  <div class="empty-state-desc">{{ 'communications.noNotificationsDesc' | t }}</div>
                </div>
              }
            </div>
          </section>

          <section class="comm-panel">
            <header>
              <div>
                <h2>{{ 'communications.messages' | t }}</h2>
                <p>{{ 'communications.messagesDesc' | t }}</p>
              </div>
              <strong>{{ visibleMessages().length }}</strong>
            </header>
            <div class="comm-list">
              @for (item of visibleMessages(); track item.id) {
                <article class="comm-row">
                  <div class="row-icon"><nx-icon name="pi-comments"></nx-icon></div>
                  <div>
                    <strong>{{ item.senderName }} · {{ item.senderRole }}</strong>
                    <p>{{ item.body }}</p>
                    <span>
                      {{ 'communications.request' | t }} #{{ item.purchaseRequestId || '-' }}
                      · {{ item.createdAt | date:'short' }}
                    </span>
                  </div>
                </article>
              } @empty {
                <div class="empty-state compact">
                  <div class="empty-state-title">{{ 'communications.noMessages' | t }}</div>
                  <div class="empty-state-desc">{{ 'communications.noMessagesDesc' | t }}</div>
                </div>
              }
            </div>
          </section>
        </div>
      }
    </section>
  `,
  styles: [`
    .communications-page { display: grid; gap: 18px; }
    .communications-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .comm-panel { min-width: 0; border: 1px solid #dbe5f2; border-radius: 8px; background: #fff; overflow: hidden; }
    .comm-panel > header { display: flex; justify-content: space-between; gap: 12px; padding: 16px; border-bottom: 1px solid #e2e8f0; }
    .comm-panel h2 { margin: 0; font-size: 15px; color: #0f172a; }
    .comm-panel p { margin: 4px 0 0; color: #64748b; font-size: 12px; line-height: 1.45; }
    .comm-panel header strong { display: grid; place-items: center; min-width: 32px; height: 32px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-size: 12px; }
    .comm-list { display: grid; gap: 0; }
    .comm-row { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; gap: 11px; align-items: start; padding: 14px 16px; border-bottom: 1px solid #edf2f7; }
    .comm-row:last-child { border-bottom: 0; }
    .comm-row.unread { background: #f8fbff; }
    .row-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: #eff6ff; color: #1d4ed8; }
    .comm-row strong { display: block; color: #0f172a; font-size: 13px; }
    .comm-row p { margin: 4px 0; color: #475569; overflow-wrap: anywhere; }
    .comm-row span { color: #94a3b8; font-size: 11px; }
    .comm-row button { align-self: center; white-space: nowrap; }
    .panel-skeleton { min-height: 360px; border-radius: 8px; }
    @media (max-width: 920px) { .communications-grid { grid-template-columns: 1fr; } }
    @media (max-width: 620px) {
      .comm-panel > header { align-items: flex-start; }
      .comm-row { grid-template-columns: 30px minmax(0, 1fr); }
      .comm-row button { grid-column: 2; justify-self: start; }
    }
  `],
})
export class CommunicationsPage implements OnInit {
  readonly store = inject(CommunicationsStore);
  readonly visibleMessages = computed(() => this.store.messages().filter((item) => item.visibleToBuyer !== false));

  ngOnInit(): void {
    this.store.load();
  }
}

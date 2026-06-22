import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, forkJoin, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConversationMessage, NotificationRecord } from '@app/shared/communications/domain/model/communications.model';
import { CommunicationsApi } from '@app/shared/communications/infrastructure/communications-api';

@Injectable({ providedIn: 'root' })
export class CommunicationsStore {
  private readonly api = inject(CommunicationsApi);

  readonly loading = signal(false);
  readonly loadError = signal(false);
  readonly notifications = signal<NotificationRecord[]>([]);
  readonly messages = signal<ConversationMessage[]>([]);
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);
  readonly recentNotifications = computed(() => this.notifications().slice(0, 6));

  load(): void {
    this.loading.set(true);
    this.loadError.set(false);
    forkJoin({
      notifications: this.api.notifications().pipe(catchError(() => of([] as NotificationRecord[]))),
      messages: this.api.messages().pipe(catchError(() => of([] as ConversationMessage[]))),
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ notifications, messages }) => {
        this.notifications.set(notifications);
        this.messages.set(messages);
      },
      error: () => {
        this.notifications.set([]);
        this.messages.set([]);
        this.loadError.set(true);
      },
    });
  }

  markRead(id: number): void {
    this.api.markNotificationRead(id).pipe(
      tap((updated) => this.notifications.update((items) => items.map((item) => item.id === id ? updated : item))),
    ).subscribe({ error: () => this.loadError.set(true) });
  }
}

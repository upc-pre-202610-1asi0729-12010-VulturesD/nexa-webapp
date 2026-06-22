import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConversationMessage, NotificationRecord } from '@app/shared/communications/domain/model/communications.model';

@Injectable({ providedIn: 'root' })
export class CommunicationsApi {
  private readonly http = inject(HttpClient);

  notifications(): Observable<NotificationRecord[]> {
    return this.http.get<NotificationRecord[]>('api/v1/notifications');
  }

  markNotificationRead(id: number): Observable<NotificationRecord> {
    return this.http.post<NotificationRecord>(`api/v1/notifications/${id}/reads`, {});
  }

  messages(): Observable<ConversationMessage[]> {
    return this.http.get<ConversationMessage[]>('api/v1/conversation-messages');
  }
}

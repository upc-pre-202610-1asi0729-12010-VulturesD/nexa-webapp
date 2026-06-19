import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PortalSnapshot } from '@app/portal/domain/model';
import { PortalApi } from '@app/portal/infrastructure/portal-api';

@Injectable({ providedIn: 'root' })
export class PortalStore {
  private readonly api = inject(PortalApi);

  load(clientId: string): Observable<PortalSnapshot> {
    return this.api.load(clientId);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '@app/clients/domain/model';

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Client[]>('api/v1/clients'); }
}

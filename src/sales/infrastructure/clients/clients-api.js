import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

const FALLBACK_CLIENTS = [
  {
    id: 'CLI-001',
    name: 'Importaciones y Comercio Internacional S.A.',
    tradeName: 'ICISA Demo',
    ruc: '20600000001',
    type: 'B2B Buyer',
    contact: 'Elena Litano',
    phone: '+51 987 654 321',
    address: 'Av. Paseo de la República 123, Miraflores, Lima',
    condition: 'Approved',
    creditLimit: 50000,
    creditUsed: 15400,
    status: 'active',
    lastOrder: '2026-06-05'
  },
  {
    id: 'CLI-002',
    name: 'Gourmet Market Lima S.A.C.',
    ruc: '20600000002',
    type: 'B2B Buyer',
    contact: 'Valeria Sanchez',
    phone: '+51 955 120 210',
    address: 'Av. Larco 456, Miraflores, Lima',
    condition: 'Approved',
    creditLimit: 30000,
    creditUsed: 5000,
    status: 'active',
    lastOrder: '2026-06-04'
  },
  {
    id: 'CLI-003',
    name: 'Distribuidora La Merced S.A.C.',
    ruc: '20600000003',
    type: 'B2B Buyer',
    contact: 'Roberto Garcia',
    phone: '+51 955 230 330',
    address: 'Av. Aramburú 789, San Isidro, Lima',
    condition: 'Approved',
    creditLimit: 20000,
    creditUsed: 0,
    status: 'active',
    lastOrder: '2026-06-01'
  }
];

class ClientsApiService {
  constructor() {
    this.clients = new BaseEndpoint('/api/v1/clients');
  }

  getClients() {
    return this.clients.getAll().catch(err => {
      console.warn("Using fallback clients due to network or endpoint issue:", err);
      return FALLBACK_CLIENTS;
    });
  }

  getClientById(id) {
    return this.clients.getById(id).catch(err => {
      console.warn(`Using fallback client for ID ${id} due to error:`, err);
      return FALLBACK_CLIENTS.find(c => c.id === id) || null;
    });
  }
}

export const clientsApiService = new ClientsApiService();

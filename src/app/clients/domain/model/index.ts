export interface Client {
  id: string; name: string; ruc?: string;
  contact?: string; phone?: string;
  condition?: string; status?: string; type?: string;
  address?: string; lastOrder?: string;
  creditLimit?: number; creditUsed?: number;
}

import { Client } from '@app/clients/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';

/**
 * Aggregate view shown in the buyer portal once they log in.
 * Combines the buyer's client profile, available catalog, and own order history.
 */
export interface PortalSnapshot {
  myOrders: Order[];
  products: Product[];
  client: Client | null;
}

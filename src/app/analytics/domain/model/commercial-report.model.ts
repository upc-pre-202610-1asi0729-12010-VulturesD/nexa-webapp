import { Order } from '@app/ordering/domain/model';
import { OrdersByPriority, OrdersByStatus } from './orders-by-status.model';

export interface CommercialReport {
  byStatus: OrdersByStatus[];
  byPriority: OrdersByPriority[];
  blocked: Order[];
  totalRevenue: number;
}

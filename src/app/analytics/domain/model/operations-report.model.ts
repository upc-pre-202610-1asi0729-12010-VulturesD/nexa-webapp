import { Dispatch } from '@app/dispatch/domain/model';
import { InventoryLot } from '@app/inventory/domain/model';
import { Product } from '@app/catalog/domain/model';
import { DispatchByStatus } from './dispatch-by-status.model';

export interface OperationsReport {
  lowStock: Product[];
  nearExpiry: InventoryLot[];
  activeDispatches: Dispatch[];
  byDispatchStatus: DispatchByStatus[];
}

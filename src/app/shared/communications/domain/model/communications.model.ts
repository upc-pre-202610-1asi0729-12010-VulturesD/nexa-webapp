export interface NotificationRecord {
  id: number;
  tenantId: number;
  clientAccountId?: number | null;
  recipientRole?: string | null;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ConversationMessage {
  id: number;
  tenantId: number;
  clientAccountId?: number | null;
  purchaseRequestId?: number | null;
  orderId?: number | null;
  senderRole: string;
  senderName: string;
  body: string;
  visibleToBuyer: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

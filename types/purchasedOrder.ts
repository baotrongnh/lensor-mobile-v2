export interface PurchasedOrder {
     id: string;
     userId: string;
     totalAmount: string;
     status: 'pending' | 'completed' | 'refunded' | 'reported';
     paymentMethod: 'wallet' | 'vnpay' | 'credit_card';
     transactionId: string;
     createdAt: string;
     updatedAt: string;
     items: PurchasedOrderItem[];
     canWithdraw?: boolean;
     withdrawableAt?: string;
     reportId?: string | null;
     cancelReason?: string | null;
}

export interface PurchasedOrderItem {
     productId: string;
     productTitle: string;
     quantity: number;
     price: number;
     subtotal: number;
     sellerId: string;
     description?: string;
     thumbnail?: string;
     category?: string;
     presetFiles?: string[];
     rating?: number;
     author?: {
          id: string;
          name: string;
          avatar?: string;
     };
}

export interface PurchasedOrdersResponse {
     data: PurchasedOrder[];
}

export interface PurchasedOrderResponse {
     data: PurchasedOrder;
}

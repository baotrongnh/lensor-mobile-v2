export type OrderStatus =
     | 'ready_for_withdrawal'
     | 'pending'
     | 'completed'
     | 'failed'
     | 'refunded'
     | 'reported';

export interface OrderItem {
     productId: string;
     productTitle: string;
     quantity: number;
     price: number;
     subtotal: number;
     sellerId: string;
}

export interface SoldOrder {
     id: string;
     userId: string;
     totalAmount: string;
     status: OrderStatus;
     paymentMethod: string;
     transactionId: string | null;
     items: OrderItem[];
     canWithdraw: boolean;
     withdrawableAt: string;
     reportId: string | null;
     cancelReason: string | null;
     createdAt: string;
     updatedAt: string;
     sellerItems: OrderItem[];
     sellerEarnings: number;
}

export interface SoldOrdersResponse {
     data: SoldOrder[];
}

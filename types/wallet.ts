export interface Transaction {
     id: string;
     transactionType: string;
     status: string;
     description: string;
     amount: string;
     createdAt: string;
}

export interface Wallet {
     id: string;
     userId: string;
     balance: number;
     createdAt: string;
     updatedAt: string;
}

export interface PaymentHistory {
     data: Transaction[];
     total: number;
     page: number;
     limit: number;
}

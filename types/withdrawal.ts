export interface WithdrawalBankInfo {
     bankName: string;
     accountNumber: string;
     accountHolder: string;
}

export interface BankCard {
     id: string;
     userId: string;
     bankName: string;
     accountNumber: string;
     accountHolder: string;
     isDefault: boolean;
     createdAt: string;
     updatedAt: string;
}

export interface CreateBankCardPayload {
     bankName: string;
     accountNumber: string;
     accountHolder: string;
     isDefault?: boolean;
}

export interface BankCardsResponse {
     data: BankCard[];
}

export interface CreateWithdrawalPayload {
     bankCardId: string;
     orderIds: string[];
     note?: string;
}

export interface Withdrawal {
     id: string;
     userId: string;
     bankCardId: string;
     amount: number;
     fee: number;
     netAmount: number;
     actualAmount: number;
     status: 'pending' | 'approved' | 'rejected' | 'completed';
     orders: Array<{ id: string }>;
     bankCard: BankCard;
     note?: string;
     adminNote?: string;
     processedAt?: string;
     createdAt: string;
     updatedAt: string;
}

export interface WithdrawalResponse {
     message: string;
     data: Withdrawal;
}

export interface WithdrawalsResponse {
     data: Withdrawal[];
}

export interface WithdrawalStatistics {
     totalWithdrawals: number;
     totalAmount: number;
     totalFee: number;
     totalActualAmount: number;
     filters?: {
          year?: string;
          month?: string;
     };
}

export interface WithdrawalStatisticsResponse {
     data: WithdrawalStatistics;
}

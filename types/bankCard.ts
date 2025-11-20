export interface BankCard {
     id: string;
     userId: string;
     cardHolderName: string;
     cardNumber: string;
     bankName: string;
     isDefault: boolean;
     createdAt: string;
     updatedAt: string;
}

export interface CreateBankCardPayload {
     cardHolderName: string;
     cardNumber: string;
     bankName: string;
     isDefault?: boolean;
}

export interface UpdateBankCardPayload {
     cardHolderName?: string;
     cardNumber?: string;
     bankName?: string;
     isDefault?: boolean;
}

export interface BankCardsResponse {
     data: BankCard[];
}

export interface BankCardResponse {
     data: BankCard;
}

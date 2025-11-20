export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketMessage {
     id: string;
     ticketId: string;
     senderId: string;
     senderName: string;
     senderRole: 'user' | 'admin';
     message: string;
     attachments: string[];
     createdAt: string;
}

export interface Ticket {
     id: string;
     userId: string;
     userName: string;
     title: string;
     description: string;
     status: TicketStatus;
     priority: TicketPriority;
     category: string;
     attachments: string[];
     messages: TicketMessage[];
     createdAt: string;
     updatedAt: string;
     closedAt?: string;
}

export interface CreateTicketPayload {
     title: string;
     description: string;
     priority: TicketPriority;
     category: string;
     attachments?: any[];
}

export interface AddMessagePayload {
     message: string;
     attachments?: any[];
}

export interface TicketsResponse {
     data: Ticket[];
}

export interface TicketResponse {
     data: Ticket;
}

export interface MessageResponse {
     data: TicketMessage;
}

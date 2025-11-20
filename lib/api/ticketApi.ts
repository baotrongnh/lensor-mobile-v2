import { apiClient } from './client';
import { endpoints } from './endpoints';
import {
     Ticket,
     TicketMessage,
     TicketsResponse,
     TicketResponse,
     MessageResponse,
     CreateTicketPayload,
     AddMessagePayload,
} from '@/types/ticket';

export const ticketApi = {
     async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
          const formData = new FormData();
          formData.append('title', payload.title);
          formData.append('description', payload.description);
          formData.append('priority', payload.priority);
          formData.append('category', payload.category);

          if (payload.attachments && payload.attachments.length > 0) {
               payload.attachments.forEach((file: any) => {
                    const fileUri = file.uri;
                    const fileName = file.fileName || fileUri.split('/').pop() || 'attachment.jpg';
                    const fileType = file.type === 'video' ? 'video/mp4' : 'image/jpeg';

                    formData.append('attachments', {
                         uri: fileUri,
                         name: fileName,
                         type: fileType,
                    } as any);
               });
          }

          const res = await apiClient.post<TicketResponse>(endpoints.tickets.create, formData, {
               headers: {
                    'Content-Type': 'multipart/form-data',
               },
          });
          return res.data.data;
     },

     async getUserTickets(): Promise<Ticket[]> {
          const res = await apiClient.get<TicketsResponse>(endpoints.tickets.all);
          return res.data.data;
     },

     async getTicketById(ticketId: string): Promise<Ticket> {
          const res = await apiClient.get<TicketResponse>(endpoints.tickets.byId(ticketId));
          return res.data.data;
     },

     async addMessage(ticketId: string, payload: AddMessagePayload): Promise<TicketMessage> {
          const formData = new FormData();
          formData.append('message', payload.message);

          if (payload.attachments && payload.attachments.length > 0) {
               payload.attachments.forEach((file: any) => {
                    const fileUri = file.uri;
                    const fileName = file.fileName || fileUri.split('/').pop() || 'attachment.jpg';
                    const fileType = file.type === 'video' ? 'video/mp4' : 'image/jpeg';

                    formData.append('attachments', {
                         uri: fileUri,
                         name: fileName,
                         type: fileType,
                    } as any);
               });
          }

          const res = await apiClient.post<MessageResponse>(
               endpoints.tickets.addMessage(ticketId),
               formData,
               {
                    headers: {
                         'Content-Type': 'multipart/form-data',
                    },
               }
          );
          return res.data.data;
     },

     async closeTicket(ticketId: string): Promise<Ticket> {
          const res = await apiClient.patch<TicketResponse>(endpoints.tickets.close(ticketId));
          return res.data.data;
     },

     async reopenTicket(ticketId: string): Promise<Ticket> {
          const res = await apiClient.patch<TicketResponse>(endpoints.tickets.reopen(ticketId));
          return res.data.data;
     },
};

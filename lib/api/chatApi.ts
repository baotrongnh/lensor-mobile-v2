import { apiClient } from './client';
import { endpoints } from './endpoints';

export interface ChatParticipant {
     id: string;
     name: string;
     avatar: string;
}

export interface LastMessage {
     content: string;
     createdAt: string;
     userId: string;
}

export interface ChatRoom {
     id: string;
     name: string;
     type: 'direct' | 'group';
     participantIds: string[];
     participants: ChatParticipant[];
     lastMessage: LastMessage | null;
     unreadCount: number;
     createdAt: string;
     updatedAt: string;
}

export interface ChatMessage {
     id: string;
     content: string;
     userId: string;
     roomId: string;
     createdAt: string;
     user?: {
          id: string;
          name: string;
          avatar: string;
     };
}

export interface ChatRoomsResponse {
     data: ChatRoom[];
}

export interface ChatMessagesResponse {
     data: ChatMessage[];
}

export const chatApi = {
     /**
      * Get all chat rooms
      */
     getAllRooms: async (): Promise<ChatRoomsResponse> => {
          const res = await apiClient.get(endpoints.message.all);
          return res.data;
     },

     /**
      * Get room details
      */
     getRoomDetail: async (roomId: string) => {
          const res = await apiClient.get(endpoints.message.detail(roomId));
          return res.data;
     },

     /**
      * Get messages in a room
      */
     getMessages: async (roomId: string, limit: number = 50): Promise<ChatMessagesResponse> => {
          const res = await apiClient.get(endpoints.message.allMessage(roomId, limit));
          return res.data;
     },

     /**
      * Create or get direct chat room with another user
      */
     createDirectChat: async (otherUserId: string) => {
          const res = await apiClient.post(endpoints.message.createDirect(otherUserId));
          return res.data;
     },

     /**
      * Send message
      */
     sendMessage: async (roomId: string, content: string) => {
          const res = await apiClient.post(endpoints.message.detail(roomId), {
               content,
          });
          return res.data;
     },
};

import { create } from 'zustand';
import { chatApi, ChatRoom, ChatMessage } from '@/lib/api/chatApi';

interface ChatStore {
     rooms: ChatRoom[];
     currentRoom: ChatRoom | null;
     messages: ChatMessage[];
     loading: boolean;
     error: string | null;

     // Actions
     fetchRooms: () => Promise<void>;
     selectRoom: (room: ChatRoom) => void;
     fetchMessages: (roomId: string, limit?: number) => Promise<void>;
     sendMessage: (roomId: string, content: string) => Promise<void>;
     addMessage: (message: ChatMessage) => void;
     createDirectChat: (otherUserId: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
     rooms: [],
     currentRoom: null,
     messages: [],
     loading: false,
     error: null,

     fetchRooms: async () => {
          set({ loading: true, error: null });
          try {
               const response = await chatApi.getAllRooms();
               set({
                    rooms: response.data,
                    loading: false,
               });
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to fetch chat rooms',
                    loading: false,
               });
          }
     },

     selectRoom: (room: ChatRoom) => {
          set({ currentRoom: room, messages: [] });
     },

     fetchMessages: async (roomId: string, limit = 50) => {
          set({ loading: true, error: null });
          try {
               const response = await chatApi.getMessages(roomId, limit);
               set({
                    messages: response.data,
                    loading: false,
               });
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to fetch messages',
                    loading: false,
               });
          }
     },

     /**
      * Send message via API (not used in mobile - we use socket instead)
      * Keep this for compatibility with API structure
      */
     sendMessage: async (roomId: string, content: string) => {
          try {
               const response = await chatApi.sendMessage(roomId, content);
               // Optionally add the sent message to local state immediately
               if (response.data) {
                    get().addMessage(response.data);
               }
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to send message',
               });
               throw error;
          }
     },

     addMessage: (message: ChatMessage) => {
          set((state) => {
               // Remove temp message with same content if exists
               const filteredMessages = state.messages.filter(m => {
                    // Keep message if it's not a temp message
                    if (!m.id.toString().startsWith('temp-')) return true;

                    // Remove temp message if we're adding the real version
                    if (!message.id.toString().startsWith('temp-')) {
                         // Remove temp with same content and userId
                         return !(m.content === message.content && m.userId === message.userId);
                    }

                    return true;
               });

               // Check if message already exists (prevent duplicates)
               const exists = filteredMessages.some(m => m.id === message.id);
               if (exists) return state;

               return {
                    messages: [...filteredMessages, message],
               };
          });
     },

     createDirectChat: async (otherUserId: string) => {
          set({ loading: true, error: null });
          try {
               const response = await chatApi.createDirectChat(otherUserId);
               if (response.data) {
                    set({ currentRoom: response.data, loading: false });
               }
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to create chat',
                    loading: false,
               });
               throw error;
          }
     },
}));

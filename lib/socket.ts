import { io, Socket } from 'socket.io-client';
import { supabase } from './supabase';
import { DEV_CONFIG } from './auth/devToken';
import { logger } from './utils/logger';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
     private socket: Socket | null = null;
     private isConnected: boolean = false;

     /**
      * Initialize socket connection
      */
     async connect() {
          if (this.socket?.connected) {
               logger.log('Socket already connected');
               return this.socket;
          }

          logger.log('🔌 Socket: Initializing connection...');

          // Get token from Supabase session
          let token: string | null = null;

          if (DEV_CONFIG.USE_DEV_TOKEN) {
               token = DEV_CONFIG.DEV_ACCESS_TOKEN;
          } else {
               const { data: { session } } = await supabase.auth.getSession();
               token = session?.access_token || null;
          }

          if (!token) {
               logger.error('❌ Socket: No token found');
               return null;
          }

          this.socket = io(SOCKET_URL, {
               auth: { token },
               transports: ['websocket', 'polling'],
               reconnection: true,
               reconnectionDelay: 1000,
               reconnectionAttempts: 5,
          });

          this.socket.on('connect', () => {
               logger.log('✅ Socket: Connected successfully', this.socket?.id);
               this.isConnected = true;
          });

          this.socket.on('disconnect', () => {
               logger.log('❌ Socket: Disconnected');
               this.isConnected = false;
          });

          this.socket.on('connect_error', (error) => {
               logger.error('❌ Socket: Connection error:', error.message);
          });

          // Debug: Listen to all events
          this.socket.onAny((eventName, ...args) => {
               logger.log('📨 Socket Event:', eventName, args);
          });

          return this.socket;
     }

     /**
      * Disconnect socket
      */
     disconnect() {
          if (this.socket) {
               this.socket.disconnect();
               this.socket = null;
               this.isConnected = false;
               logger.log('🔌 Socket: Disconnected');
          }
     }

     /**
      * Get socket instance
      */
     getSocket(): Socket | null {
          return this.socket;
     }

     /**
      * Check if socket is connected
      */
     getIsConnected(): boolean {
          return this.isConnected;
     }

     /**
      * Join a chat room
      */
     joinRoom(roomId: string) {
          if (this.socket) {
               this.socket.emit('joinRoom', { roomId });
               logger.log('🚺 Socket: Joined room', roomId);
          }
     }

     /**
      * Leave a chat room
      */
     leaveRoom(roomId: string) {
          if (this.socket) {
               this.socket.emit('leaveRoom', { roomId });
               logger.log('🚺 Socket: Left room', roomId);
          }
     }

     /**
      * Send a message
      */
     async sendMessage(roomId: string, content: string) {
          if (this.socket) {
               const { data: { user } } = await supabase.auth.getUser();
               const userId = user?.id || DEV_CONFIG.DEV_USER.id;

               this.socket.emit('sendMessage', {
                    roomId,
                    content,
                    userId,
               });
               logger.log('💬 Socket: Sent message to', roomId);
          }
     }

     /**
      * Listen for new messages
      */
     onNewMessage(callback: (message: any) => void) {
          if (this.socket) {
               this.socket.on('newMessage', callback);
          }
     }

     /**
      * Listen for typing indicator
      */
     onUserTyping(callback: (data: any) => void) {
          if (this.socket) {
               this.socket.on('userTyping', callback);
          }
     }

     /**
      * Send typing indicator
      */
     async sendTyping(roomId: string, isTyping: boolean) {
          if (this.socket) {
               const { data: { user } } = await supabase.auth.getUser();
               const userId = user?.id || DEV_CONFIG.DEV_USER.id;

               this.socket.emit('typing', {
                    roomId,
                    userId,
                    isTyping,
               });
          }
     }

     /**
      * Remove all listeners for an event
      */
     off(event: string) {
          if (this.socket) {
               this.socket.off(event);
          }
     }
}

// Export singleton instance
export const socketService = new SocketService();

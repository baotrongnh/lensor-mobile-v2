import React from 'react';
import {
     View,
     Text,
     FlatList,
     TextInput,
     TouchableOpacity,
     StyleSheet,
     ActivityIndicator,
     KeyboardAvoidingView,
     Platform,
     Image,
     Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/constants/Colors';
import { useChatStore } from '@/stores/chatStore';
import { ChatMessage } from '@/lib/api/chatApi';
import { socketService } from '@/lib/socket';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/utils/logger';

export default function ChatRoomScreen() {
     const { colors } = useTheme();
     const router = useRouter();
     const params = useLocalSearchParams();
     const roomId = params.id as string;

     const [messageText, setMessageText] = React.useState('');
     const [sending, setSending] = React.useState(false);
     const [currentUserId, setCurrentUserId] = React.useState<string>('');
     const [isTyping, setIsTyping] = React.useState(false);
     const flatListRef = React.useRef<FlatList>(null);
     const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

     const { currentRoom, messages, loading, fetchMessages, sendMessage, addMessage } = useChatStore();

     // Get current user ID
     React.useEffect(() => {
          const getCurrentUser = async () => {
               const { data: { user } } = await supabase.auth.getUser();
               if (user) {
                    setCurrentUserId(user.id);
               }
          };
          getCurrentUser();
     }, []);

     // Initialize socket connection and join room
     React.useEffect(() => {
          socketService.connect();

          if (roomId) {
               socketService.joinRoom(roomId);
               fetchMessages(roomId);
          }

          // Listen for new messages from socket
          socketService.onNewMessage((message) => {
               // Only add real messages from socket (not temp optimistic ones)
               if (message.id && !message.id.toString().startsWith('temp-')) {
                    // Remove any temp message for this content (optimistic update cleanup)
                    const tempMessages = messages.filter(m => m.id.toString().startsWith('temp-'));
                    tempMessages.forEach(tempMsg => {
                         if (tempMsg.content === message.content && tempMsg.userId === message.userId) {
                              // Will be replaced by real message
                         }
                    });

                    addMessage(message);
                    setTimeout(() => {
                         flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
               }
          });

          // Listen for typing indicator
          socketService.onUserTyping((data) => {
               if (data.roomId === roomId && data.userId !== currentUserId) {
                    setIsTyping(data.isTyping);
                    if (data.isTyping) {
                         // Clear typing after 3 seconds
                         setTimeout(() => setIsTyping(false), 3000);
                    }
               }
          });

          return () => {
               if (roomId) {
                    socketService.leaveRoom(roomId);
               }
               socketService.off('newMessage');
               socketService.off('userTyping');

               // Cleanup typing timeout
               if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
               }
          };
     }, [roomId, fetchMessages, addMessage, currentUserId]);

     const handleSend = async () => {
          if (!messageText.trim() || sending || !currentUserId) return;

          const text = messageText.trim();
          const tempMessageId = `temp-${Date.now()}`;
          setMessageText('');
          setSending(true);

          try {
               // Create optimistic message for immediate UI update
               const { data: { user } } = await supabase.auth.getUser();
               const optimisticMessage: ChatMessage = {
                    id: tempMessageId,
                    content: text,
                    userId: currentUserId,
                    roomId,
                    createdAt: new Date().toISOString(),
                    user: {
                         id: currentUserId,
                         name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'You',
                         avatar: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '',
                    },
               };

               // Add optimistic update immediately
               addMessage(optimisticMessage);

               // Scroll to bottom immediately
               setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
               }, 100);

               // Send via socket (backend will persist and broadcast)
               await socketService.sendMessage(roomId, text);

               // Stop typing indicator
               socketService.sendTyping(roomId, false);
          } catch (error) {
               logger.error('Failed to send message:', error);
               Alert.alert('Error', 'Failed to send message. Please try again.');
               // Note: Optimistic message remains, will be replaced by real one from socket
          } finally {
               setSending(false);
          }
     };

     const renderMessage = ({ item }: { item: ChatMessage }) => {
          const isOwn = item.userId === currentUserId;

          return (
               <View style={[styles.messageWrapper, isOwn && styles.ownMessageWrapper]}>
                    {!isOwn && item.user?.avatar && (
                         <Image source={{ uri: item.user.avatar }} style={styles.messageAvatar} />
                    )}
                    <View
                         style={[
                              styles.messageBubble,
                              {
                                   backgroundColor: isOwn ? colors.primary : colors.card,
                                   borderColor: colors.border,
                              },
                              isOwn && styles.ownMessageBubble,
                         ]}
                    >
                         {!isOwn && item.user?.name && (
                              <Text style={[styles.senderName, { color: colors.mutedForeground }]}>
                                   {item.user.name}
                              </Text>
                         )}
                         <Text
                              style={[
                                   styles.messageText,
                                   { color: isOwn ? colors.primaryForeground : colors.foreground },
                              ]}
                         >
                              {item.content}
                         </Text>
                         <Text
                              style={[
                                   styles.messageTime,
                                   { color: isOwn ? colors.primaryForeground + '80' : colors.mutedForeground },
                              ]}
                         >
                              {new Date(item.createdAt).toLocaleTimeString([], {
                                   hour: '2-digit',
                                   minute: '2-digit',
                              })}
                         </Text>
                    </View>
               </View>
          );
     };

     return (
          <KeyboardAvoidingView
               style={[styles.container, { backgroundColor: colors.background }]}
               behavior={Platform.OS === 'ios' ? 'padding' : undefined}
               keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
               {/* Header */}
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/message')} style={styles.backBtn}>
                         <Text style={[styles.backText, { color: colors.foreground }]}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                         {currentRoom && currentRoom.participants[0] && (
                              <>
                                   <Image
                                        source={{
                                             uri: currentRoom.participants[0].avatar || 'https://via.placeholder.com/40',
                                        }}
                                        style={styles.headerAvatar}
                                   />
                                   <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                                        {currentRoom.participants[0].name || currentRoom.name}
                                   </Text>
                              </>
                         )}
                    </View>

                    <View style={{ width: 40 }} />
               </View>

               {/* Messages List */}
               {loading && messages.length === 0 ? (
                    <View style={styles.centerContent}>
                         <ActivityIndicator size="large" color={colors.primary} />
                    </View>
               ) : (
                    <FlatList
                         ref={flatListRef}
                         data={messages}
                         renderItem={renderMessage}
                         keyExtractor={(item) => item.id.toString()}
                         contentContainerStyle={styles.messagesList}
                         inverted={false}
                         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
               )}

               {/* Input Area */}
               <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
                    {isTyping && (
                         <Text style={[styles.typingIndicator, { color: colors.mutedForeground }]}>
                              Typing...
                         </Text>
                    )}
                    <TextInput
                         style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
                         placeholder="Type a message..."
                         placeholderTextColor={colors.mutedForeground}
                         value={messageText}
                         onChangeText={(text) => {
                              setMessageText(text);

                              // Send typing indicator
                              if (text.length > 0) {
                                   socketService.sendTyping(roomId, true);

                                   // Clear previous timeout
                                   if (typingTimeoutRef.current) {
                                        clearTimeout(typingTimeoutRef.current);
                                   }

                                   // Stop typing after 2 seconds of no input
                                   typingTimeoutRef.current = setTimeout(() => {
                                        socketService.sendTyping(roomId, false);
                                   }, 2000);
                              } else {
                                   socketService.sendTyping(roomId, false);
                              }
                         }}
                         multiline
                         maxLength={1000}
                    />
                    <TouchableOpacity
                         style={[
                              styles.sendBtn,
                              {
                                   backgroundColor: messageText.trim() ? colors.primary : colors.muted,
                              },
                         ]}
                         onPress={handleSend}
                         disabled={!messageText.trim() || sending}
                    >
                         {sending ? (
                              <ActivityIndicator size="small" color={colors.primaryForeground} />
                         ) : (
                              <Text style={[styles.sendIcon, { color: colors.primaryForeground }]}>➤</Text>
                         )}
                    </TouchableOpacity>
               </View>
          </KeyboardAvoidingView>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.md,
          paddingTop: Spacing.xl,
          borderBottomWidth: 1,
     },
     backBtn: {
          width: 40,
          height: 40,
          justifyContent: 'center',
     },
     backText: {
          fontSize: 28,
     },
     headerInfo: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: Spacing.sm,
     },
     headerAvatar: {
          width: 36,
          height: 36,
          borderRadius: 18,
          marginRight: Spacing.sm,
     },
     headerTitle: {
          fontSize: 18,
          fontWeight: '600',
     },
     centerContent: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
     messagesList: {
          padding: Spacing.md,
     },
     messageWrapper: {
          flexDirection: 'row',
          marginBottom: Spacing.md,
          maxWidth: '80%',
     },
     ownMessageWrapper: {
          alignSelf: 'flex-end',
          flexDirection: 'row-reverse',
     },
     messageAvatar: {
          width: 32,
          height: 32,
          borderRadius: 16,
          marginRight: Spacing.sm,
     },
     messageBubble: {
          padding: Spacing.md,
          borderRadius: 16,
          borderWidth: 1,
     },
     ownMessageBubble: {
          borderTopRightRadius: 4,
     },
     senderName: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
     },
     messageText: {
          fontSize: 15,
          lineHeight: 20,
     },
     messageTime: {
          fontSize: 11,
          marginTop: 4,
     },
     inputContainer: {
          flexDirection: 'row',
          padding: Spacing.md,
          gap: Spacing.sm,
          borderTopWidth: 1,
     },
     typingIndicator: {
          position: 'absolute',
          top: -20,
          left: Spacing.md,
          fontSize: 12,
          fontStyle: 'italic',
     },
     input: {
          flex: 1,
          minHeight: 40,
          maxHeight: 100,
          borderRadius: 20,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontSize: 15,
     },
     sendBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
     },
     sendIcon: {
          fontSize: 18,
          fontWeight: 'bold',
     },
});

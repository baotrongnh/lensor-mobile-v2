/**
 * Support Ticket Detail Screen
 * Display ticket details and conversation history
 */

import React, { useState, useEffect, useRef } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     TextInput,
     ActivityIndicator,
     Alert,
     Image,
     KeyboardAvoidingView,
     Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import {
     ChevronLeft,
     Send,
     Upload,
     Clock,
     CheckCircle,
     XCircle,
     AlertCircle,
     User,
     X,
} from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { ticketApi } from '@/lib/api/ticketApi';
import { Ticket, TicketMessage, TicketStatus } from '@/types/ticket';
import { formatDate } from '@/lib/utils/dateFormatter';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '@/lib/utils/logger';

export default function SupportTicketDetailScreen() {
     const { colors } = useTheme();
     const router = useRouter();
     const params = useLocalSearchParams();
     const ticketId = params.id as string;

     const [ticket, setTicket] = useState<Ticket | null>(null);
     const [loading, setLoading] = useState(true);
     const [message, setMessage] = useState('');
     const [attachments, setAttachments] = useState<any[]>([]);
     const [sending, setSending] = useState(false);
     const scrollViewRef = useRef<ScrollView>(null);

     const fetchTicketDetail = async () => {
          try {
               setLoading(true);
               const data = await ticketApi.getTicketById(ticketId);
               setTicket(data);
          } catch (error) {
               logger.error('Error fetching ticket detail:', error);
               Alert.alert('Error', 'Failed to load ticket details');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchTicketDetail();
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [ticketId]);

     const handlePickImage = async () => {
          try {
               const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

               if (permissionResult.status !== 'granted') {
                    Alert.alert('Permission Required', 'Please allow access to your photo library');
                    return;
               }

               const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsMultipleSelection: true,
                    quality: 0.8,
               });

               if (!result.canceled) {
                    if (attachments.length + result.assets.length > 3) {
                         Alert.alert('Limit Reached', 'Maximum 3 files allowed per message');
                         return;
                    }
                    setAttachments((prev) => [...prev, ...result.assets]);
               }
          } catch (error) {
               logger.error('Error picking image:', error);
               Alert.alert('Error', 'Failed to pick image');
          }
     };

     const handleRemoveAttachment = (index: number) => {
          setAttachments((prev) => prev.filter((_, i) => i !== index));
     };

     const handleSendMessage = async () => {
          if (!message.trim() && attachments.length === 0) {
               Alert.alert('Error', 'Please enter a message or attach files');
               return;
          }

          try {
               setSending(true);

               await ticketApi.addMessage(ticketId, {
                    message: message.trim(),
                    attachments: attachments.length > 0 ? attachments : undefined,
               });

               setMessage('');
               setAttachments([]);
               await fetchTicketDetail();

               // Scroll to bottom after sending
               setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
               }, 100);
          } catch (error: any) {
               logger.error('Error sending message:', error);
               const errorMessage = error.response?.data?.message || 'Failed to send message';
               Alert.alert('Error', errorMessage);
          } finally {
               setSending(false);
          }
     };

     const handleCloseTicket = async () => {
          Alert.alert('Close Ticket', 'Are you sure you want to close this ticket?', [
               { text: 'Cancel', style: 'cancel' },
               {
                    text: 'Close',
                    style: 'destructive',
                    onPress: async () => {
                         try {
                              await ticketApi.closeTicket(ticketId);
                              Alert.alert('Success', 'Ticket closed successfully');
                              await fetchTicketDetail();
                         } catch (error) {
                              logger.error('Error closing ticket:', error);
                              Alert.alert('Error', 'Failed to close ticket');
                         }
                    },
               },
          ]);
     };

     const handleReopenTicket = async () => {
          try {
               await ticketApi.reopenTicket(ticketId);
               Alert.alert('Success', 'Ticket reopened successfully');
               await fetchTicketDetail();
          } catch (error) {
               logger.error('Error reopening ticket:', error);
               Alert.alert('Error', 'Failed to reopen ticket');
          }
     };

     const getStatusBadge = (status: TicketStatus) => {
          const config: Record<
               TicketStatus,
               { color: string; label: string; Icon: React.ComponentType<any> }
          > = {
               open: { color: '#3B82F6', label: 'Open', Icon: AlertCircle },
               in_progress: { color: '#F59E0B', label: 'In Progress', Icon: Clock },
               resolved: { color: '#10B981', label: 'Resolved', Icon: CheckCircle },
               closed: { color: '#6B7280', label: 'Closed', Icon: XCircle },
          };

          const item = config[status];
          const Icon = item.Icon;

          return (
               <View style={[styles.statusBadge, { backgroundColor: item.color + '20' }]}>
                    <Icon size={16} color={item.color} />
                    <Text style={[styles.statusText, { color: item.color }]}>{item.label}</Text>
               </View>
          );
     };

     if (loading) {
          return (
               <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                         Loading ticket details...
                    </Text>
               </View>
          );
     }

     if (!ticket) {
          return (
               <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.errorText, { color: colors.destructive }]}>Ticket not found</Text>
                    <TouchableOpacity
                         style={[styles.backButton, { backgroundColor: colors.primary }]}
                         onPress={() => router.back()}
                    >
                         <Text style={[styles.backButtonText, { color: colors.primaryForeground }]}>Go Back</Text>
                    </TouchableOpacity>
               </View>
          );
     }

     const canSendMessage = ticket.status !== 'closed';

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               {/* Custom Header */}
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                         onPress={() => router.canGoBack() ? router.back() : router.push('/support')}
                         style={styles.backBtn}
                    >
                         <ChevronLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                         <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
                              Ticket #{ticketId.substring(0, 8)}
                         </Text>
                         {getStatusBadge(ticket.status)}
                    </View>
                    <View style={{ width: 40 }} />
               </View>

               <KeyboardAvoidingView
                    style={styles.content}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
               >

                    {/* Ticket Info */}
                    <View style={[styles.ticketInfo, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                         <Text style={[styles.ticketTitle, { color: colors.foreground }]}>{ticket.title}</Text>
                         <Text style={[styles.ticketDescription, { color: colors.mutedForeground }]}>
                              {ticket.description}
                         </Text>
                         <View style={styles.ticketMeta}>
                              <View style={[styles.metaBadge, { backgroundColor: colors.muted }]}>
                                   <Text style={[styles.metaText, { color: colors.foreground }]}>{ticket.category}</Text>
                              </View>
                              <View style={[styles.metaBadge, { backgroundColor: colors.muted }]}>
                                   <Text style={[styles.metaText, { color: colors.foreground }]}>
                                        Priority: {ticket.priority}
                                   </Text>
                              </View>
                              <Text style={[styles.metaDate, { color: colors.mutedForeground }]}>
                                   {formatDate(ticket.createdAt)}
                              </Text>
                         </View>

                         {/* Action Buttons */}
                         {ticket.status === 'closed' ? (
                              <TouchableOpacity
                                   style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                   onPress={handleReopenTicket}
                              >
                                   <Text style={[styles.actionButtonText, { color: colors.primaryForeground }]}>
                                        Reopen Ticket
                                   </Text>
                              </TouchableOpacity>
                         ) : (
                              <TouchableOpacity
                                   style={[styles.actionButton, { backgroundColor: colors.destructive }]}
                                   onPress={handleCloseTicket}
                              >
                                   <Text style={[styles.actionButtonText, { color: '#fff' }]}>Close Ticket</Text>
                              </TouchableOpacity>
                         )}
                    </View>

                    {/* Messages */}
                    <ScrollView
                         ref={scrollViewRef}
                         style={styles.messagesList}
                         contentContainerStyle={styles.messagesContent}
                         onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                         {ticket.messages.map((msg: TicketMessage, index: number) => {
                              const isSupport = msg.senderRole === 'admin';

                              return (
                                   <View
                                        key={msg.id}
                                        style={[styles.messageWrapper, isSupport && styles.supportMessageWrapper]}
                                   >
                                        <View
                                             style={[
                                                  styles.messageBubble,
                                                  {
                                                       backgroundColor: isSupport ? colors.primary : colors.card,
                                                       borderColor: colors.border,
                                                  },
                                                  isSupport && styles.supportMessageBubble,
                                             ]}
                                        >
                                             {isSupport ? (
                                                  <View style={styles.senderInfo}>
                                                       <User
                                                            size={16}
                                                            color={isSupport ? colors.primaryForeground : colors.primary}
                                                       />
                                                       <Text
                                                            style={[
                                                                 styles.senderName,
                                                                 { color: colors.primaryForeground },
                                                            ]}
                                                       >
                                                            Support Team
                                                       </Text>
                                                  </View>
                                             ) : (
                                                  <Text style={[styles.senderName, { color: colors.mutedForeground }]}>
                                                       You
                                                  </Text>
                                             )}
                                             <Text
                                                  style={[
                                                       styles.messageText,
                                                       {
                                                            color: isSupport
                                                                 ? colors.primaryForeground
                                                                 : colors.foreground,
                                                       },
                                                  ]}
                                             >
                                                  {msg.message}
                                             </Text>
                                             {msg.attachments && msg.attachments.length > 0 && (
                                                  <View style={styles.attachmentsContainer}>
                                                       {msg.attachments.map((url: string, idx: number) => (
                                                            <Image
                                                                 key={idx}
                                                                 source={{ uri: url }}
                                                                 style={styles.attachmentImage}
                                                            />
                                                       ))}
                                                  </View>
                                             )}
                                             <Text
                                                  style={[
                                                       styles.messageTime,
                                                       {
                                                            color: isSupport
                                                                 ? colors.primaryForeground + '80'
                                                                 : colors.mutedForeground,
                                                       },
                                                  ]}
                                             >
                                                  {formatDate(msg.createdAt)}
                                             </Text>
                                        </View>
                                   </View>
                              );
                         })}
                    </ScrollView>

                    {/* Input Area */}
                    {canSendMessage && (
                         <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
                              {attachments.length > 0 && (
                                   <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.attachmentsPreview}
                                   >
                                        {attachments.map((file, index) => (
                                             <View key={index} style={styles.previewItem}>
                                                  <Image source={{ uri: file.uri }} style={styles.previewImage} />
                                                  <TouchableOpacity
                                                       style={[
                                                            styles.removeAttachmentBtn,
                                                            { backgroundColor: colors.destructive },
                                                       ]}
                                                       onPress={() => handleRemoveAttachment(index)}
                                                  >
                                                       <X size={12} color="#fff" />
                                                  </TouchableOpacity>
                                             </View>
                                        ))}
                                   </ScrollView>
                              )}
                              <View style={styles.inputRow}>
                                   <TouchableOpacity
                                        style={[styles.uploadBtn, { backgroundColor: colors.muted }]}
                                        onPress={handlePickImage}
                                        disabled={attachments.length >= 3 || sending}
                                   >
                                        <Upload size={20} color={colors.primary} />
                                   </TouchableOpacity>
                                   <TextInput
                                        style={[
                                             styles.input,
                                             { backgroundColor: colors.muted, color: colors.foreground },
                                        ]}
                                        placeholder="Type your message..."
                                        placeholderTextColor={colors.mutedForeground}
                                        value={message}
                                        onChangeText={setMessage}
                                        multiline
                                        maxLength={1000}
                                        editable={!sending}
                                   />
                                   <TouchableOpacity
                                        style={[
                                             styles.sendBtn,
                                             {
                                                  backgroundColor:
                                                       message.trim() || attachments.length > 0
                                                            ? colors.primary
                                                            : colors.muted,
                                             },
                                        ]}
                                        onPress={handleSendMessage}
                                        disabled={(!message.trim() && attachments.length === 0) || sending}
                                   >
                                        {sending ? (
                                             <ActivityIndicator size="small" color={colors.primaryForeground} />
                                        ) : (
                                             <Send size={18} color={colors.primaryForeground} />
                                        )}
                                   </TouchableOpacity>
                              </View>
                         </View>
                    )}
               </KeyboardAvoidingView>
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     content: {
          flex: 1,
     },
     centerContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.lg,
     },
     loadingText: {
          marginTop: Spacing.md,
          fontSize: 14,
     },
     errorText: {
          fontSize: 16,
          marginBottom: Spacing.md,
     },
     backButton: {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
     },
     backButtonText: {
          fontSize: 15,
          fontWeight: '600',
     },
     header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.md,
          paddingTop: 60,
          paddingBottom: Spacing.md,
          borderBottomWidth: 1,
     },
     backBtn: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
     },
     headerInfo: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginLeft: Spacing.sm,
     },
     headerTitle: {
          fontSize: 16,
          fontWeight: '600',
          flex: 1,
     },
     statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: Spacing.xs,
          paddingVertical: 4,
          borderRadius: 6,
     },
     statusText: {
          fontSize: 11,
          fontWeight: '600',
     },
     ticketInfo: {
          padding: Spacing.md,
          borderBottomWidth: 1,
     },
     ticketTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: Spacing.xs,
     },
     ticketDescription: {
          fontSize: 14,
          lineHeight: 20,
          marginBottom: Spacing.sm,
     },
     ticketMeta: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.xs,
          marginBottom: Spacing.sm,
     },
     metaBadge: {
          paddingHorizontal: Spacing.xs,
          paddingVertical: 4,
          borderRadius: 6,
     },
     metaText: {
          fontSize: 11,
          fontWeight: '600',
     },
     metaDate: {
          fontSize: 11,
          lineHeight: 20,
     },
     actionButton: {
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: Spacing.xs,
     },
     actionButtonText: {
          fontSize: 14,
          fontWeight: '600',
     },
     messagesList: {
          flex: 1,
     },
     messagesContent: {
          padding: Spacing.md,
     },
     messageWrapper: {
          flexDirection: 'row',
          marginBottom: Spacing.md,
          maxWidth: '80%',
     },
     supportMessageWrapper: {
          alignSelf: 'flex-start',
     },
     messageBubble: {
          flex: 1,
          padding: Spacing.md,
          borderRadius: 16,
          borderWidth: 1,
     },
     supportMessageBubble: {
          borderTopLeftRadius: 4,
     },
     senderInfo: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 4,
     },
     senderName: {
          fontSize: 12,
          fontWeight: '600',
     },
     messageText: {
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 4,
     },
     attachmentsContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.xs,
          marginTop: Spacing.xs,
     },
     attachmentImage: {
          width: 100,
          height: 100,
          borderRadius: 8,
     },
     messageTime: {
          fontSize: 11,
          marginTop: 4,
     },
     inputContainer: {
          borderTopWidth: 1,
          padding: Spacing.md,
     },
     attachmentsPreview: {
          marginBottom: Spacing.sm,
     },
     previewItem: {
          position: 'relative',
          marginRight: Spacing.xs,
     },
     previewImage: {
          width: 60,
          height: 60,
          borderRadius: 8,
     },
     removeAttachmentBtn: {
          position: 'absolute',
          top: -6,
          right: -6,
          width: 20,
          height: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
     },
     inputRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
          alignItems: 'flex-end',
     },
     uploadBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
     },
     input: {
          flex: 1,
          minHeight: 40,
          maxHeight: 100,
          borderRadius: 20,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontSize: 14,
     },
     sendBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
     },
});

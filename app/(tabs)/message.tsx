import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { router } from 'expo-router';
import { chatApi, ChatRoom } from '@/lib/api/chatApi';
import { useUserStore } from '@/stores/userStore';

export default function MessageScreen() {
     const { t } = useTranslation();
     const { colors } = useTheme();
     const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          fetchChatRooms();
     }, []);

     const fetchChatRooms = async () => {
          try {
               setLoading(true);
               const response = await chatApi.getAllRooms();
               setChatRooms(response.data || []);
          } catch (error) {
               // Error fetching chat rooms
          } finally {
               setLoading(false);
          }
     };

     const formatTime = (time: string) => {
          try {
               const date = new Date(time);
               const now = new Date();
               const diff = now.getTime() - date.getTime();
               const hours = Math.floor(diff / 3600000);
               const days = Math.floor(diff / 86400000);

               if (hours < 24) {
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
               } else if (days === 1) {
                    return 'Yesterday';
               } else if (days < 7) {
                    return `${days} days ago`;
               } else {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
               }
          } catch {
               return time;
          }
     };

     const renderChatItem = ({ item }: { item: ChatRoom }) => {
          const currentUserId = useUserStore.getState().user?.id;
          const otherParticipant = item.participants?.find(p => p.id !== currentUserId) || item.participants?.[0];
          const avatar = otherParticipant?.avatar || 'https://i.pravatar.cc/150?img=1';
          const name = otherParticipant?.name || item.name || 'Unknown';
          const lastMessage = item.lastMessage?.content || 'No messages yet';
          const time = item.lastMessage?.createdAt ? formatTime(item.lastMessage.createdAt) : '';

          return (
               <TouchableOpacity
                    style={[styles.chatItem, { borderBottomColor: colors.border }]}
                    onPress={() => router.push(`/chat-detail/${item.id}` as any)}
               >
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <View style={styles.chatContent}>
                         <View style={styles.chatHeader}>
                              <Text style={[styles.chatName, { color: colors.foreground }]}>
                                   {name}
                              </Text>
                              <Text style={[styles.chatTime, { color: colors.mutedForeground }]}>
                                   {time}
                              </Text>
                         </View>
                         <View style={styles.chatFooter}>
                              <Text
                                   style={[styles.chatMessage, { color: colors.mutedForeground }]}
                                   numberOfLines={1}
                              >
                                   {lastMessage}
                              </Text>
                              {item.unreadCount > 0 && (
                                   <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.unreadText, { color: colors.primaryForeground }]}>
                                             {item.unreadCount}
                                        </Text>
                                   </View>
                              )}
                         </View>
                    </View>
               </TouchableOpacity>
          );
     };

     if (loading) {
          return (
               <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                         <Text style={[styles.headerTitle, { color: colors.foreground }]}>Messages</Text>
                    </View>
                    <View style={styles.loadingContainer}>
                         <ActivityIndicator size="large" color={colors.primary} />
                    </View>
               </View>
          );
     }

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Messages</Text>
                    <TouchableOpacity>
                         <Search size={24} color={colors.foreground} />
                    </TouchableOpacity>
               </View>

               {chatRooms.length === 0 ? (
                    <View style={styles.emptyState}>
                         <MessageCircle size={64} color={colors.mutedForeground} opacity={0.5} />
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                              No messages yet
                         </Text>
                         <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
                              Start a conversation with sellers or buyers
                         </Text>
                    </View>
               ) : (
                    <FlatList
                         data={chatRooms}
                         renderItem={renderChatItem}
                         keyExtractor={item => item.id}
                         contentContainerStyle={styles.listContent}
                         refreshing={loading}
                         onRefresh={fetchChatRooms}
                    />
               )}
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.md,
          borderBottomWidth: 1,
          paddingTop: Spacing.xxl + Spacing.md,
     },
     headerTitle: {
          fontSize: FontSizes.xxl,
          fontWeight: FontWeights.bold,
     },
     listContent: {
          flexGrow: 1,
     },
     chatItem: {
          flexDirection: 'row',
          padding: Spacing.md,
          borderBottomWidth: 1,
          gap: Spacing.sm,
     },
     avatar: {
          width: 56,
          height: 56,
          borderRadius: 28,
     },
     chatContent: {
          flex: 1,
          justifyContent: 'center',
     },
     chatHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
     },
     chatName: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
     },
     chatTime: {
          fontSize: FontSizes.xs,
     },
     chatFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
     },
     chatMessage: {
          fontSize: FontSizes.sm,
          flex: 1,
     },
     unreadBadge: {
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 6,
     },
     unreadText: {
          fontSize: FontSizes.xs,
          fontWeight: FontWeights.bold,
     },
     emptyState: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
     },
     emptyText: {
          fontSize: FontSizes.lg,
          fontWeight: FontWeights.semibold,
          marginTop: Spacing.md,
     },
     emptySubtext: {
          fontSize: FontSizes.sm,
          marginTop: Spacing.xs,
          textAlign: 'center',
     },
     loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
});

import React from 'react';
import {
     View,
     Text,
     FlatList,
     TouchableOpacity,
     StyleSheet,
     ActivityIndicator,
     Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/constants/Colors';
import { useChatStore } from '@/stores/chatStore';
import { ChatRoom } from '@/lib/api/chatApi';

export default function ChatScreen() {
     const { colors } = useTheme();
     const router = useRouter();
     const { rooms, loading, fetchRooms, selectRoom } = useChatStore();

     React.useEffect(() => {
          fetchRooms();
     }, [fetchRooms]);

     const handleSelectRoom = (room: ChatRoom) => {
          selectRoom(room);
          router.push(`/chat-detail/${room.id}` as any);
     };

     const formatTime = (dateString: string) => {
          const date = new Date(dateString);
          const now = new Date();
          const diff = now.getTime() - date.getTime();
          const hours = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);

          if (hours < 1) return 'Just now';
          if (hours < 24) return `${hours}h ago`;
          if (days < 7) return `${days}d ago`;
          return date.toLocaleDateString();
     };

     const renderChatItem = ({ item }: { item: ChatRoom }) => {
          const otherUser = item.participants[0];

          return (
               <TouchableOpacity
                    style={[styles.chatItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleSelectRoom(item)}
               >
                    {/* Avatar */}
                    <Image
                         source={{ uri: otherUser?.avatar || 'https://via.placeholder.com/50' }}
                         style={styles.avatar}
                    />

                    {/* Chat Info */}
                    <View style={styles.chatInfo}>
                         <View style={styles.chatHeader}>
                              <Text style={[styles.chatName, { color: colors.foreground }]} numberOfLines={1}>
                                   {otherUser?.name || item.name}
                              </Text>
                              {item.lastMessage && (
                                   <Text style={[styles.chatTime, { color: colors.mutedForeground }]}>
                                        {formatTime(item.lastMessage.createdAt)}
                                   </Text>
                              )}
                         </View>

                         <View style={styles.chatFooter}>
                              <Text
                                   style={[styles.lastMessage, { color: colors.mutedForeground }]}
                                   numberOfLines={1}
                              >
                                   {item.lastMessage?.content || 'No messages yet'}
                              </Text>
                              {item.unreadCount > 0 && (
                                   <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>
                                             {item.unreadCount > 99 ? '99+' : item.unreadCount}
                                        </Text>
                                   </View>
                              )}
                         </View>
                    </View>
               </TouchableOpacity>
          );
     };

     if (loading && rooms.length === 0) {
          return (
               <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.centerContent}>
                         <ActivityIndicator size="large" color={colors.primary} />
                    </View>
               </View>
          );
     }

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               {/* Header */}
               <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
               </View>

               {/* Chat List */}
               {rooms.length === 0 ? (
                    <View style={styles.centerContent}>
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                              No conversations yet
                         </Text>
                         <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
                              Start a conversation from the marketplace
                         </Text>
                    </View>
               ) : (
                    <FlatList
                         data={rooms}
                         renderItem={renderChatItem}
                         keyExtractor={(item) => item.id}
                         contentContainerStyle={styles.listContent}
                         refreshing={loading}
                         onRefresh={fetchRooms}
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
          padding: Spacing.lg,
          paddingTop: 60,
          borderBottomWidth: 1,
     },
     title: {
          fontSize: 28,
          fontWeight: 'bold',
     },
     centerContent: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: Spacing.xl,
     },
     emptyText: {
          fontSize: 18,
          fontWeight: '500',
          marginBottom: Spacing.sm,
     },
     emptySubtext: {
          fontSize: 14,
          textAlign: 'center',
     },
     listContent: {
          padding: Spacing.md,
     },
     chatItem: {
          flexDirection: 'row',
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          marginBottom: Spacing.sm,
     },
     avatar: {
          width: 50,
          height: 50,
          borderRadius: 25,
     },
     chatInfo: {
          flex: 1,
          marginLeft: Spacing.md,
          justifyContent: 'center',
     },
     chatHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
     },
     chatName: {
          fontSize: 16,
          fontWeight: '600',
          flex: 1,
     },
     chatTime: {
          fontSize: 12,
          marginLeft: Spacing.sm,
     },
     chatFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
     },
     lastMessage: {
          fontSize: 14,
          flex: 1,
     },
     badge: {
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          paddingHorizontal: 6,
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: Spacing.sm,
     },
     badgeText: {
          fontSize: 11,
          fontWeight: 'bold',
     },
});

/**
 * Support Screen
 * Display support tickets with status tracking
 */

import React, { useEffect, useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     RefreshControl,
     ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import {
     ChevronLeft,
     Plus,
     MessageSquare,
     Clock,
     CheckCircle,
     XCircle,
     AlertCircle,
     ChevronRight,
} from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { router } from 'expo-router';
import { ticketApi } from '@/lib/api/ticketApi';
import { Ticket, TicketStatus } from '@/types/ticket';
import { formatDate } from '@/lib/utils/dateFormatter';
import CreateTicketModal from '@/components/support/CreateTicketModal';

export default function SupportScreen() {
     const { colors } = useTheme();
     const [tickets, setTickets] = useState<Ticket[]>([]);
     const [loading, setLoading] = useState(false);
     const [refreshing, setRefreshing] = useState(false);
     const [activeTab, setActiveTab] = useState<'all' | TicketStatus>('all');
     const [createModalVisible, setCreateModalVisible] = useState(false);

     useEffect(() => {
          fetchTickets();
     }, []);

     const fetchTickets = async () => {
          try {
               setLoading(true);
               const data = await ticketApi.getUserTickets();
               setTickets(data);
          } catch (error) {
               console.error('Error fetching tickets:', error);
          } finally {
               setLoading(false);
               setRefreshing(false);
          }
     };

     const handleRefresh = () => {
          setRefreshing(true);
          fetchTickets();
     };

     const filteredTickets =
          activeTab === 'all' ? tickets : tickets.filter((ticket) => ticket.status === activeTab);

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
               <View style={[styles.badge, { backgroundColor: item.color + '20' }]}>
                    <Icon size={12} color={item.color} />
                    <Text style={[styles.badgeText, { color: item.color }]}>{item.label}</Text>
               </View>
          );
     };

     const getPriorityBadge = (priority: string) => {
          const config: Record<string, { color: string; label: string }> = {
               low: { color: '#6B7280', label: 'Low' },
               medium: { color: '#3B82F6', label: 'Medium' },
               high: { color: '#F97316', label: 'High' },
               urgent: { color: '#EF4444', label: 'Urgent' },
          };

          const item = config[priority] || config.medium;

          return (
               <View style={[styles.priorityBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.priorityBadgeText}>{item.label}</Text>
               </View>
          );
     };

     const stats = {
          total: tickets.length,
          open: tickets.filter((t) => t.status === 'open').length,
          in_progress: tickets.filter((t) => t.status === 'in_progress').length,
          resolved: tickets.filter((t) => t.status === 'resolved').length,
          closed: tickets.filter((t) => t.status === 'closed').length,
     };

     return (
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
               {/* Custom Header */}
               <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                         onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/profile'))}
                         style={styles.backBtn}
                    >
                         <ChevronLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Support Tickets</Text>
                    <TouchableOpacity
                         style={[styles.addBtn, { backgroundColor: colors.primary }]}
                         onPress={() => setCreateModalVisible(true)}
                    >
                         <Plus size={20} color={colors.primaryForeground} />
                    </TouchableOpacity>
               </View>

               {/* Stats Cards */}
               <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.statsScroll}
                    contentContainerStyle={styles.statsContainer}
               >
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.total}</Text>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <AlertCircle size={20} color="#3B82F6" />
                         <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.open}</Text>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Open</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <Clock size={20} color="#F59E0B" />
                         <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.in_progress}</Text>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>In Progress</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <CheckCircle size={20} color="#10B981" />
                         <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.resolved}</Text>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Resolved</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <XCircle size={20} color="#6B7280" />
                         <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.closed}</Text>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Closed</Text>
                    </View>
               </ScrollView>

               {/* Tabs */}
               <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsScroll}
                    contentContainerStyle={styles.tabsContainer}
               >
                    <TouchableOpacity
                         style={[styles.tab, activeTab === 'all' && { borderBottomColor: colors.primary }]}
                         onPress={() => setActiveTab('all')}
                    >
                         <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.primary : colors.mutedForeground }]}>
                              All ({stats.total})
                         </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                         style={[styles.tab, activeTab === 'open' && { borderBottomColor: colors.primary }]}
                         onPress={() => setActiveTab('open')}
                    >
                         <Text style={[styles.tabText, { color: activeTab === 'open' ? colors.primary : colors.mutedForeground }]}>
                              Open ({stats.open})
                         </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                         style={[styles.tab, activeTab === 'in_progress' && { borderBottomColor: colors.primary }]}
                         onPress={() => setActiveTab('in_progress')}
                    >
                         <Text style={[styles.tabText, { color: activeTab === 'in_progress' ? colors.primary : colors.mutedForeground }]}>
                              In Progress ({stats.in_progress})
                         </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                         style={[styles.tab, activeTab === 'resolved' && { borderBottomColor: colors.primary }]}
                         onPress={() => setActiveTab('resolved')}
                    >
                         <Text style={[styles.tabText, { color: activeTab === 'resolved' ? colors.primary : colors.mutedForeground }]}>
                              Resolved ({stats.resolved})
                         </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                         style={[styles.tab, activeTab === 'closed' && { borderBottomColor: colors.primary }]}
                         onPress={() => setActiveTab('closed')}
                    >
                         <Text style={[styles.tabText, { color: activeTab === 'closed' ? colors.primary : colors.mutedForeground }]}>
                              Closed ({stats.closed})
                         </Text>
                    </TouchableOpacity>
               </ScrollView>

               {/* Tickets List */}
               <ScrollView
                    style={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
               >
                    {loading ? (
                         <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                    ) : filteredTickets.length === 0 ? (
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tickets found</Text>
                    ) : (
                         filteredTickets.map((ticket) => (
                              <TouchableOpacity
                                   key={ticket.id}
                                   style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                   onPress={() => router.push(`/support/${ticket.id}` as any)}
                              >
                                   <View style={styles.ticketHeader}>
                                        <Text style={[styles.ticketId, { color: colors.mutedForeground }]}>
                                             #{ticket.id.substring(0, 8)}
                                        </Text>
                                        {getStatusBadge(ticket.status)}
                                   </View>

                                   <Text style={[styles.ticketTitle, { color: colors.foreground }]} numberOfLines={2}>
                                        {ticket.title}
                                   </Text>

                                   <View style={styles.ticketMeta}>
                                        <View style={[styles.categoryBadge, { backgroundColor: colors.muted }]}>
                                             <Text style={[styles.categoryText, { color: colors.foreground }]}>{ticket.category}</Text>
                                        </View>
                                        {getPriorityBadge(ticket.priority)}
                                   </View>

                                   <View style={styles.ticketFooter}>
                                        <View style={styles.messageCount}>
                                             <MessageSquare size={14} color={colors.mutedForeground} />
                                             <Text style={[styles.messageCountText, { color: colors.mutedForeground }]}>
                                                  {ticket.messages.length}
                                             </Text>
                                        </View>
                                        <Text style={[styles.ticketDate, { color: colors.mutedForeground }]}>
                                             {formatDate(ticket.createdAt)}
                                        </Text>
                                        <ChevronRight size={16} color={colors.mutedForeground} />
                                   </View>
                              </TouchableOpacity>
                         ))
                    )}
               </ScrollView>

               {/* Create Ticket Modal */}
               <CreateTicketModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onSuccess={() => {
                         setCreateModalVisible(false);
                         fetchTickets();
                    }}
               />
          </SafeAreaView>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.md,
          borderBottomWidth: 1,
     },
     backBtn: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
     },
     headerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          flex: 1,
          textAlign: 'center',
     },
     addBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
     },
     statsScroll: {
          flexGrow: 0,
     },
     statsContainer: {
          flexDirection: 'row',
          padding: Spacing.md,
          gap: Spacing.sm,
     },
     statCard: {
          minWidth: 100,
          padding: Spacing.sm,
          borderRadius: 12,
          borderWidth: 1,
          alignItems: 'center',
          gap: 4,
     },
     statValue: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     statLabel: {
          fontSize: 12,
     },
     tabsScroll: {
          flexGrow: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
     },
     tabsContainer: {
          flexDirection: 'row',
          paddingHorizontal: Spacing.md,
     },
     tab: {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderBottomWidth: 2,
          borderBottomColor: 'transparent',
     },
     tabText: {
          fontSize: 14,
          fontWeight: '600',
     },
     list: {
          flex: 1,
          padding: Spacing.md,
     },
     loader: {
          marginVertical: Spacing.xl,
     },
     emptyText: {
          fontSize: 14,
          textAlign: 'center',
          marginVertical: Spacing.xl,
     },
     ticketCard: {
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          marginBottom: Spacing.md,
     },
     ticketHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.xs,
     },
     ticketId: {
          fontSize: 12,
          fontFamily: 'monospace',
     },
     badge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: Spacing.xs,
          paddingVertical: 4,
          borderRadius: 6,
     },
     badgeText: {
          fontSize: 11,
          fontWeight: '600',
     },
     ticketTitle: {
          fontSize: 16,
          fontWeight: '600',
          marginBottom: Spacing.sm,
     },
     ticketMeta: {
          flexDirection: 'row',
          gap: Spacing.xs,
          marginBottom: Spacing.sm,
     },
     categoryBadge: {
          paddingHorizontal: Spacing.xs,
          paddingVertical: 4,
          borderRadius: 6,
     },
     categoryText: {
          fontSize: 11,
          fontWeight: '600',
     },
     priorityBadge: {
          paddingHorizontal: Spacing.xs,
          paddingVertical: 4,
          borderRadius: 6,
     },
     priorityBadgeText: {
          fontSize: 11,
          fontWeight: '600',
          color: '#fff',
     },
     ticketFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
     },
     messageCount: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
     },
     messageCountText: {
          fontSize: 12,
     },
     ticketDate: {
          flex: 1,
          fontSize: 12,
     },
});

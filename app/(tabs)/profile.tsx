import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, ShoppingBag, DollarSign, Package, Settings, LogOut, History, User as UserIcon, HelpCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { getUserFollowers, getUserFollowing } from '@/lib/api/followApi';
import { userApi } from '@/lib/api/userApi';

export default function ProfileScreen() {
     const { t } = useTranslation();
     const { colors, toggleTheme, theme } = useTheme();
     const { user, setUser } = useUserStore();
     const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
     const [loading, setLoading] = useState(false);

     useEffect(() => {
          const fetchUser = async () => {
               const { data: { user: supabaseUser } } = await supabase.auth.getUser();
               if (supabaseUser) {
                    setUser({
                         id: supabaseUser.id,
                         email: supabaseUser.email || '',
                         name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
                         avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || undefined,
                    });
               }
          };
          fetchUser();
     }, [setUser]);

     useEffect(() => {
          if (user?.id) {
               fetchStats();
          }
     }, [user?.id]);

     const fetchStats = async () => {
          if (!user?.id) return;
          try {
               setLoading(true);
               const [followersRes, followingRes, profileRes] = await Promise.all([
                    getUserFollowers(user.id),
                    getUserFollowing(user.id),
                    userApi.getUserProfile(user.id),
               ]);
               setStats({
                    followers: followersRes.data.length,
                    following: followingRes.data.length,
                    posts: profileRes.data.posts.length,
               });
          } catch (error) {
               console.error('Error fetching stats:', error);
          } finally {
               setLoading(false);
          }
     };

     const handleLogout = async () => {
          try {
               await supabase.auth.signOut();
               router.replace('/login');
          } catch {
               // Logout error
          }
     };

     const menuItems = [
          {
               icon: DollarSign,
               label: 'Wallet',
               subtitle: 'Manage your balance',
               onPress: () => router.push('/wallet'),
               color: '#10b981',
          },
          {
               icon: Package,
               label: 'Sold Orders',
               subtitle: 'Manage your sold products',
               onPress: () => router.push('/sold-orders'),
               color: '#f59e0b',
          },
          {
               icon: ShoppingBag,
               label: 'Purchased Orders',
               subtitle: 'View your purchase history',
               onPress: () => router.push('/purchased-orders'),
               color: '#3b82f6',
          },
          {
               icon: History,
               label: 'Withdrawal History',
               subtitle: 'Track your withdrawals',
               onPress: () => router.push('/withdrawal-history'),
               color: '#8b5cf6',
          },
          {
               icon: UserIcon,
               label: 'My Posts',
               subtitle: 'View your forum posts',
               onPress: () => router.push('/my-posts'),
               color: '#06b6d4',
          },
          {
               icon: HelpCircle,
               label: 'Support',
               subtitle: 'Get help and create tickets',
               onPress: () => router.push('/support'),
               color: '#ec4899',
          },
          {
               icon: Settings,
               label: 'Settings',
               subtitle: 'App preferences and account',
               onPress: () => router.push('/settings'),
               color: '#6b7280',
          },
     ];

     return (
          <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                         {t('Tabs.profile')}
                    </Text>
               </View>

               <View style={styles.content}>
                    {/* Profile Card */}
                    <Card style={styles.profileCard}>
                         <View style={styles.profileHeader}>
                              <Avatar
                                   source={user?.avatarUrl}
                                   name={user?.name || user?.email?.charAt(0) || 'G'}
                                   size={80}
                              />
                              <Text style={[styles.profileName, { color: colors.foreground }]}>
                                   {user?.name || 'Loading...'}
                              </Text>
                              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                                   {user?.email || 'Loading...'}
                              </Text>
                              {user && (
                                   <View style={styles.statsContainer}>
                                        <View style={styles.statItem}>
                                             {loading ? (
                                                  <ActivityIndicator size="small" color={colors.primary} />
                                             ) : (
                                                  <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.posts}</Text>
                                             )}
                                             <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Posts</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                             {loading ? (
                                                  <ActivityIndicator size="small" color={colors.primary} />
                                             ) : (
                                                  <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.followers}</Text>
                                             )}
                                             <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Followers</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                             {loading ? (
                                                  <ActivityIndicator size="small" color={colors.primary} />
                                             ) : (
                                                  <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.following}</Text>
                                             )}
                                             <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Following</Text>
                                        </View>
                                   </View>
                              )}
                         </View>
                    </Card>

                    {/* Menu Items */}
                    <Card style={styles.menuCard}>
                         {menuItems.map((item, index) => (
                              <TouchableOpacity
                                   key={index}
                                   style={[
                                        styles.menuItem,
                                        index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                                   ]}
                                   onPress={item.onPress}
                              >
                                   <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                                        <item.icon size={24} color={item.color} />
                                   </View>
                                   <View style={styles.menuContent}>
                                        <Text style={[styles.menuLabel, { color: colors.foreground }]}>
                                             {item.label}
                                        </Text>
                                        <Text style={[styles.menuSubtitle, { color: colors.mutedForeground }]}>
                                             {item.subtitle}
                                        </Text>
                                   </View>
                              </TouchableOpacity>
                         ))}
                    </Card>

                    {/* Theme Toggle */}
                    <Card style={styles.settingsCard}>
                         <View style={styles.settingItem}>
                              <View style={styles.settingLeft}>
                                   {theme === 'dark' ? (
                                        <Moon size={20} color={colors.foreground} strokeWidth={2} />
                                   ) : theme === 'light' ? (
                                        <Sun size={20} color={colors.foreground} strokeWidth={2} />
                                   ) : (
                                        <Globe size={20} color={colors.foreground} strokeWidth={2} />
                                   )}
                                   <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                                        {t('Button.darkMode')}
                                   </Text>
                              </View>
                              <Button onPress={toggleTheme} variant="outline" size="sm">
                                   {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Auto'}
                              </Button>
                         </View>
                    </Card>

                    {/* Logout Button */}
                    <TouchableOpacity
                         style={[styles.logoutButton, { backgroundColor: colors.destructive }]}
                         onPress={handleLogout}
                    >
                         <LogOut size={20} color={colors.destructiveForeground} />
                         <Text style={[styles.logoutButtonText, { color: colors.destructiveForeground }]}>
                              {t('Button.logout')}
                         </Text>
                    </TouchableOpacity>
               </View>
          </ScrollView>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          padding: Spacing.md,
          borderBottomWidth: 1,
          paddingTop: Spacing.xxl + Spacing.md,
     },
     headerTitle: {
          fontSize: FontSizes.xxl,
          fontWeight: FontWeights.bold,
     },
     content: {
          flex: 1,
          padding: Spacing.md,
     },
     profileCard: {
          marginBottom: Spacing.md,
     },
     profileHeader: {
          alignItems: 'center',
          gap: Spacing.sm,
     },
     profileName: {
          fontSize: FontSizes.xl,
          fontWeight: FontWeights.bold,
          marginTop: Spacing.sm,
     },
     profileEmail: {
          fontSize: FontSizes.md,
     },
     statsContainer: {
          flexDirection: 'row',
          gap: Spacing.xl,
          marginTop: Spacing.md,
     },
     statItem: {
          alignItems: 'center',
     },
     statValue: {
          fontSize: FontSizes.lg,
          fontWeight: FontWeights.bold,
     },
     statLabel: {
          fontSize: FontSizes.xs,
          marginTop: 2,
     },
     settingsCard: {
          marginBottom: Spacing.md,
     },
     settingItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
     },
     settingLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
     },
     settingLabel: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.medium,
     },
     menuCard: {
          marginBottom: Spacing.md,
          padding: 0,
     },
     menuItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.md,
          gap: Spacing.md,
     },
     menuIconContainer: {
          width: 48,
          height: 48,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
     },
     menuContent: {
          flex: 1,
     },
     menuLabel: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
          marginBottom: 2,
     },
     menuSubtitle: {
          fontSize: FontSizes.sm,
     },
     logoutButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          padding: Spacing.md,
          borderRadius: 12,
          marginTop: Spacing.md,
          marginBottom: Spacing.xl,
     },
     logoutButtonText: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
     },
});

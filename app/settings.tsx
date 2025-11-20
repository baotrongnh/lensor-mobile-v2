/**
 * Settings Screen
 * User settings and preferences
 */

import React, { useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     Switch,
     Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
     Lock,
     Globe,
     HelpCircle,
     FileText,
     Shield,
     ChevronRight,
     ChevronLeft,
} from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { router } from 'expo-router';

export default function SettingsScreen() {
     const { colors } = useTheme();
     const [notifications, setNotifications] = useState({
          push: true,
          email: true,
          orders: true,
          marketing: false,
     });

     const [privacy, setPrivacy] = useState({
          profileVisible: true,
          showEmail: false,
          showPhone: false,
     });

     const handleNotificationChange = (key: keyof typeof notifications) => {
          setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
     };

     const handlePrivacyChange = (key: keyof typeof privacy) => {
          setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
     };

     const handleChangePassword = () => {
          Alert.alert('Change Password', 'Please use the web version to change your password');
     };

     const handleDeleteAccount = () => {
          Alert.alert(
               'Delete Account',
               'Are you sure you want to delete your account? This action cannot be undone.',
               [
                    { text: 'Cancel', style: 'cancel' },
                    {
                         text: 'Delete',
                         style: 'destructive',
                         onPress: () => Alert.alert('Error', 'Please use the web version to delete your account'),
                    },
               ]
          );
     };

     const settingSections = [
          {
               title: 'Notifications',
               items: [
                    {
                         label: 'Push Notifications',
                         description: 'Receive push notifications',
                         value: notifications.push,
                         onToggle: () => handleNotificationChange('push'),
                         type: 'switch',
                    },
                    {
                         label: 'Email Notifications',
                         description: 'Receive email updates',
                         value: notifications.email,
                         onToggle: () => handleNotificationChange('email'),
                         type: 'switch',
                    },
                    {
                         label: 'Order Updates',
                         description: 'Notifications about your orders',
                         value: notifications.orders,
                         onToggle: () => handleNotificationChange('orders'),
                         type: 'switch',
                    },
                    {
                         label: 'Marketing',
                         description: 'Promotional offers and news',
                         value: notifications.marketing,
                         onToggle: () => handleNotificationChange('marketing'),
                         type: 'switch',
                    },
               ],
          },
          {
               title: 'Privacy',
               items: [
                    {
                         label: 'Profile Visibility',
                         description: 'Make your profile public',
                         value: privacy.profileVisible,
                         onToggle: () => handlePrivacyChange('profileVisible'),
                         type: 'switch',
                    },
                    {
                         label: 'Show Email',
                         description: 'Display email on profile',
                         value: privacy.showEmail,
                         onToggle: () => handlePrivacyChange('showEmail'),
                         type: 'switch',
                    },
                    {
                         label: 'Show Phone',
                         description: 'Display phone on profile',
                         value: privacy.showPhone,
                         onToggle: () => handlePrivacyChange('showPhone'),
                         type: 'switch',
                    },
               ],
          },
          {
               title: 'Account',
               items: [
                    {
                         icon: Lock,
                         label: 'Change Password',
                         description: 'Update your password',
                         onPress: handleChangePassword,
                         type: 'link',
                    },
                    {
                         icon: Globe,
                         label: 'Language',
                         description: 'English',
                         onPress: () => Alert.alert('Language', 'Language settings coming soon'),
                         type: 'link',
                    },
               ],
          },
          {
               title: 'Support',
               items: [
                    {
                         icon: HelpCircle,
                         label: 'Help Center',
                         description: 'Get help and support',
                         onPress: () => router.push('/create-ticket'),
                         type: 'link',
                    },
                    {
                         icon: FileText,
                         label: 'Terms of Service',
                         description: 'Read our terms',
                         onPress: () => Alert.alert('Terms', 'Please visit our website'),
                         type: 'link',
                    },
                    {
                         icon: Shield,
                         label: 'Privacy Policy',
                         description: 'Read our privacy policy',
                         onPress: () => Alert.alert('Privacy', 'Please visit our website'),
                         type: 'link',
                    },
               ],
          },
          {
               title: 'Danger Zone',
               items: [
                    {
                         label: 'Delete Account',
                         description: 'Permanently delete your account',
                         onPress: handleDeleteAccount,
                         type: 'danger',
                    },
               ],
          },
     ];

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               {/* Custom Header */}
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                         onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/profile')}
                         style={styles.backBtn}
                    >
                         <ChevronLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
                    <View style={styles.headerRight} />
               </View>

               <ScrollView style={styles.content}>
                    {settingSections.map((section, sectionIndex) => (
                         <View key={sectionIndex} style={styles.section}>
                              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                                   {section.title}
                              </Text>
                              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                   {section.items.map((item, itemIndex) => (
                                        <View key={itemIndex}>
                                             {item.type === 'switch' && 'value' in item && 'onToggle' in item ? (
                                                  <View style={styles.settingItem}>
                                                       <View style={styles.settingInfo}>
                                                            <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                                                                 {item.label}
                                                            </Text>
                                                            <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                                                                 {item.description}
                                                            </Text>
                                                       </View>
                                                       <Switch
                                                            value={item.value}
                                                            onValueChange={item.onToggle}
                                                            trackColor={{ false: colors.muted, true: colors.primary }}
                                                            thumbColor={colors.card}
                                                       />
                                                  </View>
                                             ) : item.type === 'link' && 'onPress' in item ? (
                                                  <TouchableOpacity
                                                       style={styles.settingItem}
                                                       onPress={item.onPress}
                                                  >
                                                       {'icon' in item && item.icon && (
                                                            <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
                                                                 <item.icon size={20} color={colors.foreground} />
                                                            </View>
                                                       )}
                                                       <View style={[styles.settingInfo, !('icon' in item) && { flex: 1 }]}>
                                                            <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                                                                 {item.label}
                                                            </Text>
                                                            <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                                                                 {item.description}
                                                            </Text>
                                                       </View>
                                                       <ChevronRight size={20} color={colors.mutedForeground} />
                                                  </TouchableOpacity>
                                             ) : 'onPress' in item ? (
                                                  <TouchableOpacity
                                                       style={styles.settingItem}
                                                       onPress={item.onPress}
                                                  >
                                                       <View style={styles.settingInfo}>
                                                            <Text style={[styles.settingLabel, { color: colors.destructive }]}>
                                                                 {item.label}
                                                            </Text>
                                                            <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                                                                 {item.description}
                                                            </Text>
                                                       </View>
                                                       <ChevronRight size={20} color={colors.mutedForeground} />
                                                  </TouchableOpacity>
                                             ) : null}
                                             {itemIndex < section.items.length - 1 && (
                                                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                             )}
                                        </View>
                                   ))}
                              </View>
                         </View>
                    ))}

                    <Text style={[styles.version, { color: colors.mutedForeground }]}>
                         Version 1.0.0
                    </Text>
               </ScrollView>
          </View>
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
     headerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
     },
     headerRight: {
          width: 40,
     },
     content: {
          flex: 1,
          padding: Spacing.md,
     },
     section: {
          marginBottom: Spacing.lg,
     },
     sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          marginBottom: Spacing.sm,
          paddingHorizontal: Spacing.xs,
     },
     sectionCard: {
          borderRadius: 12,
          borderWidth: 1,
          overflow: 'hidden',
     },
     settingItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.md,
          gap: Spacing.sm,
     },
     iconContainer: {
          width: 36,
          height: 36,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
     },
     settingInfo: {
          flex: 1,
     },
     settingLabel: {
          fontSize: 16,
          fontWeight: '500',
          marginBottom: 2,
     },
     settingDescription: {
          fontSize: 13,
     },
     divider: {
          height: 1,
          marginHorizontal: Spacing.md,
     },
     version: {
          fontSize: 12,
          textAlign: 'center',
          marginTop: Spacing.lg,
          marginBottom: Spacing.xxl,
     },
});

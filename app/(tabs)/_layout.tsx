import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ShoppingBag, Mail, Bell, User } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        href: null, // Hide all routes by default
      }}>
      <Tabs.Screen
        name="forum"
        options={{
          title: t('Tabs.forum'),
          tabBarIcon: ({ color }) => <MessageCircle size={23} color={color} strokeWidth={2} />,
          href: '/(tabs)/forum',
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: t('Tabs.marketplace'),
          tabBarIcon: ({ color }) => <ShoppingBag size={23} color={color} strokeWidth={2} />,
          href: '/(tabs)/marketplace',
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Mail size={23} color={color} strokeWidth={2} />,
          href: '/(tabs)/message',
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Bell size={23} color={color} strokeWidth={2} />,
          href: '/(tabs)/notification',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('Tabs.profile'),
          tabBarIcon: ({ color }) => <User size={23} color={color} strokeWidth={2} />,
          href: '/(tabs)/profile',
        }}
      />
    </Tabs>
  );
}

/**
 * Create Ticket Screen
 * Create support tickets with attachments
 */

import React, { useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     TextInput,
     ActivityIndicator,
     Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Send, ChevronLeft } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import { ticketApi } from '@/lib/api/ticketApi';

const CATEGORIES = [
     { value: 'order_issue', label: 'Order Issue' },
     { value: 'product_issue', label: 'Product Issue' },
     { value: 'payment_issue', label: 'Payment Issue' },
     { value: 'technical_issue', label: 'Technical Issue' },
     { value: 'general_inquiry', label: 'General Inquiry' },
     { value: 'other', label: 'Other' },
];

const PRIORITIES = [
     { value: 'low', label: 'Low' },
     { value: 'medium', label: 'Medium' },
     { value: 'high', label: 'High' },
];

export default function CreateTicketScreen() {
     const { colors } = useTheme();
     const params = useLocalSearchParams();

     const [title, setTitle] = useState('');
     const [description, setDescription] = useState('');
     const [category, setCategory] = useState(params.category as string || 'general_inquiry');
     const [priority, setPriority] = useState('medium');
     const [showCategoryPicker, setShowCategoryPicker] = useState(false);
     const [showPriorityPicker, setShowPriorityPicker] = useState(false);
     const [isSubmitting, setIsSubmitting] = useState(false);

     const orderId = params.orderId as string;
     const productId = params.productId as string;

     const handleSubmit = async () => {
          if (!title.trim()) {
               Alert.alert('Error', 'Please enter a title');
               return;
          }

          if (!description.trim()) {
               Alert.alert('Error', 'Please enter a description');
               return;
          }

          setIsSubmitting(true);

          try {
               await ticketApi.createTicket({
                    title: title.trim(),
                    description: description.trim(),
                    category,
                    priority: priority as 'low' | 'medium' | 'high',
                    attachments: [],
               });

               Alert.alert('Success', 'Ticket created successfully', [
                    { text: 'OK', onPress: () => router.back() }
               ]);
          } catch {
               Alert.alert('Error', 'Failed to create ticket');
          } finally {
               setIsSubmitting(false);
          }
     };

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
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Support Ticket</Text>
                    <View style={styles.headerRight} />
               </View>

               <ScrollView style={styles.content}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                         Create Support Ticket
                    </Text>

                    {/* Title */}
                    <View style={styles.field}>
                         <Text style={[styles.label, { color: colors.foreground }]}>
                              Title <Text style={{ color: colors.destructive }}>*</Text>
                         </Text>
                         <TextInput
                              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                              value={title}
                              onChangeText={setTitle}
                              placeholder="Enter ticket title"
                              placeholderTextColor={colors.mutedForeground}
                         />
                    </View>

                    {/* Description */}
                    <View style={styles.field}>
                         <Text style={[styles.label, { color: colors.foreground }]}>
                              Description <Text style={{ color: colors.destructive }}>*</Text>
                         </Text>
                         <TextInput
                              style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                              value={description}
                              onChangeText={setDescription}
                              placeholder="Describe your issue in detail..."
                              placeholderTextColor={colors.mutedForeground}
                              multiline
                              numberOfLines={6}
                              textAlignVertical="top"
                         />
                    </View>

                    {/* Category */}
                    <View style={styles.field}>
                         <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
                         <TouchableOpacity
                              style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
                              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                         >
                              <Text style={[styles.pickerText, { color: colors.foreground }]}>
                                   {CATEGORIES.find(c => c.value === category)?.label}
                              </Text>
                         </TouchableOpacity>

                         {showCategoryPicker && (
                              <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                   {CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                             key={cat.value}
                                             style={[styles.pickerOption, { borderBottomColor: colors.border }]}
                                             onPress={() => {
                                                  setCategory(cat.value);
                                                  setShowCategoryPicker(false);
                                             }}
                                        >
                                             <Text style={[styles.pickerOptionText, { color: colors.foreground }]}>
                                                  {cat.label}
                                             </Text>
                                        </TouchableOpacity>
                                   ))}
                              </View>
                         )}
                    </View>

                    {/* Priority */}
                    <View style={styles.field}>
                         <Text style={[styles.label, { color: colors.foreground }]}>Priority</Text>
                         <TouchableOpacity
                              style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
                              onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                         >
                              <Text style={[styles.pickerText, { color: colors.foreground }]}>
                                   {PRIORITIES.find(p => p.value === priority)?.label}
                              </Text>
                         </TouchableOpacity>

                         {showPriorityPicker && (
                              <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                   {PRIORITIES.map(pri => (
                                        <TouchableOpacity
                                             key={pri.value}
                                             style={[styles.pickerOption, { borderBottomColor: colors.border }]}
                                             onPress={() => {
                                                  setPriority(pri.value);
                                                  setShowPriorityPicker(false);
                                             }}
                                        >
                                             <Text style={[styles.pickerOptionText, { color: colors.foreground }]}>
                                                  {pri.label}
                                             </Text>
                                        </TouchableOpacity>
                                   ))}
                              </View>
                         )}
                    </View>

                    {/* Attachments */}
                    <View style={styles.field}>
                         <Text style={[styles.label, { color: colors.foreground }]}>
                              Attachments
                         </Text>
                         <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
                              To add attachments, please use the web version
                         </Text>
                    </View>

                    {/* Context Info */}
                    {(orderId || productId) && (
                         <View style={[styles.contextInfo, { backgroundColor: colors.muted }]}>
                              <Text style={[styles.contextLabel, { color: colors.mutedForeground }]}>
                                   Related to:
                              </Text>
                              {orderId && (
                                   <Text style={[styles.contextValue, { color: colors.foreground }]}>
                                        Order #{orderId.slice(0, 8)}
                                   </Text>
                              )}
                              {productId && (
                                   <Text style={[styles.contextValue, { color: colors.foreground }]}>
                                        Product ID: {productId.slice(0, 8)}
                                   </Text>
                              )}
                         </View>
                    )}
               </ScrollView>

               {/* Submit Button */}
               <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                         style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                         onPress={handleSubmit}
                         disabled={isSubmitting}
                    >
                         {isSubmitting ? (
                              <ActivityIndicator size="small" color={colors.primaryForeground} />
                         ) : (
                              <>
                                   <Send size={20} color={colors.primaryForeground} />
                                   <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
                                        Submit Ticket
                                   </Text>
                              </>
                         )}
                    </TouchableOpacity>
               </View>
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
     title: {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: Spacing.lg,
     },
     field: {
          marginBottom: Spacing.md,
     },
     label: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: Spacing.xs,
     },
     helperText: {
          fontSize: 13,
          fontStyle: 'italic',
          marginTop: Spacing.xs,
     },
     input: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          fontSize: 14,
     },
     textArea: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          fontSize: 14,
          minHeight: 120,
     },
     picker: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
     },
     pickerText: {
          fontSize: 14,
     },
     pickerDropdown: {
          marginTop: Spacing.xs,
          borderRadius: 8,
          borderWidth: 1,
          maxHeight: 200,
     },
     pickerOption: {
          padding: Spacing.md,
          borderBottomWidth: 1,
     },
     pickerOptionText: {
          fontSize: 14,
     },
     attachBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.xs,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
     },
     attachBtnText: {
          fontSize: 14,
          fontWeight: '600',
     },
     attachmentsList: {
          marginTop: Spacing.sm,
          gap: Spacing.xs,
     },
     attachmentItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.sm,
          borderRadius: 6,
     },
     attachmentName: {
          flex: 1,
          fontSize: 13,
          marginRight: Spacing.sm,
     },
     contextInfo: {
          padding: Spacing.md,
          borderRadius: 8,
          marginBottom: Spacing.md,
     },
     contextLabel: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
     },
     contextValue: {
          fontSize: 13,
     },
     footer: {
          padding: Spacing.md,
          borderTopWidth: 1,
     },
     submitBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.xs,
          paddingVertical: Spacing.md,
          borderRadius: 12,
     },
     submitBtnText: {
          fontSize: 16,
          fontWeight: 'bold',
     },
});

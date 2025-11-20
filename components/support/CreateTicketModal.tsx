/**
 * CreateTicketModal Component
 * Modal for creating support tickets
 */

import React, { useState } from 'react';
import {
     View,
     Text,
     Modal,
     StyleSheet,
     TouchableOpacity,
     TextInput,
     ScrollView,
     ActivityIndicator,
     Alert,
     Image,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Upload } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { ticketApi } from '@/lib/api/ticketApi';
import { CreateTicketPayload } from '@/types/ticket';
import * as ImagePicker from 'expo-image-picker';

interface CreateTicketModalProps {
     visible: boolean;
     onClose: () => void;
     onSuccess?: () => void;
}

export default function CreateTicketModal({ visible, onClose, onSuccess }: CreateTicketModalProps) {
     const { colors } = useTheme();
     const [title, setTitle] = useState('');
     const [description, setDescription] = useState('');
     const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
     const [category, setCategory] = useState('');
     const [attachments, setAttachments] = useState<any[]>([]);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [showCategoryPicker, setShowCategoryPicker] = useState(false);
     const [showPriorityPicker, setShowPriorityPicker] = useState(false);

     const categories = [
          'Account Access',
          'Order Issue',
          'Payment Problem',
          'Product Quality',
          'Technical Support',
          'Refund Request',
          'Other',
     ];

     const priorities: { value: 'low' | 'medium' | 'high' | 'urgent'; label: string }[] = [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' },
     ];

     const handlePickFile = async () => {
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
                    if (attachments.length + result.assets.length > 5) {
                         Alert.alert('Limit Reached', 'Maximum 5 files allowed');
                         return;
                    }
                    setAttachments((prev) => [...prev, ...result.assets]);
               }
          } catch (error) {
               console.error('Error picking image:', error);
               Alert.alert('Error', 'Failed to pick image');
          }
     };

     const removeFile = (index: number) => {
          setAttachments((prev) => prev.filter((_, i) => i !== index));
     };

     const handleSubmit = async () => {
          if (!title.trim()) {
               Alert.alert('Error', 'Please enter a title');
               return;
          }
          if (!description.trim()) {
               Alert.alert('Error', 'Please enter a description');
               return;
          }
          if (!category.trim()) {
               Alert.alert('Error', 'Please select a category');
               return;
          }

          try {
               setIsSubmitting(true);

               const payload: CreateTicketPayload = {
                    title: title.trim(),
                    description: description.trim(),
                    priority,
                    category,
                    attachments: attachments.length > 0 ? (attachments as any) : undefined,
               };

               await ticketApi.createTicket(payload);

               Alert.alert('Success', 'Support ticket created successfully');

               // Reset form
               setTitle('');
               setDescription('');
               setPriority('medium');
               setCategory('');
               setAttachments([]);
               onClose();
               if (onSuccess) onSuccess();
          } catch (error: any) {
               console.error('Error creating ticket:', error);
               const errorMessage = error.response?.data?.message || 'Failed to create ticket';
               Alert.alert('Error', errorMessage);
          } finally {
               setIsSubmitting(false);
          }
     };

     return (
          <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
               <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                         {/* Header */}
                         <View style={[styles.header, { borderBottomColor: colors.border }]}>
                              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Support Ticket</Text>
                              <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isSubmitting}>
                                   <X size={24} color={colors.foreground} />
                              </TouchableOpacity>
                         </View>

                         <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                              {/* Title */}
                              <View style={styles.section}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>
                                        Title <Text style={{ color: colors.destructive }}>*</Text>
                                   </Text>
                                   <TextInput
                                        style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                                        placeholder="Brief summary of your issue"
                                        placeholderTextColor={colors.mutedForeground}
                                        value={title}
                                        onChangeText={setTitle}
                                        maxLength={200}
                                        editable={!isSubmitting}
                                   />
                              </View>

                              {/* Category */}
                              <View style={styles.section}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>
                                        Category <Text style={{ color: colors.destructive }}>*</Text>
                                   </Text>
                                   <TouchableOpacity
                                        style={[styles.picker, { backgroundColor: colors.muted, borderColor: colors.border }]}
                                        onPress={() => setShowCategoryPicker(true)}
                                        disabled={isSubmitting}
                                   >
                                        <Text style={[styles.pickerText, { color: category ? colors.foreground : colors.mutedForeground }]}>
                                             {category || 'Select category'}
                                        </Text>
                                   </TouchableOpacity>
                              </View>

                              {/* Priority */}
                              <View style={styles.section}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>
                                        Priority <Text style={{ color: colors.destructive }}>*</Text>
                                   </Text>
                                   <TouchableOpacity
                                        style={[styles.picker, { backgroundColor: colors.muted, borderColor: colors.border }]}
                                        onPress={() => setShowPriorityPicker(true)}
                                        disabled={isSubmitting}
                                   >
                                        <Text style={[styles.pickerText, { color: colors.foreground }]}>
                                             {priorities.find((p) => p.value === priority)?.label}
                                        </Text>
                                   </TouchableOpacity>
                              </View>

                              {/* Description */}
                              <View style={styles.section}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>
                                        Description <Text style={{ color: colors.destructive }}>*</Text>
                                   </Text>
                                   <TextInput
                                        style={[styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                                        placeholder="Please provide detailed information about your issue..."
                                        placeholderTextColor={colors.mutedForeground}
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={6}
                                        textAlignVertical="top"
                                        maxLength={2000}
                                        editable={!isSubmitting}
                                   />
                                   <Text style={[styles.characterCount, { color: colors.mutedForeground }]}>
                                        {description.length}/2000 characters
                                   </Text>
                              </View>

                              {/* Attachments */}
                              <View style={styles.section}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>Attachments (Optional, max 5 images)</Text>
                                   <TouchableOpacity
                                        style={[styles.uploadBtn, { borderColor: colors.border }]}
                                        onPress={handlePickFile}
                                        disabled={attachments.length >= 5 || isSubmitting}
                                   >
                                        <Upload size={20} color={colors.primary} />
                                        <Text style={[styles.uploadBtnText, { color: colors.primary }]}>
                                             {attachments.length >= 5 ? 'Maximum files reached' : 'Upload Images'}
                                        </Text>
                                   </TouchableOpacity>

                                   {attachments.length > 0 && (
                                        <View style={styles.filesList}>
                                             {attachments.map((file, index) => (
                                                  <View key={index} style={[styles.fileItem, { backgroundColor: colors.muted }]}>
                                                       {file.uri && (
                                                            <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                                                       )}
                                                       <View style={styles.fileInfo}>
                                                            <Text style={[styles.fileName, { color: colors.foreground }]} numberOfLines={1}>
                                                                 {file.fileName || `Image ${index + 1}`}
                                                            </Text>
                                                            {file.fileSize && (
                                                                 <Text style={[styles.fileSize, { color: colors.mutedForeground }]}>
                                                                      {(file.fileSize / 1024).toFixed(1)} KB
                                                                 </Text>
                                                            )}
                                                       </View>
                                                       <TouchableOpacity onPress={() => removeFile(index)} disabled={isSubmitting}>
                                                            <X size={20} color={colors.mutedForeground} />
                                                       </TouchableOpacity>
                                                  </View>
                                             ))}
                                        </View>
                                   )}
                              </View>
                         </ScrollView>

                         {/* Footer */}
                         <View style={[styles.footer, { borderTopColor: colors.border }]}>
                              <TouchableOpacity
                                   style={[styles.cancelBtn, { borderColor: colors.border }]}
                                   onPress={onClose}
                                   disabled={isSubmitting}
                              >
                                   <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                   style={[
                                        styles.submitBtn,
                                        {
                                             backgroundColor:
                                                  !title.trim() || !description.trim() || !category || isSubmitting
                                                       ? colors.muted
                                                       : colors.primary,
                                        },
                                   ]}
                                   onPress={handleSubmit}
                                   disabled={!title.trim() || !description.trim() || !category || isSubmitting}
                              >
                                   {isSubmitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                   ) : (
                                        <Text style={styles.submitBtnText}>Create Ticket</Text>
                                   )}
                              </TouchableOpacity>
                         </View>
                    </View>

                    {/* Category Picker Modal */}
                    <Modal visible={showCategoryPicker} animationType="slide" transparent>
                         <View style={styles.modalOverlay}>
                              <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
                                   <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                                        <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Select Category</Text>
                                        <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                                             <X size={24} color={colors.foreground} />
                                        </TouchableOpacity>
                                   </View>
                                   <ScrollView>
                                        {categories.map((cat) => (
                                             <TouchableOpacity
                                                  key={cat}
                                                  style={[
                                                       styles.option,
                                                       { backgroundColor: category === cat ? colors.muted : 'transparent' },
                                                  ]}
                                                  onPress={() => {
                                                       setCategory(cat);
                                                       setShowCategoryPicker(false);
                                                  }}
                                             >
                                                  <Text style={[styles.optionText, { color: colors.foreground }]}>{cat}</Text>
                                             </TouchableOpacity>
                                        ))}
                                   </ScrollView>
                              </View>
                         </View>
                    </Modal>

                    {/* Priority Picker Modal */}
                    <Modal visible={showPriorityPicker} animationType="slide" transparent>
                         <View style={styles.modalOverlay}>
                              <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
                                   <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                                        <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Select Priority</Text>
                                        <TouchableOpacity onPress={() => setShowPriorityPicker(false)}>
                                             <X size={24} color={colors.foreground} />
                                        </TouchableOpacity>
                                   </View>
                                   <ScrollView>
                                        {priorities.map((p) => (
                                             <TouchableOpacity
                                                  key={p.value}
                                                  style={[
                                                       styles.option,
                                                       { backgroundColor: priority === p.value ? colors.muted : 'transparent' },
                                                  ]}
                                                  onPress={() => {
                                                       setPriority(p.value);
                                                       setShowPriorityPicker(false);
                                                  }}
                                             >
                                                  <Text style={[styles.optionText, { color: colors.foreground }]}>{p.label}</Text>
                                             </TouchableOpacity>
                                        ))}
                                   </ScrollView>
                              </View>
                         </View>
                    </Modal>
               </View>
          </Modal>
     );
}

const styles = StyleSheet.create({
     modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
     },
     modalContent: {
          maxHeight: '90%',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
     },
     header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: Spacing.md,
          borderBottomWidth: 1,
     },
     headerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          flex: 1,
     },
     closeBtn: {
          padding: Spacing.xs,
     },
     body: {
          padding: Spacing.md,
     },
     section: {
          marginBottom: Spacing.lg,
     },
     label: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: Spacing.xs,
     },
     input: {
          padding: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          fontSize: 14,
     },
     picker: {
          padding: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
     },
     pickerText: {
          fontSize: 14,
     },
     textarea: {
          padding: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          fontSize: 14,
          minHeight: 120,
     },
     characterCount: {
          fontSize: 12,
          marginTop: Spacing.xs,
          textAlign: 'right',
     },
     uploadBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.xs,
          padding: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: 'dashed',
     },
     uploadBtnText: {
          fontSize: 14,
          fontWeight: '600',
     },
     filesList: {
          marginTop: Spacing.sm,
          gap: Spacing.xs,
     },
     fileItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          padding: Spacing.sm,
          borderRadius: 8,
     },
     thumbnail: {
          width: 40,
          height: 40,
          borderRadius: 4,
     },
     fileInfo: {
          flex: 1,
     },
     fileName: {
          flex: 1,
          fontSize: 13,
          marginBottom: 2,
     },
     fileSize: {
          fontSize: 11,
     },
     footer: {
          flexDirection: 'row',
          gap: Spacing.sm,
          padding: Spacing.md,
          borderTopWidth: 1,
     },
     cancelBtn: {
          flex: 1,
          padding: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          alignItems: 'center',
     },
     cancelBtnText: {
          fontSize: 15,
          fontWeight: '600',
     },
     submitBtn: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: Spacing.sm,
          borderRadius: 8,
     },
     submitBtnText: {
          fontSize: 15,
          fontWeight: '600',
          color: '#fff',
     },
     pickerModal: {
          maxHeight: '60%',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
     },
     pickerHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: Spacing.md,
          borderBottomWidth: 1,
     },
     pickerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
     },
     option: {
          padding: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
     },
     optionText: {
          fontSize: 15,
     },
});

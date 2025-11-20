/**
 * ReportModal Component
 * Modal for reporting issues with purchased products
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
     Image,
     ActivityIndicator,
     Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Upload, AlertCircle, FileWarning } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { reportApi } from '@/lib/api/reportApi';
import * as ImagePicker from 'expo-image-picker';

interface Product {
     productId: string;
     productTitle: string;
     price: string | number;
}

interface ReportModalProps {
     visible: boolean;
     onClose: () => void;
     orderId: string;
     products: Product[];
     onSuccess?: () => void;
}

export default function ReportModal({ visible, onClose, orderId, products, onSuccess }: ReportModalProps) {
     const { colors } = useTheme();
     const [selectedProductId, setSelectedProductId] = useState<string>('');
     const [reason, setReason] = useState('');
     const [evidenceFiles, setEvidenceFiles] = useState<any[]>([]);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [showProductPicker, setShowProductPicker] = useState(false);

     const handlePickImage = async () => {
          try {
               const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

               if (permissionResult.status !== 'granted') {
                    Alert.alert('Permission Required', 'Please allow access to your photo library');
                    return;
               }

               const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images', 'videos'],
                    allowsMultipleSelection: true,
                    quality: 0.8,
               });

               if (!result.canceled) {
                    if (evidenceFiles.length + result.assets.length > 5) {
                         Alert.alert('Limit Reached', 'Maximum 5 evidence files allowed');
                         return;
                    }

                    setEvidenceFiles(prev => [...prev, ...result.assets]);
               }
          } catch (error) {
               console.error('Error picking image:', error);
               Alert.alert('Error', 'Failed to pick image');
          }
     };

     const handleRemoveEvidence = (index: number) => {
          setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
     };

     const handleSubmit = async () => {
          if (!selectedProductId) {
               Alert.alert('Error', 'Please select a product to report');
               return;
          }

          if (!reason.trim()) {
               Alert.alert('Error', 'Please describe the issue');
               return;
          }

          try {
               setIsSubmitting(true);

               const formData = new FormData();
               formData.append('orderId', orderId);
               formData.append('productId', selectedProductId);
               formData.append('reason', reason.trim());

               // Append evidence files
               if (evidenceFiles.length > 0) {
                    evidenceFiles.forEach((file, index) => {
                         const fileUri = file.uri;
                         const fileName = fileUri.split('/').pop() || `evidence_${index}.jpg`;
                         const fileType = file.type === 'video' ? 'video/mp4' : 'image/jpeg';

                         formData.append('evidence', {
                              uri: fileUri,
                              name: fileName,
                              type: fileType,
                         } as any);
                    });
               }

               await reportApi.createReportWithFiles(formData);

               Alert.alert('Success', 'Report submitted successfully! We will review it within 24-48 hours.');

               // Reset form
               setSelectedProductId('');
               setReason('');
               setEvidenceFiles([]);
               onClose();
               if (onSuccess) onSuccess();
          } catch (error: any) {
               console.error('Submit report error:', error);
               const errorMessage =
                    error.response?.data?.message || 'Failed to submit report. Please try again.';
               Alert.alert('Error', errorMessage);
          } finally {
               setIsSubmitting(false);
          }
     };

     const selectedProduct = products.find(p => p.productId === selectedProductId);

     return (
          <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
               <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                         {/* Header */}
                         <View style={[styles.header, { borderBottomColor: colors.border }]}>
                              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                                   Report Issue with Product
                              </Text>
                              <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isSubmitting}>
                                   <X size={24} color={colors.foreground} />
                              </TouchableOpacity>
                         </View>

                         <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                              {/* Warning */}
                              <View style={[styles.warningBox, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
                                   <AlertCircle size={20} color="#D97706" />
                                   <Text style={[styles.warningText, { color: '#92400E' }]}>
                                        Reports should only be filed for legitimate issues such as missing files,
                                        corrupted presets, or products not matching the description.
                                   </Text>
                              </View>

                              {/* Product Selection */}
                              <View style={styles.section}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>
                                        Select Product <Text style={{ color: colors.destructive }}>*</Text>
                                   </Text>
                                   <TouchableOpacity
                                        style={[styles.picker, { backgroundColor: colors.muted, borderColor: colors.border }]}
                                        onPress={() => setShowProductPicker(true)}
                                        disabled={isSubmitting}
                                   >
                                        <Text style={[styles.pickerText, { color: selectedProduct ? colors.foreground : colors.mutedForeground }]}>
                                             {selectedProduct ? selectedProduct.productTitle : 'Choose the product you want to report'}
                                        </Text>
                                   </TouchableOpacity>
                              </View>

                              {/* Issue Description */}
                              <View style={styles.section}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>
                                        Issue Description <Text style={{ color: colors.destructive }}>*</Text>
                                   </Text>
                                   <TextInput
                                        style={[styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                                        placeholder="Describe the problem in detail (e.g., preset files are corrupted, product doesn't match description, files are missing)..."
                                        placeholderTextColor={colors.mutedForeground}
                                        value={reason}
                                        onChangeText={setReason}
                                        multiline
                                        numberOfLines={6}
                                        textAlignVertical="top"
                                        editable={!isSubmitting}
                                   />
                                   <Text style={[styles.characterCount, { color: colors.mutedForeground }]}>
                                        {reason.length} characters
                                   </Text>
                              </View>

                              {/* Evidence Upload */}
                              <View style={styles.section}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>Evidence (Optional)</Text>
                                   <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
                                        Upload images or videos as proof (max 5 files, 10MB each)
                                   </Text>
                                   <Text style={[styles.helperTextSmall, { color: colors.mutedForeground }]}>
                                        Supported formats: JPG, PNG, GIF, WEBP, MP4, WEBM
                                   </Text>

                                   <TouchableOpacity
                                        style={[styles.uploadBtn, { borderColor: colors.border }]}
                                        onPress={handlePickImage}
                                        disabled={evidenceFiles.length >= 5 || isSubmitting}
                                   >
                                        <Upload size={20} color={colors.primary} />
                                        <Text style={[styles.uploadBtnText, { color: colors.primary }]}>
                                             {evidenceFiles.length >= 5 ? 'Maximum files reached' : 'Upload Evidence Files'}
                                        </Text>
                                   </TouchableOpacity>

                                   {evidenceFiles.length > 0 && (
                                        <View style={styles.evidenceGrid}>
                                             {evidenceFiles.map((file, index) => (
                                                  <View
                                                       key={index}
                                                       style={[styles.evidenceItem, { backgroundColor: colors.muted }]}
                                                  >
                                                       <Image source={{ uri: file.uri }} style={styles.evidenceImage} />
                                                       <TouchableOpacity
                                                            style={[styles.removeEvidenceBtn, { backgroundColor: colors.destructive }]}
                                                            onPress={() => handleRemoveEvidence(index)}
                                                            disabled={isSubmitting}
                                                       >
                                                            <X size={12} color="#fff" />
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
                                        { backgroundColor: !selectedProductId || !reason.trim() || isSubmitting ? colors.muted : colors.destructive },
                                   ]}
                                   onPress={handleSubmit}
                                   disabled={!selectedProductId || !reason.trim() || isSubmitting}
                              >
                                   {isSubmitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                   ) : (
                                        <>
                                             <FileWarning size={16} color="#fff" />
                                             <Text style={styles.submitBtnText}>Submit Report</Text>
                                        </>
                                   )}
                              </TouchableOpacity>
                         </View>
                    </View>

                    {/* Product Picker Modal */}
                    <Modal visible={showProductPicker} animationType="slide" transparent>
                         <View style={styles.modalOverlay}>
                              <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
                                   <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                                        <Text style={[styles.pickerTitle, { color: colors.foreground }]}>
                                             Select Product
                                        </Text>
                                        <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                                             <X size={24} color={colors.foreground} />
                                        </TouchableOpacity>
                                   </View>
                                   <ScrollView>
                                        {products.map((product) => (
                                             <TouchableOpacity
                                                  key={product.productId}
                                                  style={[
                                                       styles.productOption,
                                                       { backgroundColor: selectedProductId === product.productId ? colors.muted : 'transparent' },
                                                  ]}
                                                  onPress={() => {
                                                       setSelectedProductId(product.productId);
                                                       setShowProductPicker(false);
                                                  }}
                                             >
                                                  <Text style={[styles.productName, { color: colors.foreground }]}>
                                                       {product.productTitle}
                                                  </Text>
                                                  <Text style={[styles.productPrice, { color: colors.mutedForeground }]}>
                                                       {parseFloat(product.price.toString()).toLocaleString('vi-VN')} ₫
                                                  </Text>
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
     warningBox: {
          flexDirection: 'row',
          gap: Spacing.sm,
          padding: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          marginBottom: Spacing.md,
     },
     warningText: {
          flex: 1,
          fontSize: 13,
          lineHeight: 18,
     },
     section: {
          marginBottom: Spacing.lg,
     },
     label: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: Spacing.xs,
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
     helperText: {
          fontSize: 13,
          marginBottom: 4,
     },
     helperTextSmall: {
          fontSize: 11,
          marginBottom: Spacing.sm,
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
     evidenceGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.sm,
          marginTop: Spacing.sm,
     },
     evidenceItem: {
          width: '48%',
          aspectRatio: 16 / 9,
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
     },
     evidenceImage: {
          width: '100%',
          height: '100%',
     },
     removeEvidenceBtn: {
          position: 'absolute',
          top: 4,
          right: 4,
          width: 20,
          height: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.xs,
          padding: Spacing.sm,
          borderRadius: 8,
     },
     submitBtnText: {
          fontSize: 15,
          fontWeight: '600',
          color: '#fff',
     },
     pickerModal: {
          maxHeight: '70%',
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
     productOption: {
          padding: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
     },
     productName: {
          fontSize: 15,
          fontWeight: '600',
          marginBottom: 4,
     },
     productPrice: {
          fontSize: 13,
     },
});

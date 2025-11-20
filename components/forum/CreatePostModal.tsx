import React, { useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     Modal,
     TouchableOpacity,
     TextInput,
     ScrollView,
     KeyboardAvoidingView,
     Platform,
     ActivityIndicator,
     Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { postApi } from '@/lib/api/postApi';

interface CreatePostModalProps {
     visible: boolean;
     onClose: () => void;
     onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
     visible,
     onClose,
     onPostCreated,
}) => {
     const { colors } = useTheme();
     const [title, setTitle] = useState('');
     const [content, setContent] = useState('');
     const [imageUri, setImageUri] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);

     const resetForm = () => {
          setTitle('');
          setContent('');
          setImageUri(null);
     };

     const handleClose = () => {
          resetForm();
          onClose();
     };

     const pickImage = async (useCamera: boolean) => {
          const permissionFn = useCamera
               ? ImagePicker.requestCameraPermissionsAsync
               : ImagePicker.requestMediaLibraryPermissionsAsync;

          const { status } = await permissionFn();
          if (status !== 'granted') {
               Alert.alert('Permission needed', `${useCamera ? 'Camera' : 'Gallery'} permission required`);
               return;
          }

          const launchFn = useCamera
               ? ImagePicker.launchCameraAsync
               : ImagePicker.launchImageLibraryAsync;

          const result = await launchFn({
               mediaTypes: 'images',
               allowsEditing: false,
               quality: 1,
          });

          if (!result.canceled && result.assets[0]) {
               setImageUri(result.assets[0].uri);
          }
     };

     const handleSubmit = async () => {
          if (!title.trim() || !imageUri) {
               Alert.alert('Error', 'Title and image are required');
               return;
          }

          setLoading(true);
          try {
               const filename = imageUri.split('/').pop() || `photo_${Date.now()}.jpg`;
               const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
               const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

               const formData = new FormData();
               formData.append('title', title.trim());
               formData.append('content', content.trim());

               // @ts-ignore - RN FormData format
               formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type: mimeType,
               });

               await postApi.create(formData);
               Alert.alert('Success', 'Post created!');
               onPostCreated();
               handleClose();
          } catch (error) {
               console.error('Create post error:', error);
               Alert.alert('Error', 'Failed to create post');
          } finally {
               setLoading(false);
          }
     };

     return (
          <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
               <View style={styles.overlay}>
                    <KeyboardAvoidingView
                         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                         style={styles.container}
                    >
                         <View style={[styles.content, { backgroundColor: colors.background }]}>
                              {/* Header */}
                              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                   <TouchableOpacity onPress={handleClose} disabled={loading}>
                                        <X size={24} color={colors.foreground} />
                                   </TouchableOpacity>
                                   <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                                        Create Post
                                   </Text>
                                   <TouchableOpacity
                                        onPress={handleSubmit}
                                        disabled={loading || !title.trim() || !imageUri}
                                        style={[
                                             styles.submitBtn,
                                             { backgroundColor: colors.primary },
                                             (loading || !title.trim() || !imageUri) && styles.submitBtnDisabled,
                                        ]}
                                   >
                                        {loading ? (
                                             <ActivityIndicator color={colors.primaryForeground} size="small" />
                                        ) : (
                                             <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
                                                  Post
                                             </Text>
                                        )}
                                   </TouchableOpacity>
                              </View>

                              {/* Form */}
                              <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                                   <TextInput
                                        style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
                                        placeholder="Title"
                                        placeholderTextColor={colors.mutedForeground}
                                        value={title}
                                        onChangeText={setTitle}
                                        editable={!loading}
                                        maxLength={200}
                                   />

                                   <TextInput
                                        style={[styles.contentInput, { color: colors.foreground }]}
                                        placeholder="Description"
                                        placeholderTextColor={colors.mutedForeground}
                                        value={content}
                                        onChangeText={setContent}
                                        multiline
                                        editable={!loading}
                                        maxLength={2000}
                                   />

                                   {/* Image Picker or Preview */}
                                   {!imageUri ? (
                                        <View style={styles.imagePicker}>
                                             <TouchableOpacity
                                                  style={[styles.imageBtn, { backgroundColor: colors.muted }]}
                                                  onPress={() => pickImage(true)}
                                                  disabled={loading}
                                             >
                                                  <Camera size={24} color={colors.foreground} />
                                                  <Text style={[styles.imageBtnText, { color: colors.foreground }]}>
                                                       Camera
                                                  </Text>
                                             </TouchableOpacity>

                                             <TouchableOpacity
                                                  style={[styles.imageBtn, { backgroundColor: colors.muted }]}
                                                  onPress={() => pickImage(false)}
                                                  disabled={loading}
                                             >
                                                  <ImageIcon size={24} color={colors.foreground} />
                                                  <Text style={[styles.imageBtnText, { color: colors.foreground }]}>
                                                       Gallery
                                                  </Text>
                                             </TouchableOpacity>
                                        </View>
                                   ) : (
                                        <View style={styles.imagePreview}>
                                             <Image source={{ uri: imageUri }} style={styles.image} contentFit="contain" />
                                             <TouchableOpacity
                                                  style={[styles.removeBtn, { backgroundColor: colors.destructive }]}
                                                  onPress={() => setImageUri(null)}
                                                  disabled={loading}
                                             >
                                                  <Trash2 size={20} color={colors.destructiveForeground} />
                                             </TouchableOpacity>
                                        </View>
                                   )}
                              </ScrollView>
                         </View>
                    </KeyboardAvoidingView>
               </View>
          </Modal>
     );
};

const styles = StyleSheet.create({
     overlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
     },
     container: {
          flex: 1,
          justifyContent: 'flex-end',
     },
     content: {
          height: '90%',
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
          fontWeight: '600',
     },
     submitBtn: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          minWidth: 70,
          alignItems: 'center',
     },
     submitBtnDisabled: {
          opacity: 0.5,
     },
     submitBtnText: {
          fontSize: 15,
          fontWeight: '600',
     },
     form: {
          flex: 1,
          padding: Spacing.md,
     },
     titleInput: {
          fontSize: 18,
          fontWeight: '600',
          paddingVertical: Spacing.sm,
          paddingBottom: Spacing.md,
          borderBottomWidth: 1,
          marginBottom: Spacing.md,
     },
     contentInput: {
          fontSize: 15,
          paddingVertical: Spacing.sm,
          minHeight: 100,
          textAlignVertical: 'top',
          marginBottom: Spacing.md,
     },
     imagePicker: {
          flexDirection: 'row',
          gap: Spacing.sm,
     },
     imageBtn: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.xs,
          paddingVertical: Spacing.md,
          borderRadius: 12,
     },
     imageBtnText: {
          fontSize: 14,
          fontWeight: '500',
     },
     imagePreview: {
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
     },
     image: {
          width: '100%',
          minHeight: 200,
          maxHeight: 400,
          borderRadius: 12,
     },
     removeBtn: {
          position: 'absolute',
          top: Spacing.sm,
          right: Spacing.sm,
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
     },
});

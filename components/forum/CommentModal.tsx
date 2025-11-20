import React, { useState } from 'react';
import {
     View,
     Text,
     Modal,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     TextInput,
     KeyboardAvoidingView,
     Platform,
} from 'react-native';
import { X, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/ui/Avatar';
import { Loading } from '@/components/ui/Loading';
import { useComments } from '@/lib/hooks/usePostHooks';
import { postApi } from '@/lib/api/postApi';
import { useUserStore } from '@/stores/userStore';
import { CommentResponseType } from '@/types/post';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';

interface CommentModalProps {
     visible: boolean;
     onClose: () => void;
     postId: string;
     onCommentAdded?: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ visible, onClose, postId, onCommentAdded }) => {
     const { colors } = useTheme();
     const { t } = useTranslation();
     const user = useUserStore(state => state.user);
     const { data: commentsData, isLoading, mutate } = useComments(postId);
     const [content, setContent] = useState('');
     const [isSubmitting, setIsSubmitting] = useState(false);

     const handleSubmit = async () => {
          if (!content.trim()) return;

          try {
               setIsSubmitting(true);
               await postApi.createComment(postId, { content: content.trim(), parentId: null });
               setContent('');
               mutate();
               if (onCommentAdded) {
                    onCommentAdded();
               }
          } catch (error) {
               console.error('Error creating comment:', error);
          } finally {
               setIsSubmitting(false);
          }
     };

     return (
          <Modal
               visible={visible}
               animationType="slide"
               presentationStyle="pageSheet"
               onRequestClose={onClose}
          >
               <KeyboardAvoidingView
                    style={[styles.container, { backgroundColor: colors.background }]}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
               >
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                         <View>
                              <Text style={[styles.title, { color: colors.foreground }]}>
                                   {t('Forum.comment')} ({commentsData?.data?.count || 0})
                              </Text>
                              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                                   {t('Forum.shareYourComment')}
                              </Text>
                         </View>
                         <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                              <X size={24} color={colors.foreground} />
                         </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    <ScrollView
                         style={styles.commentsList}
                         contentContainerStyle={styles.commentsContent}
                    >
                         {isLoading ? (
                              <Loading />
                         ) : commentsData?.data?.comments?.length > 0 ? (
                              commentsData.data.comments.map((comment: CommentResponseType) => (
                                   <CommentItem key={comment.id} comment={comment} />
                              ))
                         ) : (
                              <View style={styles.emptyState}>
                                   <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                        No comments yet. Be the first to comment!
                                   </Text>
                              </View>
                         )}
                    </ScrollView>

                    {/* Input - Fixed at bottom */}
                    <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                         <View style={styles.inputRow}>
                              <Avatar source={user?.avatarUrl} name={user?.name} size={36} />
                              <TextInput
                                   style={[
                                        styles.input,
                                        {
                                             backgroundColor: colors.muted,
                                             color: colors.foreground,
                                        }
                                   ]}
                                   placeholder={t('Forum.shareYourComment')}
                                   placeholderTextColor={colors.mutedForeground}
                                   value={content}
                                   onChangeText={setContent}
                                   multiline
                                   maxLength={500}
                                   onSubmitEditing={handleSubmit}
                                   blurOnSubmit={false}
                              />
                              <TouchableOpacity
                                   onPress={handleSubmit}
                                   disabled={!content.trim() || isSubmitting}
                                   style={[
                                        styles.sendButton,
                                        {
                                             backgroundColor: content.trim() ? colors.primary : colors.muted,
                                             opacity: isSubmitting ? 0.5 : 1,
                                        }
                                   ]}
                              >
                                   <Send size={20} color={content.trim() ? colors.primaryForeground : colors.mutedForeground} />
                              </TouchableOpacity>
                         </View>
                    </View>
               </KeyboardAvoidingView>
          </Modal>
     );
};

const CommentItem: React.FC<{ comment: CommentResponseType }> = ({ comment }) => {
     const { colors } = useTheme();

     return (
          <View style={styles.commentItem}>
               <Avatar source={comment.user.avatarUrl} name={comment.user.name} size={36} />
               <View style={styles.commentContent}>
                    <Text style={[styles.commentUser, { color: colors.foreground }]}>
                         {comment.user.name}
                    </Text>
                    <Text style={[styles.commentText, { color: colors.foreground }]}>
                         {comment.content}
                    </Text>
                    <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
                         {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
               </View>
          </View>
     );
};

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: Spacing.md,
          paddingTop: Spacing.xl,
          borderBottomWidth: 1,
     },
     title: {
          fontSize: FontSizes.xl,
          fontWeight: FontWeights.bold,
     },
     subtitle: {
          fontSize: FontSizes.sm,
          marginTop: 4,
     },
     closeButton: {
          padding: Spacing.xs,
     },
     commentsList: {
          flex: 1,
     },
     commentsContent: {
          padding: Spacing.md,
     },
     emptyState: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: Spacing.xxl,
     },
     emptyText: {
          fontSize: FontSizes.md,
          textAlign: 'center',
     },
     commentItem: {
          flexDirection: 'row',
          marginBottom: Spacing.md,
          gap: Spacing.sm,
     },
     commentContent: {
          flex: 1,
          gap: 4,
     },
     commentUser: {
          fontSize: FontSizes.sm,
          fontWeight: FontWeights.semibold,
     },
     commentText: {
          fontSize: FontSizes.md,
          lineHeight: 20,
     },
     commentTime: {
          fontSize: FontSizes.xs,
     },
     inputContainer: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          paddingBottom: Spacing.md,
          borderTopWidth: 1,
     },
     inputRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: Spacing.sm,
     },
     input: {
          flex: 1,
          borderRadius: 20,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontSize: FontSizes.md,
          minHeight: 40,
          maxHeight: 100,
     },
     sendButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
     },
});

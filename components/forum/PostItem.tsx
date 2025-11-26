import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal, Pressable, Share, Alert } from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal, ImageIcon, X, Camera, Eye, BookMarked, Flag, Trash2, AlertTriangle, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/ui/Avatar';
import { CommentModal } from '@/components/forum/CommentModal';
import { PostType } from '@/types/post';
import { postApi } from '@/lib/api/postApi';
import { useUserStore } from '@/stores/userStore';
import { BASE_URL } from '@/constants';
import { Spacing } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PostItemProps {
     post: PostType;
}

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
     const { colors } = useTheme();
     const { t } = useTranslation();
     // const router = useRouter(); // TODO: Enable when profile/:id route is ready
     const currentUser = useUserStore(state => state.user);
     const [isLiked, setIsLiked] = useState(post.isLiked || false);
     const [likeCount, setLikeCount] = useState(post.voteCount || 0);
     const [isSaved, setIsSaved] = useState(post.isSaved || false);
     const [commentCount, setCommentCount] = useState(post.commentCount || 0);
     const [imageError, setImageError] = useState(false);
     const [commentModalVisible, setCommentModalVisible] = useState(false);
     const [imageModalVisible, setImageModalVisible] = useState(false);
     const [menuVisible, setMenuVisible] = useState(false);
     const [showNSFWContent, setShowNSFWContent] = useState(false);

     const isOwner = currentUser?.id === post.user.id;

     const handleLike = async () => {
          const prevLiked = isLiked;
          const prevCount = likeCount;

          try {
               // Optimistic update
               setIsLiked(!isLiked);
               setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

               if (isLiked) {
                    await postApi.unlikePost(post.id);
               } else {
                    await postApi.likePost(post.id);
               }
          } catch (error) {
               // Rollback on error
               setIsLiked(prevLiked);
               setLikeCount(prevCount);
               console.error('Failed to update like:', error);
          }
     };

     const handleCommentAdded = () => {
          setCommentCount(commentCount + 1);
     };

     const handleShare = async () => {
          try {
               const shareUrl = `${BASE_URL}/forum/${post.id}`;
               await Share.share({
                    message: `${post.title}\n\n${shareUrl}`,
                    url: shareUrl,
               });
          } catch (error) {
               console.error('Error sharing:', error);
          }
     };

     const handleNavigateToProfile = () => {
          if (post.user.id) {
               router.push(`/user-profile/${post.user.id}`);
          }
     };

     const handleDeletePost = async () => {
          Alert.alert(
               t('Button.deletePost'),
               t('Forum.confirmDelete'),
               [
                    { text: t('Button.cancel'), style: 'cancel' },
                    {
                         text: t('Button.delete'),
                         style: 'destructive',
                         onPress: async () => {
                              try {
                                   await postApi.delete(post.id);
                                   // TODO: Refresh list
                              } catch {
                                   Alert.alert(t('Forum.error'), t('Forum.deleteError'));
                              }
                         }
                    }
               ]
          );
     }; const handleSavePost = async () => {
          const prevSaved = isSaved;

          try {
               // Optimistic update
               setIsSaved(!isSaved);

               if (isSaved) {
                    await postApi.unsavePost(post.id);
                    Alert.alert(t('Forum.unsaved'), t('Forum.postUnsaved'));
               } else {
                    await postApi.savePost(post.id);
                    Alert.alert(t('Forum.saved'), t('Forum.postSaved'));
               }
          } catch (error) {
               // Rollback on error
               setIsSaved(prevSaved);
               console.error('Failed to save/unsave post:', error);
               Alert.alert(t('Common.error'), t('Common.somethingWentWrong'));
          }
     };

     const handleReportPost = () => {
          // TODO: Implement report
          Alert.alert(t('Forum.report'), t('Forum.reportSent'));
     };

     const getImageUrl = (imagePath: string | undefined) => {
          if (!imagePath) return null;
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
               return imagePath;
          }
          return `${BASE_URL}${imagePath}`;
     };

     const imageUrl = post.imageUrl;
     const fullImageUrl = getImageUrl(imageUrl);

     return (
          <>
               <View style={[styles.postContainer, { borderBottomColor: colors.border }]}>
                    {/* Header with Avatar & Name */}
                    <View style={styles.header}>
                         <TouchableOpacity
                              style={styles.userInfo}
                              onPress={handleNavigateToProfile}
                              activeOpacity={0.7}
                         >
                              <Avatar source={post.user.avatarUrl} name={post.user.name} size={32} />
                              <View style={styles.userDetails}>
                                   <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
                                        {post.user.name}
                                   </Text>
                                   <Text style={[styles.postTime, { color: colors.mutedForeground }]}>
                                        {post.createdAt}
                                   </Text>
                              </View>
                         </TouchableOpacity>
                         <TouchableOpacity
                              style={styles.moreButton}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              onPress={() => setMenuVisible(true)}
                         >
                              <MoreHorizontal size={20} color={colors.mutedForeground} />
                         </TouchableOpacity>
                    </View>

                    {/* Content - Padding cho text */}
                    <View style={styles.contentContainer}>
                         {post.title && (
                              <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
                                   {post.title}
                              </Text>
                         )}
                         {post.content && (
                              <Text style={[styles.content, { color: colors.foreground }]} numberOfLines={4}>
                                   {post.content}
                              </Text>
                         )}
                    </View>

                    {/* Image - Full width với metadata overlay */}
                    {fullImageUrl && (
                         <View style={styles.imageWrapper}>
                              <TouchableOpacity
                                   style={[styles.imageContainer, { backgroundColor: colors.muted }]}
                                   onPress={() => !post.isNSFW || showNSFWContent ? setImageModalVisible(true) : null}
                                   activeOpacity={0.95}
                                   disabled={post.isNSFW && !showNSFWContent}
                              >
                                   {!imageError ? (
                                        <Image
                                             source={{ uri: fullImageUrl }}
                                             style={[
                                                  styles.image,
                                                  post.isNSFW && !showNSFWContent && styles.blurredImage
                                             ]}
                                             resizeMode="cover"
                                             onError={() => setImageError(true)}
                                             blurRadius={post.isNSFW && !showNSFWContent ? 40 : 0}
                                        />
                                   ) : (
                                        <View style={styles.imageFallback}>
                                             <ImageIcon size={40} color={colors.mutedForeground} strokeWidth={1.5} />
                                        </View>
                                   )}

                                   {/* NSFW Warning Overlay */}
                                   {post.isNSFW && !showNSFWContent && !imageError && (
                                        <View style={styles.nsfwOverlay}>
                                             <View style={[styles.nsfwCard, { backgroundColor: colors.card }]}>
                                                  <AlertTriangle size={48} color="#ef4444" strokeWidth={2} />
                                                  <Text style={[styles.nsfwTitle, { color: colors.foreground }]}>
                                                       18+ Sensitive Content
                                                  </Text>
                                                  <Text style={[styles.nsfwMessage, { color: colors.mutedForeground }]}>
                                                       This content may contain sensitive material
                                                  </Text>
                                                  <TouchableOpacity
                                                       style={[styles.viewContentBtn, { backgroundColor: '#ef4444' }]}
                                                       onPress={() => setShowNSFWContent(true)}
                                                  >
                                                       <Eye size={18} color="#fff" strokeWidth={2} />
                                                       <Text style={styles.viewContentText}>View Content</Text>
                                                  </TouchableOpacity>
                                             </View>
                                        </View>
                                   )}

                                   {/* Hide Content Button */}
                                   {post.isNSFW && showNSFWContent && !imageError && (
                                        <TouchableOpacity
                                             style={[styles.hideContentBtn, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
                                             onPress={() => setShowNSFWContent(false)}
                                        >
                                             <EyeOff size={16} color="#fff" strokeWidth={2} />
                                             <Text style={styles.hideContentText}>Hide</Text>
                                        </TouchableOpacity>
                                   )}
                              </TouchableOpacity>

                              {/* Metadata Overlay - Bottom Left with Blur */}
                              {post.imageMetadata && !imageError && (
                                   <View style={styles.metadataOverlay}>
                                        <View style={[styles.metadataBlur, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
                                             {post.imageMetadata.cameraModel && (
                                                  <View style={styles.metadataRowCompact}>
                                                       <Camera size={12} color="#fff" strokeWidth={2} />
                                                       <Text style={styles.metadataTextOverlay} numberOfLines={1}>
                                                            {post.imageMetadata.cameraMake} {post.imageMetadata.cameraModel}
                                                       </Text>
                                                  </View>
                                             )}
                                             <View style={styles.metadataDetailsCompact}>
                                                  {post.imageMetadata.focalLength && (
                                                       <Text style={styles.metadataDetailOverlay}>{post.imageMetadata.focalLength}</Text>
                                                  )}
                                                  {post.imageMetadata.aperture && (
                                                       <Text style={styles.metadataDetailOverlay}>{post.imageMetadata.aperture}</Text>
                                                  )}
                                                  {post.imageMetadata.shutterSpeed && (
                                                       <Text style={styles.metadataDetailOverlay}>{post.imageMetadata.shutterSpeed}</Text>
                                                  )}
                                                  {post.imageMetadata.iso && (
                                                       <Text style={styles.metadataDetailOverlay}>ISO {post.imageMetadata.iso}</Text>
                                                  )}
                                             </View>
                                        </View>
                                   </View>
                              )}
                         </View>
                    )}

                    {/* Actions - Icon style Threads */}
                    <View style={styles.actions}>
                         <TouchableOpacity
                              style={styles.actionButton}
                              onPress={handleLike}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                         >
                              <Heart
                                   size={22}
                                   color={isLiked ? '#ef4444' : colors.foreground}
                                   fill={isLiked ? '#ef4444' : 'transparent'}
                                   strokeWidth={2}
                              />
                              {likeCount > 0 && (
                                   <Text style={[styles.actionCount, { color: colors.foreground }]}>
                                        {likeCount}
                                   </Text>
                              )}
                         </TouchableOpacity>

                         <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => setCommentModalVisible(true)}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                         >
                              <MessageCircle size={22} color={colors.foreground} strokeWidth={2} />
                              {commentCount > 0 && (
                                   <Text style={[styles.actionCount, { color: colors.foreground }]}>
                                        {commentCount}
                                   </Text>
                              )}
                         </TouchableOpacity>

                         <TouchableOpacity
                              style={styles.actionButton}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              onPress={handleShare}
                         >
                              <Share2 size={22} color={colors.foreground} strokeWidth={2} />
                         </TouchableOpacity>
                    </View>
               </View>

               <CommentModal
                    visible={commentModalVisible}
                    onClose={() => setCommentModalVisible(false)}
                    postId={post.id}
                    onCommentAdded={handleCommentAdded}
               />

               {/* Image Fullscreen Modal */}
               <Modal
                    visible={imageModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setImageModalVisible(false)}
               >
                    <Pressable
                         style={[styles.imageModal, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}
                         onPress={() => setImageModalVisible(false)}
                    >
                         <TouchableOpacity
                              style={styles.closeImageButton}
                              onPress={() => setImageModalVisible(false)}
                         >
                              <X size={30} color="#fff" strokeWidth={2} />
                         </TouchableOpacity>
                         {fullImageUrl && !imageError && (
                              <Image
                                   source={{ uri: fullImageUrl }}
                                   style={styles.fullscreenImage}
                                   resizeMode="contain"
                              />
                         )}
                    </Pressable>
               </Modal>

               {/* Action Menu Modal */}
               <Modal
                    visible={menuVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setMenuVisible(false)}
               >
                    <Pressable
                         style={styles.menuModalOverlay}
                         onPress={() => setMenuVisible(false)}
                    >
                         <View style={[styles.menuModal, { backgroundColor: colors.card }]}>
                              <View style={[styles.menuHandle, { backgroundColor: colors.muted }]} />

                              <TouchableOpacity
                                   style={styles.menuItem}
                                   onPress={() => {
                                        setMenuVisible(false);
                                        // TODO: View detail
                                   }}
                              >
                                   <Eye size={20} color={colors.foreground} />
                                   <Text style={[styles.menuText, { color: colors.foreground }]}>
                                        {t('Button.viewDetail')}
                                   </Text>
                              </TouchableOpacity>

                              {!isOwner && (
                                   <>
                                        <TouchableOpacity
                                             style={styles.menuItem}
                                             onPress={() => {
                                                  setMenuVisible(false);
                                                  handleReportPost();
                                             }}
                                        >
                                             <Flag size={20} color={colors.foreground} />
                                             <Text style={[styles.menuText, { color: colors.foreground }]}>
                                                  {t('Button.report')}
                                             </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                             style={styles.menuItem}
                                             onPress={() => {
                                                  setMenuVisible(false);
                                                  handleSavePost();
                                             }}
                                        >
                                             <BookMarked size={20} color={colors.foreground} />
                                             <Text style={[styles.menuText, { color: colors.foreground }]}>
                                                  {t('Button.savePost')}
                                             </Text>
                                        </TouchableOpacity>
                                   </>
                              )}

                              {isOwner && (
                                   <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => {
                                             setMenuVisible(false);
                                             handleDeletePost();
                                        }}
                                   >
                                        <Trash2 size={20} color="#ef4444" />
                                        <Text style={[styles.menuText, { color: '#ef4444' }]}>
                                             {t('Button.deletePost')}
                                        </Text>
                                   </TouchableOpacity>
                              )}

                              <TouchableOpacity
                                   style={[styles.menuItem, styles.menuItemCancel]}
                                   onPress={() => setMenuVisible(false)}
                              >
                                   <Text style={[styles.menuText, { color: colors.mutedForeground }]}>
                                        {t('Button.cancel')}
                                   </Text>
                              </TouchableOpacity>
                         </View>
                    </Pressable>
               </Modal>
          </>
     );
};

const styles = StyleSheet.create({
     postContainer: {
          paddingVertical: Spacing.md,
          borderBottomWidth: 0.5,
     },
     header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: Spacing.md,
          marginBottom: Spacing.sm,
     },
     userInfo: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          flex: 1,
          minWidth: 0, // Important for text truncation
     },
     userDetails: {
          flex: 1,
          minWidth: 0, // Important for text truncation
          justifyContent: 'center',
     },
     userName: {
          fontSize: 15,
          fontWeight: '600',
          marginBottom: 2,
     },
     postTime: {
          fontSize: 12,
     },
     moreButton: {
          padding: 4,
     },
     contentContainer: {
          paddingHorizontal: Spacing.md,
          marginBottom: Spacing.sm,
     },
     title: {
          fontSize: 16,
          fontWeight: '600',
          lineHeight: 22,
          marginBottom: 4,
     },
     content: {
          fontSize: 15,
          lineHeight: 20,
     },
     imageWrapper: {
          position: 'relative',
     },
     imageContainer: {
          width: SCREEN_WIDTH,
          aspectRatio: 4 / 5,
          maxHeight: SCREEN_HEIGHT * 0.65,
     },
     image: {
          width: '100%',
          height: '100%',
     },
     imageFallback: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
     metadataOverlay: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
     },
     metadataBlur: {
          padding: 10,
          paddingBottom: 12,
          gap: 4,
     },
     metadataRowCompact: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
     },
     metadataTextOverlay: {
          fontSize: 11,
          color: '#fff',
          fontWeight: '600',
          flex: 1,
     },
     metadataDetailsCompact: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 2,
     },
     metadataDetailOverlay: {
          fontSize: 10,
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '500',
     },
     actions: {
          flexDirection: 'row',
          paddingHorizontal: Spacing.md,
          paddingTop: Spacing.md,
          gap: 16,
     },
     actionButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
     },
     actionCount: {
          fontSize: 14,
          fontWeight: '500',
     },
     imageModal: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
     closeImageButton: {
          position: 'absolute',
          top: 50,
          right: 20,
          zIndex: 10,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
     },
     fullscreenImage: {
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
     },
     blurredImage: {
          opacity: 0.3,
     },
     nsfwOverlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.md,
     },
     nsfwCard: {
          borderRadius: 16,
          padding: Spacing.xl,
          alignItems: 'center',
          gap: Spacing.sm,
          maxWidth: 300,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5,
     },
     nsfwTitle: {
          fontSize: 18,
          fontWeight: '600',
          marginTop: Spacing.sm,
     },
     nsfwMessage: {
          fontSize: 14,
          textAlign: 'center',
          marginBottom: Spacing.sm,
     },
     viewContentBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          marginTop: Spacing.xs,
     },
     viewContentText: {
          color: '#fff',
          fontSize: 15,
          fontWeight: '600',
     },
     hideContentBtn: {
          position: 'absolute',
          top: 12,
          right: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 6,
     },
     hideContentText: {
          color: '#fff',
          fontSize: 13,
          fontWeight: '600',
     },
     menuModalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
     },
     menuModal: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 40,
          paddingTop: 8,
     },
     menuHandle: {
          width: 40,
          height: 4,
          borderRadius: 2,
          alignSelf: 'center',
          marginBottom: 16,
     },
     menuItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.md,
          paddingVertical: 16,
          gap: 12,
     },
     menuItemCancel: {
          marginTop: 8,
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(128, 128, 128, 0.2)',
     },
     menuText: {
          fontSize: 16,
          fontWeight: '500',
     },
});

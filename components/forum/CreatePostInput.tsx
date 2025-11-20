import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/ui/Avatar';
import { useUserStore } from '@/stores/userStore';
import { Spacing } from '@/constants/Colors';
import { CreatePostModal } from './CreatePostModal';
import { usePosts } from '@/lib/hooks/usePostHooks';

export const CreatePostInput: React.FC = () => {
     const { colors } = useTheme();
     const { t } = useTranslation();
     const user = useUserStore(state => state.user);
     const [modalVisible, setModalVisible] = useState(false);
     const { mutate } = usePosts();

     const handleOpenModal = () => {
          setModalVisible(true);
     };

     const handleCloseModal = () => {
          setModalVisible(false);
     };

     const handlePostCreated = () => {
          mutate();
     };

     return (
          <>
               <View style={[styles.container, { borderBottomColor: colors.border }]}>
                    <Avatar source={user?.avatarUrl} name={user?.name} size={32} />
                    <TouchableOpacity
                         style={[styles.input, { backgroundColor: colors.muted }]}
                         onPress={handleOpenModal}
                         activeOpacity={0.7}
                    >
                         <Text style={[styles.placeholder, { color: colors.mutedForeground }]}>
                              {t('Forum.placeholderInputCreatePost')}
                         </Text>
                    </TouchableOpacity>
               </View>

               <CreatePostModal
                    visible={modalVisible}
                    onClose={handleCloseModal}
                    onPostCreated={handlePostCreated}
               />
          </>
     );
};

const styles = StyleSheet.create({
     container: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: Spacing.sm,
          borderBottomWidth: 0.5,
     },
     input: {
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: Spacing.md,
          borderRadius: 20,
          justifyContent: 'center',
     },
     placeholder: {
          fontSize: 14,
     },
});

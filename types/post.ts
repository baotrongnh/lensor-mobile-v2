/**
 * Post Types
 * Giống y hệt types của web version
 */

export type PostType = {
     id: string;
     user: {
          id: string;
          name: string;
          avatarUrl: string;
          isFollowed: boolean;
     };
     title: string;
     content?: string;
     imageUrl?: string;
     thumbnailUrl?: string;
     imageMetadata?: {
          dpi?: number;
          iso?: number;
          fStop?: string;
          flash?: string;
          width?: number;
          height?: number;
          artist?: string;
          author?: string;
          format?: string;
          aperture?: string;
          dateTime?: string;
          fileSize?: number;
          software?: string;
          lensModel?: string;
          cameraMake?: string;
          colorSpace?: string;
          dimensions?: string;
          cameraModel?: string;
          focalLength?: string;
          exposureMode?: string;
          exposureTime?: string;
          meteringMode?: string;
          shutterSpeed?: string;
          whiteBalance?: string;
          exposureProgram?: string;
          dateTimeOriginal?: string;
          lensSerialNumber?: string;
          sceneCaptureType?: string;
          dateTimeDigitized?: string;
          cameraSerialNumber?: string;
     };
     isNSFW: boolean;
     voteCount: number;
     isLiked: boolean;
     isSaved: boolean;
     commentCount: number;
     createdAt: string;
};

export type CommentType = {
     id: string;
     user: {
          id: string;
          avatarUrl: string;
          name: string;
     };
     time: string;
     content: string;
};

export type CommentResponseType = {
     id: string;
     postId: string;
     userId: string;
     content: string;
     parentId: string | null;
     createdAt: string;
     updatedAt: string;
     deletedAt: string | null;
     user: {
          id: string;
          name: string;
          avatarUrl: string;
     };
};

export type CommentPayload = {
     content: string;
     parentId: string | null;
};

export type SavedPostItem = {
     id: string;
     userId: string;
     postId: string;
     createdAt: string;
     post: PostType;
};

export type SavedPostsResponse = {
     data: {
          savedPosts: SavedPostItem[];
          total: number;
     };
     statusCode: number;
};

export type IsSavedResponse = {
     data: {
          isSaved: boolean;
     };
     statusCode: number;
};

export interface FollowNotificationSettings {
     notifyOnPost: boolean;
     notifyOnComment: boolean;
     notifyOnVote: boolean;
}

export interface FollowUser {
     id: string;
     email: string;
     name: string;
     avatarUrl?: string;
     bio?: string;
}

export interface Follow {
     id: string;
     followerId: string;
     followingId: string;
     notifyOnPost: boolean;
     notifyOnComment: boolean;
     notifyOnVote: boolean;
     createdAt: string;
     // Nested user objects (if populated by backend)
     follower?: FollowUser;
     following?: FollowUser;
     // Flat structure (alternative response format)
     name?: string;
     avatar?: string;
     email?: string;
}

export interface FollowStats {
     followersCount: number;
     followingCount: number;
}

export interface CheckFollowResponse {
     isFollowing: boolean;
     settings?: FollowNotificationSettings;
}

export interface FollowResponse {
     data: Follow;
}

export interface FollowListResponse {
     data: Follow[];
}

export interface FollowStatsResponse {
     data: FollowStats;
}

export interface CheckFollowResponseData {
     data: CheckFollowResponse;
}

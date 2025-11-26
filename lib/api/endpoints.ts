const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || '';

export const createEndpoints = (resource: string) => {
     return {
          all: `${API_PREFIX}/${resource}`,
          byId: (id: string | number) => `${API_PREFIX}/${resource}/${id}`,
     };
};

export const endpoints = {
     post: createEndpoints('posts'),
     marketplace: createEndpoints('marketplaces'),
     product: createEndpoints('products'),
     forum: createEndpoints('forums'),
     comment: {
          byPostId: (postId: string) => `${API_PREFIX}/posts/${postId}/comments`,
     },
     like: {
          byPostId: (postId: string) => `${API_PREFIX}/posts/${postId}/like`,
     },
     payment: {
          payos: `${API_PREFIX}/payos/create`,
     },
     wallet: `${API_PREFIX}/wallet`,
     paymentHistory: `${API_PREFIX}/payment-history`,
     cart: createEndpoints('cart'),
     review: {
          byProductId: (productId: string) => `${API_PREFIX}/products/${productId}/reviews`,
          byId: (productId: string, reviewId: string) => `${API_PREFIX}/products/${productId}/reviews/${reviewId}`,
     },
     orders: {
          all: `${API_PREFIX}/orders`,
          checkout: `${API_PREFIX}/orders/checkout`,
          byId: (orderId: string) => `${API_PREFIX}/orders/${orderId}`,
          products: (orderId: string) => `${API_PREFIX}/orders/${orderId}/products`,
          sold: `${API_PREFIX}/orders/sold`,
          withdraw: (orderId: string) => `${API_PREFIX}/orders/${orderId}/withdraw`,
     },
     message: {
          all: `${API_PREFIX}/chat/rooms`,
          detail: (roomId: string) => `${API_PREFIX}/chat/rooms/${roomId}`,
          allMessage: (roomId: string, limit: number = 50) =>
               `${API_PREFIX}/chat/rooms/${roomId}/messages?limit=${limit}`,
          createDirect: (otherUserId: string) => `${API_PREFIX}/chat/direct/${otherUserId}`,
     },
     withdrawal: {
          all: `${API_PREFIX}/withdrawals`,
          create: `${API_PREFIX}/withdrawals`,
          byId: (id: string) => `${API_PREFIX}/withdrawals/${id}`,
          statistics: `${API_PREFIX}/withdrawals/statistics`,
     },
     bankCard: {
          all: `${API_PREFIX}/bank-cards`,
          create: `${API_PREFIX}/bank-cards`,
          byId: (id: string) => `${API_PREFIX}/bank-cards/${id}`,
          setDefault: (id: string) => `${API_PREFIX}/bank-cards/${id}/default`,
     },
     userFollows: {
          follow: (userId: string) => `${API_PREFIX}/user-follows/${userId}`,
          unfollow: (userId: string) => `${API_PREFIX}/user-follows/${userId}`,
          updateSettings: (userId: string) => `${API_PREFIX}/user-follows/${userId}/settings`,
          check: (userId: string) => `${API_PREFIX}/user-follows/check/${userId}`,
          myFollowers: `${API_PREFIX}/user-follows/followers`,
          myFollowing: `${API_PREFIX}/user-follows/following`,
          userFollowers: (userId: string) => `${API_PREFIX}/user-follows/followers?userId=${userId}`,
          userFollowing: (userId: string) => `${API_PREFIX}/user-follows/following?userId=${userId}`,
     },
     savedPost: {
          all: (limit: number = 20, offset: number = 0) => `${API_PREFIX}/saved-posts?limit=${limit}&offset=${offset}`,
          byId: (postId: string) => `${API_PREFIX}/saved-posts/${postId}`,
          isSaved: (postId: string) => `${API_PREFIX}/saved-posts/${postId}/is-saved`,
     },
     reports: {
          all: `${API_PREFIX}/reports`,
          create: `${API_PREFIX}/reports`,
          byId: (reportId: string) => `${API_PREFIX}/reports/${reportId}`,
     },
     tickets: {
          all: `${API_PREFIX}/tickets`,
          create: `${API_PREFIX}/tickets`,
          byId: (ticketId: string) => `${API_PREFIX}/tickets/${ticketId}`,
          addMessage: (ticketId: string) => `${API_PREFIX}/tickets/${ticketId}/messages`,
          close: (ticketId: string) => `${API_PREFIX}/tickets/${ticketId}/close`,
          reopen: (ticketId: string) => `${API_PREFIX}/tickets/${ticketId}/reopen`,
     },
     notification: {
          all: `${API_PREFIX}/notifications`,
          markAsRead: (id: string) => `${API_PREFIX}/notifications/${id}/read`,
          markAllAsRead: `${API_PREFIX}/notifications/read-all`,
     },
     systemVariables: {
          discountRate: `${API_PREFIX}/system-variables/discount-rate`,
     },
};

/**
 * Date formatting utilities
 */

export const formatDate = (dateString: string): string => {
     const date = new Date(dateString);
     return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
     });
};

export const formatRelativeDate = (dateString: string): string => {
     const date = new Date(dateString);
     const now = new Date();
     const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

     if (diffInSeconds < 60) return 'Just now';
     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
     if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

     return formatDate(dateString);
};

export const formatDateShort = (dateString: string): string => {
     const date = new Date(dateString);
     return date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
     });
};

export const formatTime = (dateString: string): string => {
     const date = new Date(dateString);
     return date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
     });
};

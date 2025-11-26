/**
 * Format date to relative time string
 * E.g., "2 minutes ago", "1 hour ago", "3 days ago"
 */
export function formatTimeAgo(dateString: string): string {
     try {
          const date = new Date(dateString);
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

          if (diffInSeconds < 60) {
               return `${diffInSeconds} giây trước`;
          }

          const diffInMinutes = Math.floor(diffInSeconds / 60);
          if (diffInMinutes < 60) {
               return `${diffInMinutes} phút trước`;
          }

          const diffInHours = Math.floor(diffInMinutes / 60);
          if (diffInHours < 24) {
               return `${diffInHours} giờ trước`;
          }

          const diffInDays = Math.floor(diffInHours / 24);
          if (diffInDays < 7) {
               return `${diffInDays} ngày trước`;
          }

          const diffInWeeks = Math.floor(diffInDays / 7);
          if (diffInWeeks < 4) {
               return `${diffInWeeks} tuần trước`;
          }

          const diffInMonths = Math.floor(diffInDays / 30);
          if (diffInMonths < 12) {
               return `${diffInMonths} tháng trước`;
          }

          const diffInYears = Math.floor(diffInDays / 365);
          return `${diffInYears} năm trước`;
     } catch {
          return dateString;
     }
}

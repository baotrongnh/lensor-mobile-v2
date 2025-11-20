/**
 * Status color utilities
 */

export const getStatusColor = (status: string): string => {
     switch (status.toLowerCase()) {
          case 'completed':
          case 'success':
          case 'delivered':
               return '#10b981';
          case 'failed':
          case 'cancelled':
          case 'rejected':
               return '#ef4444';
          case 'processing':
          case 'pending':
          case 'in_progress':
               return '#3b82f6';
          case 'warning':
               return '#eab308';
          default:
               return '#6b7280';
     }
};

export const getStatusLabel = (status: string): string => {
     const labels: Record<string, string> = {
          completed: 'Completed',
          success: 'Success',
          delivered: 'Delivered',
          failed: 'Failed',
          cancelled: 'Cancelled',
          rejected: 'Rejected',
          processing: 'Processing',
          pending: 'Pending',
          in_progress: 'In Progress',
          warning: 'Warning',
     };

     return labels[status.toLowerCase()] || status;
};

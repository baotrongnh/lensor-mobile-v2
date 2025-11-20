export type ReportStatus = 'pending' | 'approved' | 'rejected' | 'need_more_info';

export type Report = {
     id: string;
     orderId: string;
     productId: string;
     buyerId: string;
     sellerId: string;
     reason: string;
     evidence: string[];
     status: ReportStatus;
     adminResponse: string | null;
     createdAt: string;
     updatedAt: string;
     resolvedAt: string | null;
};

export type CreateReportFormData = {
     orderId: string;
     productId: string;
     reason: string;
     evidence?: File[];
};

export type ReportResponse = {
     data: Report;
};

export type ReportsResponse = {
     data: Report[];
};

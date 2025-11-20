import { CreateReportFormData, ReportResponse, ReportsResponse } from '@/types/report';
import { apiClient } from './client';
import { endpoints } from './endpoints';

export const reportApi = {
     /**
      * Create report with multipart/form-data (direct file upload)
      */
     createReportWithFiles: async (formData: FormData): Promise<ReportResponse> => {
          const res = await apiClient.post(endpoints.reports.create, formData, {
               headers: {
                    'Content-Type': 'multipart/form-data',
               },
          });
          return res.data;
     },

     /**
      * Get all user reports
      */
     getMyReports: async (): Promise<ReportsResponse> => {
          const res = await apiClient.get(endpoints.reports.all);
          return res.data;
     },

     /**
      * Get report by ID
      */
     getReportById: async (reportId: string): Promise<ReportResponse> => {
          const res = await apiClient.get(endpoints.reports.byId(reportId));
          return res.data;
     },
};

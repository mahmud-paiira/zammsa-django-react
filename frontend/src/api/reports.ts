import api from './client';
import { DashboardStats } from '../types';

export const reportsApi = {
  getDashboard: (params?: Record<string, any>) =>
    api.get<DashboardStats>('/reporting/dashboards/procurement/', { params }).then((r) => r.data),

  getQuarterlyReport: (params: { year: number; quarter: number }) =>
    api.get('/reporting/reports/generate/quarterly/', { params, responseType: 'blob' }),

  getDirectBiddingReport: (params?: Record<string, any>) =>
    api.get('/reporting/reports/generate/direct-bidding/', { params, responseType: 'blob' }),

  getAmendmentsReport: (params?: Record<string, any>) =>
    api.get('/reporting/reports/generate/amendments/', { params, responseType: 'blob' }),

  downloadReport: (reportId: string) =>
    api.get(`/reporting/archives/${reportId}/`, { responseType: 'blob' }),

  scheduleReport: (data: {
    report_type: string;
    schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    params?: Record<string, any>;
  }) => api.post('/reporting/report-definitions/', data).then((r) => r.data),

  listScheduled: () =>
    api.get('/reporting/report-definitions/').then((r) => r.data),

  searchArchive: (params: { q: string; date_from?: string; date_to?: string; type?: string }) =>
    api.get('/reporting/archives/', { params }).then((r) => r.data),
};

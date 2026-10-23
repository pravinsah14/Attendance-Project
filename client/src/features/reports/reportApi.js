import { baseApi } from '../../app/api';

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReport: builder.query({
      query: (params) => ({ url: '/reports/attendance', params }),
      providesTags: ['Report'],
    }),
    getMyReport: builder.query({
      query: (params) => ({ url: '/reports/my', params }),
      providesTags: ['Report'],
    }),
  }),
});

export const { useGetReportQuery, useGetMyReportQuery } = reportApi;

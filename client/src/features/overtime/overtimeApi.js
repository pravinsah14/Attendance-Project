import { baseApi } from '../../app/api';

export const overtimeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestOvertime: builder.mutation({
      query: (body) => ({
        url: '/overtime/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Overtime'],
    }),
    getMyOvertime: builder.query({
      query: (params) => ({ url: '/overtime/my', params }),
      providesTags: ['Overtime'],
    }),
    getPendingOvertime: builder.query({
      query: (params) => ({ url: '/overtime/pending', params }),
      providesTags: ['Overtime'],
    }),
    getAllOvertime: builder.query({
      query: (params) => ({ url: '/overtime/all', params }),
      providesTags: ['Overtime'],
    }),
    reviewOvertime: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/overtime/${id}/review`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Overtime'],
    }),
  }),
});

export const {
  useRequestOvertimeMutation,
  useGetMyOvertimeQuery,
  useGetPendingOvertimeQuery,
  useGetAllOvertimeQuery,
  useReviewOvertimeMutation,
} = overtimeApi;

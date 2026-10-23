import { baseApi } from '../../app/api';

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    punchIn: builder.mutation({
      query: (body) => ({
        url: '/attendance/punch-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    punchOut: builder.mutation({
      query: (body) => ({
        url: '/attendance/punch-out',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query({
      query: (params) => ({ url: '/attendance/my', params }),
      providesTags: ['Attendance'],
    }),
    getTeamAttendance: builder.query({
      query: (params) => ({ url: '/attendance/team', params }),
      providesTags: ['Attendance'],
    }),
    getAllAttendance: builder.query({
      query: (params) => ({ url: '/attendance/all', params }),
      providesTags: ['Attendance'],
    }),
    validateAttendance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/attendance/${id}/validate`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getTodayStatus: builder.query({
      query: () => '/attendance/today',
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useGetAllAttendanceQuery,
  useValidateAttendanceMutation,
  useGetTodayStatusQuery,
} = attendanceApi;

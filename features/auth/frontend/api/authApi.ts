import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8001/api/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token || localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => {
        const formData = new URLSearchParams()
        formData.append('username', credentials.email)
        formData.append('password', credentials.password)
        return {
          url: '/token',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      },
    }),
    getMe: builder.query({
      query: () => '/me',
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation, useGetMeQuery } = authApi

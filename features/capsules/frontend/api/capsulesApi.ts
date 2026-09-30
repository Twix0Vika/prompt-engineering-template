import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Capsule, CreateCapsulePayload, UpdateCapsulePayload } from './types'
import { isDevAuthBypassEnabled } from '@features/auth/frontend/config'

const BASE_URL = 'http://localhost:8001'

const mockCapsules: Capsule[] = [
  {
    id: 'mock-summer',
    title: 'Summer memories',
    target_datetime: '2025-06-21T12:00:00.000Z',
    notify_email: 'dev@example.test',
    status: 'opened',
    text: 'A little collection of sunny days and slow afternoons.',
    media_files: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80'],
  },
  {
    id: 'mock-letter',
    title: 'A letter to future me',
    target_datetime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    notify_email: 'dev@example.test',
    status: 'locked',
    text: 'Remember how far you have come.',
    media_files: [],
  },
  {
    id: 'mock-roadtrip',
    title: 'Road trip playlist',
    target_datetime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    notify_email: 'dev@example.test',
    status: 'locked',
    text: null,
    media_files: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80'],
  },
  {
    id: 'mock-goals',
    title: '2024 goals',
    target_datetime: '2024-12-31T12:00:00.000Z',
    notify_email: 'dev@example.test',
    status: 'ready',
    text: 'Small steps, every day.',
    media_files: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80'],
  },
]

const mockBaseQuery = async (
  args: string | { url: string; method?: string; body?: unknown },
) => {
  const { url, method = 'GET', body } =
    typeof args === 'string' ? { url: args } : args
  if (url === '/capsules/' && method === 'GET') return { data: mockCapsules }
  if (url.startsWith('/capsules/') && method === 'GET') {
    const capsule = mockCapsules.find((item) => item.id === url.split('/')[2])
    return capsule ? { data: capsule } : { error: { status: 404, data: 'Not found' } }
  }
  if (url === '/capsules/' && method === 'POST') {
    const form = body as FormData
    const created: Capsule = {
      id: `mock-${Date.now()}`,
      title: String(form.get('title') ?? 'Untitled capsule'),
      target_datetime: String(form.get('target_datetime')),
      notify_email: String(form.get('notify_email') ?? 'dev@example.test'),
      status: 'locked',
      text: String(form.get('text') ?? '') || null,
      media_files: [],
    }
    mockCapsules.unshift(created)
    return { data: created }
  }
  if (url.startsWith('/capsules/') && method === 'DELETE') {
    const index = mockCapsules.findIndex((item) => item.id === url.split('/')[2])
    if (index >= 0) mockCapsules.splice(index, 1)
    return { data: undefined }
  }
  if (url.endsWith('/open') && method === 'POST') {
    const capsule = mockCapsules.find((item) => item.id === url.split('/')[2])
    if (!capsule) return { error: { status: 404, data: 'Not found' } }
    capsule.status = 'opened'
    return { data: capsule }
  }
  return { error: { status: 400, data: 'Unsupported mock request' } }
}

export const capsulesApi = createApi({
  reducerPath: 'capsulesApi',
  baseQuery: isDevAuthBypassEnabled
    ? mockBaseQuery
    : fetchBaseQuery({
      baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
    }),
  tagTypes: ['Capsule'],
  endpoints: (builder) => ({
    // ── List ────────────────────────────────────────────────
    listCapsules: builder.query<Capsule[], void>({
      query: () => '/capsules/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Capsule' as const, id })),
              { type: 'Capsule', id: 'LIST' },
            ]
          : [{ type: 'Capsule', id: 'LIST' }],
    }),

    // ── Get one ─────────────────────────────────────────────
    getCapsule: builder.query<Capsule, string>({
      query: (id) => `/capsules/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Capsule', id }],
    }),

    // ── Create ──────────────────────────────────────────────
    createCapsule: builder.mutation<Capsule, CreateCapsulePayload>({
      query: (payload) => {
        const form = new FormData()
        form.append('title', payload.title)
        form.append('target_datetime', payload.target_datetime)
        form.append('notify_email', payload.notify_email)
        if (payload.text) form.append('text', payload.text)
        payload.files?.forEach((f) => form.append('files', f))
        return { url: '/capsules/', method: 'POST', body: form }
      },
      invalidatesTags: [{ type: 'Capsule', id: 'LIST' }],
    }),

    // ── Update ──────────────────────────────────────────────
    updateCapsule: builder.mutation<Capsule, UpdateCapsulePayload>({
      query: ({ id, ...payload }) => {
        const form = new FormData()
        form.append('title', payload.title)
        form.append('target_datetime', payload.target_datetime)
        form.append('notify_email', payload.notify_email)
        if (payload.text) form.append('text', payload.text)
        payload.files?.forEach((f) => form.append('files', f))
        return { url: `/capsules/${id}`, method: 'PUT', body: form }
      },
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Capsule', id },
        { type: 'Capsule', id: 'LIST' },
      ],
    }),

    // ── Delete ──────────────────────────────────────────────
    deleteCapsule: builder.mutation<void, string>({
      query: (id) => ({ url: `/capsules/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Capsule', id: 'LIST' }],
    }),

    // ── Open ────────────────────────────────────────────────
    openCapsule: builder.mutation<Capsule, string>({
      query: (id) => ({ url: `/capsules/${id}/open`, method: 'POST' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Capsule', id }],
    }),
  }),
})

export const {
  useListCapsulesQuery,
  useGetCapsuleQuery,
  useCreateCapsuleMutation,
  useUpdateCapsuleMutation,
  useDeleteCapsuleMutation,
  useOpenCapsuleMutation,
} = capsulesApi

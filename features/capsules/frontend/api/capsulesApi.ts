import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Capsule, CreateCapsulePayload, UpdateCapsulePayload } from './types'
import { isDevAuthBypassEnabled } from '@features/auth/frontend/config'

const BASE_URL = 'http://localhost:8001'

const mockCapsules: Capsule[] = [
  {
    id: 'capsule-summer-25',
    title: "Літні спогади '25",
    target_datetime: '2025-08-25T18:00:00.000Z',
    notify_email: 'dev@example.test',
    status: 'opened',
    text: 'Теплі вечори на узбережжі, смак свіжого інжиру та нескінченні розмови під зоряним небом. Нехай цей спокій надихає тебе навіть у найхолодніші зимові дні.',
    media_files: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    ],
  },
  {
    id: 'capsule-carpathians',
    title: 'Подорож до Карпат',
    target_datetime: '2026-05-10T12:00:00.000Z',
    notify_email: 'dev@example.test',
    status: 'opened',
    text: 'Сходження на Чорногору на світанку. Запах соснової хвої, гарячий чай із термоса і відчуття абсолютної свободи на вершині. Пам\'ятай це відчуття простору.',
    media_files: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
    ],
  },
  {
    id: 'capsule-university',
    title: 'Університетські моменти',
    target_datetime: '2026-09-01T09:00:00.000Z',
    notify_email: 'dev@example.test',
    status: 'ready',
    text: 'Остання сесія, безсонні ночі за дипломним проєктом, але стільки щирого сміху в коридорах факультету. Цей час навчив нас вірити в неможливе.',
    media_files: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    ],
  },
  {
    id: 'capsule-future-5years',
    title: 'Лист собі через 5 років',
    target_datetime: '2031-10-15T09:00:00.000Z',
    notify_email: 'dev@example.test',
    status: 'locked',
    text: null,
    media_files: [],
  },
  {
    id: 'capsule-philosophy',
    title: 'Мрії та філософія життя',
    target_datetime: '2028-01-01T00:00:00.000Z',
    notify_email: 'dev@example.test',
    status: 'locked',
    text: null,
    media_files: [],
  },
  {
    id: 'capsule-lviv-vintage',
    title: 'Ретро-вікенд у Львові',
    target_datetime: '2026-03-15T15:00:00.000Z',
    notify_email: 'dev@example.test',
    status: 'opened',
    text: 'Аромат свіжозвареної кави у двориках старого міста, звуки джазу з відкритого вікна і старий плівковий фотоапарат у кишені пальта.',
    media_files: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80',
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1200&q=80',
    ],
  },
]

const mockBaseQuery = async (
  args: string | { url: string; method?: string; body?: unknown },
) => {
  const { url, method = 'GET', body } =
    typeof args === 'string' ? { url: args } : args

  const readMockForm = () => {
    if (!(body instanceof FormData)) return null
    const files = body.getAll('files').filter((value): value is File => value instanceof File)
    return {
      title: String(body.get('title') ?? ''),
      target_datetime: String(body.get('target_datetime') ?? ''),
      notify_email: String(body.get('notify_email') ?? ''),
      text: String(body.get('text') ?? '') || null,
      files,
    }
  }

  if (url === '/capsules/' && method === 'GET') return { data: mockCapsules }
  if (url.startsWith('/capsules/') && method === 'GET') {
    const capsule = mockCapsules.find((item) => item.id === url.split('/')[2])
    return capsule ? { data: capsule } : { error: { status: 404, data: 'Not found' } }
  }
  if ((url === '/capsules/' && method === 'POST') || (url.startsWith('/capsules/') && method === 'PUT')) {
    const form = readMockForm()
    if (!form || !form.title || !form.target_datetime || !form.notify_email) {
      return { error: { status: 400, data: 'Title, unlock date, and notification email are required.' } }
    }
    if (new Date(form.target_datetime).getTime() <= Date.now()) {
      return { error: { status: 400, data: 'Unlock date must be in the future.' } }
    }

    const mediaFiles = form.files.map((file) => URL.createObjectURL(file))
    if (method === 'PUT') {
      const id = url.split('/')[2]
      const existing = mockCapsules.find((item) => item.id === id)
      if (!existing) return { error: { status: 404, data: 'Capsule not found.' } }
      if (existing.status !== 'locked') {
        return { error: { status: 403, data: 'Cannot edit a capsule after its unlock date.' } }
      }
      existing.title = form.title
      existing.target_datetime = form.target_datetime
      existing.notify_email = form.notify_email
      existing.text = form.text
      if (mediaFiles.length > 0) existing.media_files = mediaFiles
      return { data: existing }
    }

    const created: Capsule = {
      id: `mock-${Date.now()}`,
      title: form.title,
      target_datetime: form.target_datetime,
      notify_email: form.notify_email,
      status: 'locked',
      text: form.text,
      media_files: mediaFiles,
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

const realBaseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}/api`,
  prepareHeaders: (headers) => {
    const token =
      localStorage.getItem('token') || (isDevAuthBypassEnabled ? 'dev-only-mock-token' : null)
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  },
})

const dynamicBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const result = await realBaseQuery(args, api, extraOptions)
  // If backend is unreachable or returns fetch error in dev mode, gracefully fall back to mock
  if (result.error && result.error.status === 'FETCH_ERROR') {
    return mockBaseQuery(args)
  }
  return result
}

export const capsulesApi = createApi({
  reducerPath: 'capsulesApi',
  baseQuery: dynamicBaseQuery,
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
        form.append('notify_email', payload.notify_email || 'dev@example.test')
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
        form.append('notify_email', payload.notify_email || 'dev@example.test')
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

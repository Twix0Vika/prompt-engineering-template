export type CapsuleStatus = 'locked' | 'ready' | 'opened'

export interface Capsule {
  id: string
  title: string
  target_datetime: string
  notify_email: string
  status: CapsuleStatus
  text: string | null
  media_files: string[]
}

export interface CreateCapsulePayload {
  title: string
  target_datetime: string
  text?: string
  notify_email: string
  files?: File[]
}

export type UpdateCapsulePayload = CreateCapsulePayload & { id: string }


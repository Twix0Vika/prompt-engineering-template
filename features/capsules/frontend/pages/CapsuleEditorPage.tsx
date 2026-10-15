import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, FileImage, Lock, Mail, PenTool, Sparkles } from 'lucide-react'
import {
  useCreateCapsuleMutation,
  useUpdateCapsuleMutation,
  useGetCapsuleQuery,
} from '../api/capsulesApi'

const MAX_BYTES = 15 * 1024 * 1024

export function CapsuleEditorPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { data: existing } = useGetCapsuleQuery(id!, { skip: !isEdit })

  const [title, setTitle] = useState(existing?.title ?? '')
  const [targetDatetime, setTargetDatetime] = useState(
    existing?.target_datetime ? existing.target_datetime.slice(0, 16) : ''
  )
  const [text, setText] = useState(existing?.text ?? '')
  const [notifyEmail, setNotifyEmail] = useState(existing?.notify_email ?? 'dev@example.test')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [saveError, setSaveError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [createCapsule, { isLoading: creating }] = useCreateCapsuleMutation()
  const [updateCapsule, { isLoading: updating }] = useUpdateCapsuleMutation()

  if (existing && !title && existing.title) {
    setTitle(existing.title)
    setNotifyEmail(existing.notify_email || 'dev@example.test')
    setTargetDatetime(existing.target_datetime.slice(0, 16))
    setText(existing.text ?? '')
  }

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const totalSize = selected.reduce((acc: number, f: File) => acc + f.size, 0)
    if (totalSize > MAX_BYTES) {
      setFileError('Total file size must not exceed 15 MB')
      return
    }
    setFileError('')
    setFiles(selected)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const targetDate = new Date(targetDatetime)
    if (!Number.isFinite(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
      setSaveError('Choose a valid unlock date and time in the future.')
      return
    }

    setSaveError('')
    const payload = {
      title,
      target_datetime: targetDate.toISOString(),
      text,
      notify_email: notifyEmail || 'dev@example.test',
      files,
    }
    try {
      if (isEdit && id) {
        await updateCapsule({ ...payload, id }).unwrap()
      } else {
        await createCapsule(payload).unwrap()
      }
      navigate('/dashboard')
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = error.data
        if (typeof data === 'object' && data !== null && 'detail' in data && typeof data.detail === 'string') {
          setSaveError(data.detail)
          return
        }
        if (typeof data === 'string') {
          setSaveError(data)
          return
        }
      }
      setSaveError('Failed to save capsule. Please verify your inputs and try again.')
    }
  }

  const isBusy = creating || updating

  return (
    <div className="timecapsule-shell min-h-screen px-6 py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#EADFD8] text-xs font-semibold text-[#7e6a65] hover:text-[#3d2c29] hover:bg-white shadow-xs transition-all"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>

        {/* Card Form Container */}
        <div className="rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] p-8 sm:p-10 shadow-lg backdrop-blur-xl relative overflow-hidden">
          <div className="mb-8">
            <span className="editorial-kicker text-sm">
              {isEdit ? 'Modify Existing Capsule' : 'New Memory Vault'}
            </span>
            <h1 className="editorial-heading text-3xl sm:text-4xl font-bold text-[#3d2c29] mt-1">
              {isEdit ? 'Edit Capsule' : 'Create Time Capsule'}
            </h1>
            <p className="mt-2 text-xs text-[#7e6a65] leading-relaxed">
              {isEdit
                ? 'Update your capsule fields. Editing is locked once the target date arrives.'
                : 'Deposit your memories, personal letters, and photos for safe keeping until the specified date.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5 flex items-center gap-1.5">
                <PenTool size={13} className="text-[#e8a49c]" /> Capsule Title *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Note to myself on our 5th anniversary"
                className="timecapsule-field w-full rounded-2xl px-4 py-3 text-sm outline-none font-medium border border-[#EADFD8] bg-white"
              />
            </div>

            {/* Target Datetime */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#e8a49c]" /> Unlock Date and Time *
              </label>
              <input
                required
                type="datetime-local"
                value={targetDatetime}
                onChange={(e) => setTargetDatetime(e.target.value)}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                className="timecapsule-field w-full rounded-2xl px-4 py-3 text-sm outline-none font-medium border border-[#EADFD8] bg-white"
              />
            </div>

            {/* Letter Text */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#e8a49c]" /> Letter / Memory Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Write your personal message to the future..."
                className="timecapsule-field w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none font-medium leading-relaxed border border-[#EADFD8] bg-white"
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5 flex items-center gap-1.5">
                <FileImage size={13} className="text-[#e8a49c]" /> Attach Media{' '}
                <span className="text-[#a4918c] font-normal lowercase">(max 15 MB)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFiles}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full timecapsule-dropzone flex flex-col items-center justify-center p-6 rounded-2xl text-center cursor-pointer group bg-[#FBE8E6]/40 border border-dashed border-[#EADFD8] transition-all hover:bg-[#FBE8E6]/70"
              >
                <div className="h-10 w-10 rounded-full bg-white text-[#8c5346] flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                  <FileImage size={18} />
                </div>
                <span className="text-sm font-semibold text-[#3d2c29]">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : 'Click to select photos, videos, or documents'}
                </span>
                <span className="text-xs text-[#a4918c] mt-0.5">PNG, JPG, MP4, PDF up to 15 MB</span>
              </button>
              {fileError && <p className="text-xs font-semibold text-rose-600 mt-1.5">{fileError}</p>}
            </div>

            {/* Notification Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-[#e8a49c]" /> Notification Email
              </label>
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="you@example.com"
                className="timecapsule-field w-full rounded-2xl px-4 py-3 text-sm outline-none font-medium border border-[#EADFD8] bg-white"
              />
            </div>

            {/* Error Message */}
            {saveError && (
              <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
                {saveError}
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#7e6a65] hover:text-[#3d2c29]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="timecapsule-primary flex items-center gap-2 px-7 py-3 text-xs font-bold uppercase tracking-wider rounded-full disabled:opacity-50 shadow-sm"
              >
                <Lock size={14} />
                {isBusy ? 'Saving...' : isEdit ? 'Save Changes' : 'Seal Capsule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

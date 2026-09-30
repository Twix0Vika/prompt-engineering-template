import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  ArrowUpRight,
  Calendar,
  Clock,
  Compass,
  Eye,
  FileImage,
  Lock,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
  Unlock,
  X,
} from 'lucide-react'
import { logout } from '@features/auth/frontend/api/authSlice'
import { isDevAuthBypassEnabled } from '@features/auth/frontend/config'
import {
  useCreateCapsuleMutation,
  useDeleteCapsuleMutation,
  useListCapsulesQuery,
} from '../api/capsulesApi'
import type { Capsule } from '../api/types'

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function LiveCountdown({ target }: { target: string }) {
  const [now, setNow] = useState(Date.now())
  const remaining = Math.max(0, new Date(target).getTime() - now)
  const days = Math.floor(remaining / 86400000)
  const hours = Math.floor((remaining % 86400000) / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (remaining <= 0) {
    return <span className="text-emerald-600 font-semibold">Ready to unlock</span>
  }

  return (
    <span className="font-mono text-xs font-semibold tracking-tight">
      {days > 0 && `${days}d `}
      {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
    </span>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data: capsules = [], isLoading, error } = useListCapsulesQuery()
  const [deleteCapsule] = useDeleteCapsuleMutation()
  const [createCapsule, { isLoading: isCreating }] = useCreateCapsuleMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lightbox, setLightbox] = useState<Capsule | null>(null)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const stats = useMemo(() => {
    const total = capsules.length
    const locked = capsules.filter((c) => c.status === 'locked').length
    const ready = capsules.filter((c) => c.status === 'ready').length
    const opened = capsules.filter((c) => c.status === 'opened').length
    return { total, locked, ready, opened }
  }, [capsules])

  const submitCapsule = async (event: FormEvent) => {
    event.preventDefault()
    if (!title || !target) return

    await createCapsule({
      title,
      target_datetime: new Date(target).toISOString(),
      text,
      notify_email: 'dev@example.test',
      files: file ? [file] : [],
    }).unwrap()

    setTitle('')
    setTarget('')
    setText('')
    setFile(null)
    setIsModalOpen(false)
  }

  const removeCapsule = async (id: string) => {
    if (confirm('Are you sure you want to delete this time capsule? This action cannot be undone.')) {
      await deleteCapsule(id)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <main className="timecapsule-shell min-h-screen pb-24">
      {/* ── Modern Floating Nav Header ── */}
      <header className="timecapsule-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3.5">
            <div className="timecapsule-logo flex h-10 w-10 items-center justify-center rounded-2xl">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="editorial-heading text-lg font-bold leading-tight tracking-tight">TimeCapsule</p>
              <p className="text-[11px] font-medium text-[#7c6863]">Personal Memory Vault</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDevAuthBypassEnabled && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Dev Mode
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="timecapsule-primary flex items-center gap-2 px-5 py-2.5 text-xs tracking-wide uppercase transition-all"
            >
              <Plus size={16} /> New Capsule
            </button>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#7c6863] hover:text-[#3d2c29] hover:bg-white/80 transition-all border border-transparent hover:border-[#e8d5ce]"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero & Intro Section ── */}
      <section className="mx-auto max-w-7xl px-6 pt-32 pb-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf4f0] border border-[#e8d5ce] text-[#e87a5d] text-xs font-bold mb-4">
              <Compass size={13} />
              <span>Private Vault & Timed Letters</span>
            </div>
            <h1 className="editorial-heading text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-[#3d2c29]">
              Moments kept safe, <br />
              <span className="italic font-normal text-[#e87a5d]">unlocked tomorrow.</span>
            </h1>
            <p className="mt-4 text-base text-[#7c6863] leading-relaxed max-w-xl">
              Seal your memories, personal goals, and anniversary letters with encrypted time-locks.
              Delivered straight to the future when the countdown reaches zero.
            </p>
          </div>

          {/* Quick Action Pill */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="timecapsule-primary flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold shadow-md"
            >
              <Plus size={17} /> Create Time Capsule
            </button>
          </div>
        </div>

        {/* ── Memory Gallery (Horizontal Flow) ── */}
        {capsules.some((c) => c.media_files.length > 0) && (
          <div className="mb-12 rounded-3xl border border-[#e8d5ce] bg-white/70 backdrop-blur-md p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileImage size={18} className="text-[#e87a5d]" />
                <h2 className="editorial-heading text-xl text-[#3d2c29]">Curated Memory Stream</h2>
              </div>
              <span className="text-xs font-semibold text-[#7c6863]">
                {capsules.filter((c) => c.media_files.length > 0).length} attachments
              </span>
            </div>

            <div className="memory-gallery-row">
              {capsules
                .filter((c) => c.media_files.length > 0)
                .map((capsule) => {
                  const isLocked = capsule.status === 'locked'
                  const mediaUrl = capsule.media_files[0]

                  return (
                    <button
                      key={capsule.id}
                      onClick={() => !isLocked && setLightbox(capsule)}
                      disabled={isLocked}
                      className="memory-gallery-thumbnail group relative"
                    >
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt={capsule.title}
                          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            isLocked ? 'blur-md opacity-70' : ''
                          }`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#fdf5f0] text-[#c89da0]">
                          <Sparkles size={24} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <p className="text-[11px] font-semibold text-white truncate">{capsule.title}</p>
                      </div>

                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                          <div className="h-7 w-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-[#8e5c5f]">
                            <Lock size={13} />
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
            </div>
          </div>
        )}

        {/* ── Status Messages ── */}
        {isLoading && (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[#e87a5d] border-t-transparent" />
            <p className="text-sm font-medium text-[#7c6863]">Accessing your private archive...</p>
          </div>
        )}

        {error && (
          <div className="mb-10 rounded-2xl border border-red-200 bg-red-50/90 p-6 text-center text-red-700">
            <p className="font-semibold">Unable to connect to the capsules service.</p>
            <p className="text-xs mt-1 text-red-600">Ensure the backend is running at http://localhost:8001</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && capsules.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#e8d5ce] bg-white/60 p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf4f0] text-[#e87a5d]">
              <Sparkles size={28} />
            </div>
            <h2 className="editorial-heading text-2xl text-[#3d2c29]">Your vault is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#7c6863] leading-relaxed">
              Create your very first time capsule. Write a note to your future self, choose an unlock
              date, and add your favorite photos.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="timecapsule-primary mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            >
              <Plus size={16} /> Create your first capsule
            </button>
          </div>
        )}

        {/* ── Responsive Bento Grid ── */}
        {!isLoading && capsules.length > 0 && (
          <div className="bento-grid">
            {/* Stat: Total Capsules */}
            <div className="bento-card bento-stat p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7c6863]">Total Vault</span>
                <span className="bento-sticker text-xs">archive</span>
              </div>
              <div className="my-auto py-2">
                <p className="text-5xl font-extrabold tracking-tight text-[#3d2c29]">{stats.total}</p>
                <p className="text-xs text-[#7c6863] mt-1 font-medium">memories sealed in time</p>
              </div>
              <div className="h-1.5 w-full bg-[#e8d5ce]/60 rounded-full overflow-hidden">
                <div className="h-full bg-[#e87a5d] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Stat: Locked & Sealed */}
            <div className="bento-card bento-stat-highlight p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ad5c48]">Time-Locked</span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#ad5c48] px-2 py-0.5 rounded-full bg-[#fbeee9]">
                  <Lock size={11} /> Active
                </div>
              </div>
              <div className="my-auto py-2">
                <p className="text-5xl font-extrabold tracking-tight text-[#ad5c48]">{stats.locked}</p>
                <p className="text-xs text-[#7c6863] mt-1 font-medium">waiting for their date</p>
              </div>
              <div className="h-1.5 w-full bg-[#e8d5ce]/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ad5c48] rounded-full transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.locked / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Bento CTA: Create Memory */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bento-card bento-cta p-6 flex flex-col justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase opacity-90">Instant Action</span>
                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={17} />
                </div>
              </div>
              <div className="my-auto">
                <h3 className="editorial-heading text-2xl font-bold leading-tight">Seal a New Memory</h3>
                <p className="text-xs opacity-90 mt-1 font-medium">Attach photos, notes & future date</p>
              </div>
              <span className="text-xs font-semibold underline underline-offset-4 opacity-95">Open creator →</span>
            </button>

            {/* Quote Card */}
            <div className="bento-card p-6 flex flex-col justify-between bg-gradient-to-br from-[#fdf5f0] to-[#f9eae4]">
              <Sparkles size={20} className="text-[#e87a5d]" />
              <p className="script-accent text-2xl text-[#3d2c29] leading-snug my-auto">
                &ldquo;Yesterday is a memory, tomorrow is a secret.&rdquo;
              </p>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7c6863]">TimeCapsule Vault</span>
            </div>

            {/* ── Capsule Grid Cards ── */}
            {capsules.map((capsule, index) => {
              const isLocked = capsule.status === 'locked'
              const isReady = capsule.status === 'ready'

              return (
                <article
                  key={capsule.id}
                  className={`bento-card timecapsule-card p-5 flex flex-col justify-between ${
                    index % 6 === 0 ? 'bento-span-2' : ''
                  }`}
                >
                  <div>
                    {/* Media Thumbnail / Frame */}
                    <div className="capsule-card-media-wrapper aspect-[16/9] w-full mb-4">
                      {capsule.media_files[0] ? (
                        <img
                          src={capsule.media_files[0]}
                          alt={capsule.title}
                          className={isLocked ? 'blur-md' : ''}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#c89da0]">
                          <Sparkles size={30} />
                        </div>
                      )}

                      {/* Status Tag on Media */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`timecapsule-badge ${
                            isLocked
                              ? 'badge-locked'
                              : isReady
                              ? 'badge-ready'
                              : 'badge-opened'
                          }`}
                        >
                          {isLocked ? <Lock size={11} /> : isReady ? <Unlock size={11} /> : <Eye size={11} />}
                          <span className="capitalize">{capsule.status}</span>
                        </span>
                      </div>

                      {/* Photos Count Tag */}
                      {capsule.media_files.length > 0 && (
                        <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm flex items-center gap-1">
                          <FileImage size={11} />
                          <span>{capsule.media_files.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Capsule Header Info */}
                    <h3 className="editorial-heading text-xl text-[#3d2c29] font-bold line-clamp-1">
                      {capsule.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#7c6863]">
                      <Calendar size={13} />
                      <span>Unlock: {formatDate(capsule.target_datetime)}</span>
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-5 pt-3 border-t border-[#e8d5ce]/60 flex items-center justify-between gap-3">
                    {isLocked ? (
                      <div className="timecapsule-countdown flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold">
                        <Clock size={13} />
                        <LiveCountdown target={capsule.target_datetime} />
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/capsule/${capsule.id}`)}
                        className="timecapsule-primary inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold"
                      >
                        <Unlock size={13} /> Open Capsule
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <button
                          onClick={() => navigate(`/edit/${capsule.id}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#7c6863] hover:text-[#3d2c29] hover:bg-[#f5ebe6] rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => removeCapsule(capsule.id)}
                        title="Delete capsule"
                        className="p-1.5 text-[#9e8983] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Modern Create Capsule Modal ── */}
      {isModalOpen && (
        <div className="timecapsule-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={submitCapsule}
            className="timecapsule-modal w-full max-w-lg rounded-3xl p-8 relative overflow-hidden"
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="editorial-kicker text-sm">New Time-Lock</p>
                <h2 className="editorial-heading text-2xl font-bold text-[#3d2c29] mt-0.5">
                  Create a Time Capsule
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-[#7c6863] hover:bg-[#f5ebe6] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7c6863] mb-1.5">
                  Capsule Title *
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Letter to myself on graduation"
                  className="timecapsule-field w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7c6863] mb-1.5">
                  Unlock Date and Time *
                </label>
                <input
                  required
                  type="datetime-local"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  className="timecapsule-field w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7c6863] mb-1.5">
                  Letter / Memory Note
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write whatever you want to remember..."
                  rows={4}
                  className="timecapsule-field w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7c6863] mb-1.5">
                  Attach Media <span className="text-[#9e8983] font-normal">(up to 15 MB)</span>
                </label>
                <label className="timecapsule-dropzone flex cursor-pointer items-center gap-3 rounded-xl p-4 text-sm text-[#7c6863]">
                  <FileImage size={20} className="text-[#e87a5d]" />
                  <span className="truncate">{file ? file.name : 'Select photo, video, or PDF attachment'}</span>
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#7c6863] hover:text-[#3d2c29]"
              >
                Cancel
              </button>
              <button
                disabled={isCreating}
                type="submit"
                className="timecapsule-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {isCreating ? 'Sealing Capsule...' : 'Seal Capsule 🔒'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modern Lightbox Modal ── */}
      {lightbox && (
        <div
          className="timecapsule-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="timecapsule-modal relative max-h-[90vh] max-w-2xl w-full overflow-hidden rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/80 backdrop-blur-sm p-2 text-[#3d2c29] hover:bg-white shadow-sm"
            >
              <X size={18} />
            </button>

            {lightbox.media_files[0] && (
              <div className="max-h-[55vh] overflow-hidden bg-black/5 flex items-center justify-center">
                <img
                  src={lightbox.media_files[0]}
                  alt={lightbox.title}
                  className="max-h-[55vh] w-auto object-contain"
                />
              </div>
            )}

            <div className="p-7">
              <span className="editorial-kicker text-sm">Unlocked Memory</span>
              <h2 className="editorial-heading text-2xl font-bold text-[#3d2c29] mt-1">{lightbox.title}</h2>
              <p className="mt-3 text-sm text-[#7c6863] leading-relaxed whitespace-pre-wrap">
                {lightbox.text || 'No letter was attached to this capsule.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

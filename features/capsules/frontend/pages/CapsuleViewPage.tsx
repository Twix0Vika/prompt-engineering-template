import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, FileText, Image as ImageIcon, Lock, Paperclip, Sparkles, Unlock, X } from 'lucide-react'
import { useGetCapsuleQuery, useOpenCapsuleMutation } from '../api/capsulesApi'
import { useCountdown } from '../hooks/useCountdown'

const MEDIA_BASE = 'http://localhost:8001/media'

function LockScreen({ target, title }: { target: string; title: string }) {
  const navigate = useNavigate()
  const r = useCountdown(target)

  return (
    <div className="timecapsule-shell flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
      {/* Return to Dashboard */}
      <div className="absolute top-8 left-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#e8d5ce] text-xs font-semibold text-[#7c6863] hover:text-[#3d2c29] hover:bg-white shadow-sm transition-all"
        >
          <ArrowLeft size={14} /> Back to Vault
        </button>
      </div>

      {/* Sealed Icon / Ornament */}
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#fbeee9] to-[#fae1d9] border border-[#e8d5ce] shadow-xl text-[#ad5c48]">
          <Lock size={44} className="animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#e8d5ce] text-[#e87a5d] shadow-sm">
          <Sparkles size={16} />
        </div>
      </div>

      <span className="editorial-kicker text-base">Time-Locked Memory</span>
      <h1 className="editorial-heading text-3xl sm:text-5xl font-bold text-[#3d2c29] mt-2 max-w-xl leading-tight">
        {title || 'This capsule is sealed'}
      </h1>
      <p className="mt-3 text-sm text-[#7c6863] max-w-md leading-relaxed">
        The contents, photos, and attached letters remain securely sealed until the countdown reaches zero.
      </p>

      {/* Countdown Card Grid */}
      <div className="mt-10 max-w-md w-full">
        {r ? (
          <div className="grid grid-cols-4 gap-3">
            {[
              { val: r.days, lbl: 'Days' },
              { val: r.hours, lbl: 'Hours' },
              { val: r.minutes, lbl: 'Mins' },
              { val: r.seconds, lbl: 'Secs' },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                className="flex flex-col items-center justify-center rounded-2xl bg-white/90 border border-[#e8d5ce] py-4 shadow-sm"
              >
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#3d2c29] tracking-tight">
                  {String(val).padStart(2, '0')}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e8983] mt-1">
                  {lbl}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/90 border border-emerald-200 p-6 text-emerald-800 font-semibold shadow-sm">
            ✨ The unlock moment has arrived! Refreshing your memory...
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-[#9e8983] font-medium flex items-center gap-1.5">
        <Calendar size={13} />
        Scheduled unlock: {new Date(target).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
    </div>
  )
}

function OpenedView({ capsule }: { capsule: any }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const navigate = useNavigate()

  const images = (capsule.media_files || []).filter((f: string) =>
    /\.(jpe?g|png|gif|webp|svg)$/i.test(f)
  )
  const files = (capsule.media_files || []).filter(
    (f: string) => !/\.(jpe?g|png|gif|webp|svg)$/i.test(f)
  )

  return (
    <div className="timecapsule-shell min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#e8d5ce]/70">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#e8d5ce] text-xs font-semibold text-[#7c6863] hover:text-[#3d2c29] hover:bg-white shadow-sm transition-all"
          >
            <ArrowLeft size={14} /> Back to Archive
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Unlock size={12} /> Unsealed & Ready
          </span>
        </div>

        {/* Hero Title & Date */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-[#fdf4f0] border border-[#e8d5ce] text-[#e87a5d] shadow-sm mb-4">
            <Unlock size={28} />
          </div>
          <span className="editorial-kicker text-sm block">Memory Released</span>
          <h1 className="editorial-heading text-4xl sm:text-5xl font-bold text-[#3d2c29] mt-1 leading-tight">
            {capsule.title}
          </h1>
          <p className="mt-2 text-xs font-medium text-[#7c6863] flex items-center justify-center gap-1.5">
            <Calendar size={13} />
            Originally unlocked on {new Date(capsule.target_datetime).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>

        {/* ── Letter / Note Content ── */}
        <div className="mb-12 rounded-3xl border border-[#e8d5ce] bg-white/90 p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#fbeee9]/60 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ad7772] mb-4">
            <FileText size={16} />
            <span>Letter from the Past</span>
          </div>
          <div className="prose prose-stone max-w-none">
            <p className="text-[#3d2c29] text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-serif">
              {capsule.text || 'No written note was left with this capsule.'}
            </p>
          </div>
        </div>

        {/* ── Photos & Images Section ── */}
        {images.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#e87a5d]" />
                <h2 className="editorial-heading text-2xl font-bold text-[#3d2c29]">Attached Photographs</h2>
              </div>
              <span className="text-xs font-semibold text-[#7c6863]">{images.length} photos</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((filename: string) => {
                const src = `${MEDIA_BASE}/${filename}`
                return (
                  <button
                    key={filename}
                    onClick={() => setLightbox(src)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[#e8d5ce] bg-[#fdf5f0] shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <img
                      src={src}
                      alt="Capsule attachment"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        View Photo
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Additional Files ── */}
        {files.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip size={18} className="text-[#e87a5d]" />
              <h2 className="editorial-heading text-2xl font-bold text-[#3d2c29]">Other Attached Files</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {files.map((filename: string) => (
                <a
                  key={filename}
                  href={`${MEDIA_BASE}/${filename}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/80 border border-[#e8d5ce] hover:border-[#e87a5d] text-[#3d2c29] transition-all shadow-sm group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf4f0] text-[#e87a5d] group-hover:scale-105 transition-transform">
                    <Paperclip size={17} />
                  </div>
                  <span className="text-sm font-semibold truncate flex-1">{filename}</span>
                  <span className="text-xs font-bold text-[#e87a5d]">Download →</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="timecapsule-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="timecapsule-modal relative max-h-[92vh] max-w-4xl w-full overflow-hidden rounded-3xl p-3 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-6 top-6 z-10 rounded-full bg-white/80 p-2.5 text-[#3d2c29] hover:bg-white shadow-md backdrop-blur-sm transition-all"
            >
              <X size={20} />
            </button>
            <div className="flex items-center justify-center max-h-[85vh]">
              <img src={lightbox} alt="Enlarged view" className="max-h-[85vh] w-auto object-contain rounded-2xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function CapsuleViewPage() {
  const { id } = useParams<{ id: string }>()
  const [openCapsule] = useOpenCapsuleMutation()
  const { data: capsule, isLoading, error } = useGetCapsuleQuery(id!)

  if (isLoading) {
    return (
      <div className="timecapsule-shell min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[#e87a5d] border-t-transparent" />
          <p className="text-sm font-medium text-[#7c6863]">Retrieving your capsule...</p>
        </div>
      </div>
    )
  }

  if (error || !capsule) {
    return (
      <div className="timecapsule-shell min-h-screen flex items-center justify-center text-center p-6">
        <div className="max-w-md rounded-3xl bg-white/90 border border-red-200 p-8 shadow-sm">
          <h2 className="editorial-heading text-2xl font-bold text-red-800">Capsule Not Found</h2>
          <p className="mt-2 text-sm text-[#7c6863]">
            This capsule may have been deleted or you do not have permission to view it.
          </p>
        </div>
      </div>
    )
  }

  if (capsule.status === 'locked') {
    return <LockScreen target={capsule.target_datetime} title={capsule.title} />
  }

  if (capsule.status === 'ready' && id) {
    openCapsule(id)
  }

  return <OpenedView capsule={capsule} />
}

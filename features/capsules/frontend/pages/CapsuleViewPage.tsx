import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, FileText, Image as ImageIcon, Lock, Paperclip, Quote, Sparkles, Unlock, X } from 'lucide-react'
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
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#EADFD8] text-xs font-semibold text-[#7e6a65] hover:text-[#3d2c29] hover:bg-white shadow-xs transition-all"
        >
          <ArrowLeft size={14} /> До архіву
        </button>
      </div>

      {/* Sealed Icon / Ornament */}
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#FAF7F2] to-[#FBE8E6] border border-[#EADFD8] shadow-md text-[#8c5346]">
          <Lock size={42} className="animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#EADFD8] text-[#e8a49c] shadow-xs">
          <Sparkles size={15} />
        </div>
      </div>

      <span className="editorial-kicker text-base">Кожна капсула — це діалог із майбутнім</span>
      <h1 className="editorial-heading text-3xl sm:text-5xl font-bold text-[#3d2c29] mt-2 max-w-xl leading-tight">
        {title || 'Ця капсула надійно запечатана'}
      </h1>
      <p className="mt-3 text-sm text-[#7e6a65] max-w-md leading-relaxed">
        Час зберігає твої таємниці недоторканими до слушної миті. Усі особисті листи, світлини та
        прикріплені файли захищені криптографічним замком часу.
      </p>

      {/* Countdown Card Grid */}
      <div className="mt-10 max-w-md w-full">
        {r ? (
          <div className="grid grid-cols-4 gap-3">
            {[
              { val: r.days, lbl: 'Днів' },
              { val: r.hours, lbl: 'Годин' },
              { val: r.minutes, lbl: 'Хвилин' },
              { val: r.seconds, lbl: 'Секунд' },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                className="flex flex-col items-center justify-center rounded-2xl bg-[#FFFDF9] border border-[#EADFD8] py-4 shadow-sm"
              >
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#3d2c29] tracking-tight">
                  {String(val).padStart(2, '0')}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#a4918c] mt-1">
                  {lbl}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#FFFDF9] border border-emerald-200 p-6 text-emerald-800 font-semibold shadow-sm">
            ✨ Призначений час настав! Оновлюємо вашу скарбницю спогадів...
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-[#a4918c] font-medium flex items-center gap-1.5 bg-white/70 px-4 py-2 rounded-full border border-[#EADFD8]">
        <Calendar size={13} className="text-[#e8a49c]" />
        Заплановане відкриття: {new Date(target).toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
    </div>
  )
}

function OpenedView({ capsule }: { capsule: any }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const navigate = useNavigate()

  const images = (capsule.media_files || []).filter((f: string) =>
    /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(f) || f.includes('unsplash.com')
  )
  const files = (capsule.media_files || []).filter(
    (f: string) => !/\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(f) && !f.includes('unsplash.com')
  )

  return (
    <div className="timecapsule-shell min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#EADFD8]">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#EADFD8] text-xs font-semibold text-[#7e6a65] hover:text-[#3d2c29] hover:bg-white shadow-xs transition-all"
          >
            <ArrowLeft size={14} /> До архіву
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Unlock size={12} /> Відкрито
            </span>
            <span className="text-xs text-[#7e6a65] font-medium hidden sm:inline">
              Розблоковано {new Date(capsule.target_datetime).toLocaleDateString('uk-UA', { dateStyle: 'medium' })}
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-8">
          <span className="editorial-kicker text-sm">Скарбниця ожилих спогадів</span>
          <h1 className="editorial-heading text-3xl sm:text-5xl font-bold text-[#3d2c29] mt-1 leading-tight">
            {capsule.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#7e6a65]">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[#e8a49c]" />
              Призначена дата: {new Date(capsule.target_datetime).toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span>•</span>
            <span>Отримувач: {capsule.notify_email}</span>
          </div>
        </div>

        {/* Parchment-Style Letter Container with Philosophical Quote */}
        <div className="rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] p-8 sm:p-12 shadow-sm mb-8 relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EADFD8]/60 text-[#7e6a65]">
            <div className="flex items-center gap-2.5">
              <FileText size={17} className="text-[#e8a49c]" />
              <h2 className="editorial-heading text-xl text-[#3d2c29]">Лист із минулого</h2>
            </div>
            <Quote size={18} className="text-[#e8a49c] opacity-60" />
          </div>

          {capsule.text ? (
            <div className="text-base sm:text-lg text-[#3d2c29] leading-relaxed whitespace-pre-wrap font-normal italic font-serif">
              &ldquo;{capsule.text}&rdquo;
            </div>
          ) : (
            <p className="text-sm text-[#a4918c] italic">Для цієї капсули не було залишено текстового листа.</p>
          )}

          <div className="mt-8 pt-6 border-t border-[#EADFD8]/50 flex items-center justify-between text-xs text-[#a4918c]">
            <span className="script-accent text-sm text-[#8c5346]">«Пам'ять — це єдиний рай, з якого нас неможливо вигнати.»</span>
            <span>— TimeCapsule Vault</span>
          </div>
        </div>

        {/* Photo Gallery Grid (Aesthetic Polaroid-style compact cards) */}
        {images.length > 0 && (
          <div className="rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6 text-[#7e6a65]">
              <div className="flex items-center gap-2.5">
                <ImageIcon size={17} className="text-[#e8a49c]" />
                <h2 className="editorial-heading text-xl text-[#3d2c29]">Збережені світлини ({images.length})</h2>
              </div>
              <span className="text-xs text-[#a4918c]">Натисніть на фото для повного розміру</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img: string, i: number) => {
                const src = img.startsWith('http') ? img : `${MEDIA_BASE}/${img}`
                return (
                  <button
                    key={i}
                    onClick={() => setLightbox(src)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-[#EADFD8] bg-[#FAF7F2] p-1.5 shadow-2xs hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden relative">
                      <img
                        src={src}
                        alt={`Світлина ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Sparkles size={20} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Non-image Attachments */}
        {files.length > 0 && (
          <div className="rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4 text-[#7e6a65]">
              <Paperclip size={17} className="text-[#e8a49c]" />
              <h2 className="editorial-heading text-xl text-[#3d2c29]">Додаткові документи та файли</h2>
            </div>
            <ul className="space-y-2">
              {files.map((f: string, i: number) => {
                const href = f.startsWith('http') ? f : `${MEDIA_BASE}/${f}`
                return (
                  <li key={i}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#8c5346] hover:text-[#3d2c29] bg-[#FAF7F2] hover:bg-[#FBE8E6] px-4 py-2.5 rounded-full border border-[#EADFD8] transition-all"
                    >
                      <Paperclip size={13} />
                      <span className="truncate max-w-sm">{f}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="timecapsule-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-[#FFFDF9] border border-[#EADFD8] p-3 shadow-2xl">
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-[#3d2c29] hover:bg-white shadow-sm border border-[#EADFD8]"
            >
              <X size={18} />
            </button>
            <img src={lightbox} alt="Повний розмір" className="max-h-[85vh] w-auto rounded-2xl object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  )
}

export function CapsuleViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: capsule, isLoading, error } = useGetCapsuleQuery(id!)
  const [openCapsule, { isLoading: opening }] = useOpenCapsuleMutation()

  if (isLoading) {
    return (
      <div className="timecapsule-shell flex items-center justify-center min-h-screen">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#e8a49c] border-t-transparent" />
      </div>
    )
  }

  if (error || !capsule) {
    return (
      <div className="timecapsule-shell flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="editorial-heading text-2xl text-[#3d2c29]">Капсулу не знайдено</h2>
        <p className="text-xs text-[#7e6a65] mt-2">Ця капсула можливо була видалена або стала недоступною.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="timecapsule-primary mt-5 px-5 py-2.5 text-xs font-semibold"
        >
          Повернутися до архіву
        </button>
      </div>
    )
  }

  // NFR-1 Lock Screen check
  if (capsule.status === 'locked') {
    return <LockScreen target={capsule.target_datetime} title={capsule.title} />
  }

  // Ready to unlock interaction
  if (capsule.status === 'ready') {
    return (
      <div className="timecapsule-shell flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
        <div className="absolute top-8 left-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#EADFD8] text-xs font-semibold text-[#7e6a65] hover:text-[#3d2c29] hover:bg-white shadow-xs transition-all"
          >
            <ArrowLeft size={14} /> До архіву
          </button>
        </div>

        <div className="relative mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-50 to-[#FBE8E6] border border-emerald-200 shadow-md text-emerald-700">
            <Unlock size={42} className="animate-bounce" />
          </div>
          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#EADFD8] text-[#e8a49c] shadow-xs">
            <Sparkles size={15} />
          </div>
        </div>

        <span className="editorial-kicker text-base">Призначений час настав</span>
        <h1 className="editorial-heading text-3xl sm:text-5xl font-bold text-[#3d2c29] mt-2 max-w-xl leading-tight">
          {capsule.title} готова до відкриття!
        </h1>
        <p className="mt-3 text-sm text-[#7e6a65] max-w-md leading-relaxed">
          Зворотний відлік дійшов нуля. Зламайте печатку, щоб прочитати збережені листи та переглянути світлини.
        </p>

        <button
          onClick={() => openCapsule(capsule.id)}
          disabled={opening}
          className="timecapsule-primary mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
        >
          <Unlock size={16} />
          {opening ? 'Зламуємо печатку...' : 'Зламати печатку та відкрити спогад'}
        </button>
      </div>
    )
  }

  return <OpenedView capsule={capsule} />
}

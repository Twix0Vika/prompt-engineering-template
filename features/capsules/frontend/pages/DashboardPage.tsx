import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  ArrowUpRight,
  Calendar,
  Clock,
  Edit3,
  Eye,
  FileImage,
  Lock,
  LogOut,
  Plus,
  Quote,
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

const getMediaUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `http://localhost:8001/media/${path}`
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function LiveCountdownBadge({ target }: { target: string }) {
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
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
        <Unlock size={11} /> Готово до відкриття
      </span>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#EADFD8] text-[#8c5346] shadow-xs">
      <Clock size={11} className="text-[#e8a49c]" />
      <span className="font-mono tracking-tight">
        {days > 0 && `${days}д `}
        {String(hours).padStart(2, '0')}г {String(minutes).padStart(2, '0')}хв {String(seconds).padStart(2, '0')}с
      </span>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data: capsules = [], isLoading, error } = useListCapsulesQuery()
  const [deleteCapsule] = useDeleteCapsuleMutation()
  const [createCapsule, { isLoading: isCreating }] = useCreateCapsuleMutation()

  const [activeTab, setActiveTab] = useState<'all' | 'locked' | 'unlocked'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; text?: string | null } | null>(null)
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

  const filteredCapsules = useMemo(() => {
    if (activeTab === 'locked') return capsules.filter((c) => c.status === 'locked')
    if (activeTab === 'unlocked') return capsules.filter((c) => c.status !== 'locked')
    return capsules
  }, [capsules, activeTab])

  // Collect all photos from unlocked/ready capsules for the rich memory stream
  const memoryPhotos = useMemo(() => {
    const items: { url: string; title: string; capsuleId: string; text?: string | null }[] = []
    capsules.forEach((c) => {
      if (c.status !== 'locked' && c.media_files && c.media_files.length > 0) {
        c.media_files.forEach((url) => {
          items.push({
            url,
            title: c.title,
            capsuleId: c.id,
            text: c.text,
          })
        })
      }
    })
    return items
  }, [capsules])

  const submitCapsule = async (event: FormEvent) => {
    event.preventDefault()
    if (!title || !target) return

    try {
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
    } catch (err: any) {
      console.error('Failed to create capsule', err)
      alert(err?.data?.detail || 'Не вдалося створити капсулу. Перевірте, чи дата розблокування у майбутньому.')
    }
  }

  const removeCapsule = async (id: string) => {
    if (confirm('Ви впевнені, що хочете видалити цю капсулу часу? Цю дію неможливо скасувати.')) {
      try {
        await deleteCapsule(id).unwrap()
      } catch (err) {
        console.error('Failed to delete capsule', err)
      }
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <main className="timecapsule-shell min-h-screen pb-28">
      {/* ── Top Navigation Bar (fixed 64px, full-width) ── */}
      <header className="timecapsule-header">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="timecapsule-logo flex h-10 w-10 items-center justify-center rounded-full shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="editorial-heading text-lg font-bold leading-none tracking-tight">TimeCapsule</p>
              <p className="text-[11px] font-medium text-[#7e6a65] mt-0.5">Скарбниця спогадів</p>
            </div>
          </div>

          {/* Section Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-full border border-[#EADFD8]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-[#3d2c29] shadow-xs'
                  : 'text-[#7e6a65] hover:text-[#3d2c29]'
              }`}
            >
              Усі капсули ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('locked')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'locked'
                  ? 'bg-white text-[#3d2c29] shadow-xs'
                  : 'text-[#7e6a65] hover:text-[#3d2c29]'
              }`}
            >
              Запечатані ({stats.locked})
            </button>
            <button
              onClick={() => setActiveTab('unlocked')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'unlocked'
                  ? 'bg-white text-[#3d2c29] shadow-xs'
                  : 'text-[#7e6a65] hover:text-[#3d2c29]'
              }`}
            >
              Відкриті ({stats.ready + stats.opened})
            </button>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5">
            {isDevAuthBypassEnabled && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FBE8E6] text-[#8c5346] border border-[#EADFD8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8a49c] animate-pulse" />
                Dev Mode
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="timecapsule-primary flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold tracking-wide shadow-sm"
            >
              <Plus size={15} /> Нова капсула
            </button>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#7e6a65] hover:text-[#3d2c29] hover:bg-white transition-all border border-transparent hover:border-[#EADFD8]"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section (full-bleed, sits directly below the 64px fixed header) ── */}
      <section className="bg-gradient-to-br from-[#FAF7F2] via-[#FFFDF9] to-[#FBE8E6] pt-16 pb-14 relative overflow-hidden">
        {/* Ambient blush orb */}
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-radial from-[#FBE8E6]/60 to-transparent pointer-events-none blur-3xl -mr-24 -mt-12" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 py-10">
          {/* Category Kicker */}
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-widest text-[#8c5346] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8a49c]" />
            🌐 TimeCapsule · Скарбниця Спогадів · Digital Vault
          </div>

          {/* Giant Playfair Display Headline */}
          <h1 className="editorial-heading text-5xl sm:text-6xl lg:text-7xl text-[#3d2c29] leading-tight max-w-3xl">
            Збережи момент<br />
            <span className="italic font-normal text-[#8c5346]">до того, як він стане спогадом.</span>
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-2xl text-base text-[#7e6a65] leading-relaxed">
            Кожна капсула — це діалог із майбутнім. Запечатай свої найщиріші почуття, університетські миті,
            подорожі та філософію життя із точними криптографічними замками часу.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="timecapsule-primary flex items-center gap-2 px-7 py-3 text-sm font-bold tracking-wide shadow-sm"
            >
              <Plus size={16} /> Створити капсулу часу
            </button>
            <button
              onClick={() => setActiveTab('unlocked')}
              className="px-6 py-3 rounded-full text-sm font-semibold text-[#7e6a65] bg-white/80 hover:bg-white hover:text-[#3d2c29] border border-[#EADFD8] shadow-sm transition-all"
            >
              Переглянути відкриті ({stats.ready + stats.opened})
            </button>
          </div>
        </div>
      </section>

      {/* ── Main Content Container (gallery, bento grid, etc.) ── */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-10">

        {/* ── Curated Memory Preview Row (Rich Horizontal Carousel with Unsplash Photos) ── */}
        {memoryPhotos.length > 0 && (
          <div className="mb-10 rounded-3xl border border-[#EADFD8] bg-[#FFFDF9]/90 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="editorial-heading text-2xl tracking-tight text-[#3d2c29] leading-tight">
                  Галерея збережених миттєвостей
                </h2>
                <p className="mt-1 text-sm text-[#7e6a65]">
                  Справжні кадри, подорожі та живі емоції з відкритих капсул
                </p>
              </div>
              <span className="shrink-0 ml-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c5346] bg-[#FBE8E6] px-3.5 py-1.5 rounded-full border border-[#EADFD8]">
                <FileImage size={12} />
                {memoryPhotos.length} фото
              </span>
            </div>

            <div className="memory-gallery-row">
              {memoryPhotos.map((photo, index) => (
                <button
                  key={`${photo.capsuleId}-${index}`}
                  onClick={() => setSelectedPhoto(photo)}
                  className="memory-gallery-thumbnail group relative rounded-2xl overflow-hidden border border-[#EADFD8] bg-[#FAF7F2] cursor-pointer"
                  title={photo.title}
                >
                  {/* Photo with subtle zoom */}
                  <img
                    src={getMediaUrl(photo.url)}
                    alt={photo.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Dark gradient: always dimly visible, brightens fully on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Text overlay — sits above the gradient */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-semibold text-white drop-shadow-sm truncate leading-snug">
                      {photo.title}
                    </p>
                    <span className="text-xs text-stone-300 font-medium mt-0.5 block tracking-wide">
                      Натисніть для перегляду
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Status Messages ── */}
        {isLoading && (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[#e8a49c] border-t-transparent" />
            <p className="text-sm font-medium text-[#7e6a65]">Відкриваємо вашу особисту скарбницю...</p>
          </div>
        )}

        {error && (
          <div className="mb-10 rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-center text-rose-800 shadow-sm">
            <p className="font-semibold text-sm">Не вдалося з'єднатися із сервером капсул.</p>
            <p className="text-xs mt-1 text-rose-600">Переконайтеся, що backend працює за адресою http://localhost:8001</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !error && filteredCapsules.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#EADFD8] bg-[#FFFDF9] p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBE8E6] text-[#8c5346]">
              <Sparkles size={28} />
            </div>
            <h2 className="editorial-heading text-2xl text-[#3d2c29]">У цій категорії поки порожньо</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#7e6a65] leading-relaxed">
              Створіть нову капсулу часу: запишіть важливі думки, оберіть дату у майбутньому та додайте
              улюблені атмосферні світлини.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="timecapsule-primary mt-6 inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <Plus size={16} /> Створити капсулу
            </button>
          </div>
        )}

        {/* ── Responsive Bento Grid Layout with Capsules & Philosophical Quote Cards ── */}
        {!isLoading && filteredCapsules.length > 0 && (
          <div className="bento-grid">
            {/* Stat Card 1: Total Vault */}
            <div className="bento-card bento-stat p-6 flex flex-col justify-between rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e6a65]">Загальний архів</span>
                <span className="bento-sticker text-xs">спогади</span>
              </div>
              <div className="my-auto py-3">
                <p className="text-5xl font-extrabold tracking-tight text-[#3d2c29]">{stats.total}</p>
                <p className="text-xs text-[#7e6a65] mt-1 font-medium">капсул надійно збережено</p>
              </div>
              <div className="h-1.5 w-full bg-[#EADFD8]/60 rounded-full overflow-hidden">
                <div className="h-full bg-[#e8a49c] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Stat Card 2: Time-Locked */}
            <div className="bento-card bento-stat-highlight p-6 flex flex-col justify-between rounded-3xl border border-[#EADFD8] bg-gradient-to-br from-[#FFFDF9] to-[#FBE8E6] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c5346]">Запечатано в часі</span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#8c5346] px-2.5 py-0.5 rounded-full bg-white border border-[#EADFD8] shadow-2xs">
                  <Lock size={10} /> Активні
                </div>
              </div>
              <div className="my-auto py-3">
                <p className="text-5xl font-extrabold tracking-tight text-[#8c5346]">{stats.locked}</p>
                <p className="text-xs text-[#7e6a65] mt-1 font-medium">очікують призначеного дня</p>
              </div>
              <div className="h-1.5 w-full bg-[#EADFD8]/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8c5346] rounded-full transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.locked / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stat Card 3: Ready & Opened */}
            <div className="bento-card p-6 flex flex-col justify-between rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e6a65]">Відкрито</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Unlock size={10} /> Доступні
                </span>
              </div>
              <div className="my-auto py-3">
                <p className="text-5xl font-extrabold tracking-tight text-[#3d2c29]">{stats.ready + stats.opened}</p>
                <p className="text-xs text-[#7e6a65] mt-1 font-medium">готових до читання та перегляду</p>
              </div>
              <div className="h-1.5 w-full bg-[#EADFD8]/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${stats.total > 0 ? ((stats.ready + stats.opened) / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Bento Quick Action: Create New Memory */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bento-card bento-cta p-6 flex flex-col justify-between text-left group cursor-pointer rounded-3xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-95">Швидка дія</span>
                <div className="h-8 w-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={17} />
                </div>
              </div>
              <div className="my-auto py-2">
                <h3 className="editorial-heading text-2xl font-bold leading-tight text-white">Запечатати новий спогад</h3>
                <p className="text-xs opacity-90 mt-1 font-medium text-white/90">Лист, світлини та майбутня дата</p>
              </div>
              <span className="text-xs font-semibold underline underline-offset-4 text-white">Відкрити форму →</span>
            </button>

            {/* ── Philosophical Quote Card 1 (Caveat Script & Playfair Display) ── */}
            <div className="bento-card p-6 flex flex-col justify-between rounded-3xl border border-[#EADFD8] bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#FBE8E6] shadow-sm relative overflow-hidden bento-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="editorial-kicker text-sm">Філософія пам'яті</span>
                <Quote size={20} className="text-[#e8a49c] opacity-60" />
              </div>
              <blockquote className="my-auto py-2">
                <p className="editorial-heading text-xl sm:text-2xl text-[#3d2c29] italic leading-relaxed">
                  «Пам'ять — це єдиний рай, з якого нас неможливо вигнати. Кожен запечатаний рядок оживе знову.»
                </p>
              </blockquote>
              <div className="pt-3 border-t border-[#EADFD8]/60 flex items-center justify-between text-xs text-[#7e6a65]">
                <span className="script-accent text-base text-[#8c5346]">TimeCapsule • Діалог із майбутнім</span>
                <span className="font-medium">— Жан Поль</span>
              </div>
            </div>

            {/* ── Dynamic Capsule Bento Cards ── */}
            {filteredCapsules.map((capsule, index) => {
              const isLocked = capsule.status === 'locked'
              const isReady = capsule.status === 'ready'
              const isOpened = capsule.status === 'opened'
              const isSpan2 = (index + 1) % 4 === 0

              return (
                <article
                  key={capsule.id}
                  className={`bento-card timecapsule-card rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] p-5 flex flex-col justify-between shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
                    isSpan2 ? 'bento-span-2' : ''
                  }`}
                >
                  <div>
                    {/* Visual Media Header: Multi-photo preview or main image frame */}
                    <div className="capsule-card-media-wrapper aspect-[16/9] w-full rounded-2xl overflow-hidden mb-4 relative bg-[#FAF7F2] border border-[#EADFD8]/60">
                      {capsule.media_files.length > 0 ? (
                        <div className="relative w-full h-full">
                          <img
                            src={getMediaUrl(capsule.media_files[0])}
                            alt={capsule.title}
                            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04] ${
                              isLocked ? 'blur-md opacity-80' : ''
                            }`}
                          />
                          {/* Multi-photo mini gallery inset for opened capsules */}
                          {!isLocked && capsule.media_files.length > 1 && (
                            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-md rounded-xl">
                              {capsule.media_files.slice(0, 3).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={getMediaUrl(img)}
                                  alt={`Thumb ${idx + 1}`}
                                  className="h-7 w-7 rounded-lg object-cover border border-white/60 shadow-xs"
                                />
                              ))}
                              {capsule.media_files.length > 3 && (
                                <span className="text-[10px] font-bold text-white px-1.5">
                                  +{capsule.media_files.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#a4918c] bg-gradient-to-br from-[#FAF7F2] to-[#FBE8E6]">
                          <Sparkles size={28} />
                        </div>
                      )}

                      {/* Status Tag on Media */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`timecapsule-badge rounded-full px-3 py-1 text-xs font-semibold ${
                            isLocked
                              ? 'badge-locked'
                              : isReady
                              ? 'badge-ready'
                              : 'badge-opened'
                          }`}
                        >
                          {isLocked ? <Lock size={11} /> : isReady ? <Unlock size={11} /> : <Eye size={11} />}
                          <span className="capitalize">
                            {isLocked ? 'Запечатано' : isReady ? 'Готово' : 'Відкрито'}
                          </span>
                        </span>
                      </div>

                      {/* Total Photos Badge */}
                      {capsule.media_files.length > 0 && (
                        <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm flex items-center gap-1">
                          <FileImage size={11} />
                          <span>{capsule.media_files.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Capsule Meta */}
                    <h3 className="editorial-heading text-xl text-[#3d2c29] font-bold line-clamp-1">
                      {capsule.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#7e6a65]">
                      <Calendar size={13} className="text-[#e8a49c]" />
                      <span>{isLocked ? 'Розблокування:' : 'Дата:'} {formatDate(capsule.target_datetime)}</span>
                    </p>

                    {/* Letter Preview for Unlocked Capsules */}
                    {!isLocked && capsule.text && (
                      <p className="mt-2 text-xs text-[#7e6a65] line-clamp-2 italic leading-relaxed">
                        &ldquo;{capsule.text}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions & Live Countdown */}
                  <div className="mt-5 pt-3.5 border-t border-[#EADFD8]/60 flex items-center justify-between gap-2">
                    {isLocked ? (
                      <LiveCountdownBadge target={capsule.target_datetime} />
                    ) : (
                      <button
                        onClick={() => navigate(`/capsule/${capsule.id}`)}
                        className="timecapsule-primary inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold shadow-xs"
                      >
                        <Unlock size={13} /> {isOpened ? 'Читати спогад' : 'Відкрити'}
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      {isLocked && (
                        <button
                          onClick={() => navigate(`/edit/${capsule.id}`)}
                          title="Редагувати капсулу"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#7e6a65] hover:text-[#3d2c29] hover:bg-[#FAF7F2] rounded-full border border-transparent hover:border-[#EADFD8] transition-all"
                        >
                          <Edit3 size={12} /> Редагувати
                        </button>
                      )}
                      <button
                        onClick={() => removeCapsule(capsule.id)}
                        title="Видалити капсулу"
                        className="p-1.5 text-[#a4918c] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}

            {/* ── Philosophical Quote Card 2 (Inspirational Reflection) ── */}
            <div className="bento-card p-6 flex flex-col justify-between rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e6a65]">Роздуми</span>
                <span className="bento-sticker text-xs">цінність</span>
              </div>
              <blockquote className="my-auto py-2">
                <p className="script-accent text-2xl text-[#8c5346] leading-snug">
                  «Майбутнє належить тим, хто пам'ятає красу минулого і сміливо дивиться вперед.»
                </p>
              </blockquote>
              <p className="text-[11px] text-[#a4918c] font-medium pt-2 border-t border-[#EADFD8]/50">
                Запечатано з любов'ю у TimeCapsule
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Modern Create Capsule Modal ── */}
      {isModalOpen && (
        <div className="timecapsule-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={submitCapsule}
            className="timecapsule-modal w-full max-w-lg rounded-3xl p-8 relative overflow-hidden bg-[#FFFDF9] border border-[#EADFD8] shadow-xl"
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="editorial-kicker text-sm">Нова капсула часу</span>
                <h2 className="editorial-heading text-2xl font-bold text-[#3d2c29] mt-0.5">
                  Створити капсулу
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-[#7e6a65] hover:bg-[#FAF7F2] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5">
                  Назва капсули *
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="напр., Подорож до Карпат або Лист собі"
                  className="timecapsule-field w-full rounded-2xl px-4 py-2.5 text-sm outline-none border border-[#EADFD8] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5">
                  Дата та час розблокування *
                </label>
                <input
                  required
                  type="datetime-local"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  className="timecapsule-field w-full rounded-2xl px-4 py-2.5 text-sm outline-none border border-[#EADFD8] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5">
                  Лист / Текст спогаду
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Напишіть усе, що хочете передати собі у майбутнє..."
                  rows={4}
                  className="timecapsule-field w-full resize-none rounded-2xl px-4 py-2.5 text-sm outline-none border border-[#EADFD8] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e6a65] mb-1.5">
                  Додати медіа <span className="text-[#a4918c] font-normal lowercase">(до 15 МБ)</span>
                </label>
                <label className="timecapsule-dropzone flex cursor-pointer items-center gap-3 rounded-2xl p-4 text-sm text-[#7e6a65] bg-[#FBE8E6]/40 border border-dashed border-[#EADFD8]">
                  <FileImage size={20} className="text-[#e8a49c]" />
                  <span className="truncate">{file ? file.name : 'Обрати фотографії чи документи'}</span>
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
                className="px-5 py-2.5 text-xs font-semibold text-[#7e6a65] hover:text-[#3d2c29] rounded-full"
              >
                Скасувати
              </button>
              <button
                disabled={isCreating}
                type="submit"
                className="timecapsule-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-sm"
              >
                {isCreating ? 'Запечатування...' : 'Запечатати 🔒'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modern Photo Lightbox Modal ── */}
      {selectedPhoto && (
        <div
          className="timecapsule-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="timecapsule-modal relative max-h-[90vh] max-w-2xl w-full overflow-hidden rounded-3xl bg-[#FFFDF9] border border-[#EADFD8] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 backdrop-blur-sm p-2 text-[#3d2c29] hover:bg-white shadow-sm border border-[#EADFD8]"
            >
              <X size={18} />
            </button>

            <div className="max-h-[55vh] overflow-hidden bg-[#FAF7F2] flex items-center justify-center">
              <img
                src={getMediaUrl(selectedPhoto.url)}
                alt={selectedPhoto.title}
                className="max-h-[55vh] w-auto object-contain rounded-t-2xl"
              />
            </div>

            <div className="p-7">
              <span className="editorial-kicker text-sm">Збережений момент</span>
              <h2 className="editorial-heading text-2xl font-bold text-[#3d2c29] mt-1">{selectedPhoto.title}</h2>
              {selectedPhoto.text && (
                <p className="mt-3 text-sm text-[#7e6a65] leading-relaxed whitespace-pre-wrap italic">
                  &ldquo;{selectedPhoto.text}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

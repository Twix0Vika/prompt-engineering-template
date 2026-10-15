import { Calendar, Clock, Edit3, Eye, Lock, Trash2, Unlock } from 'lucide-react'
import type { Capsule } from '../api/types'
import { useCountdown } from '../hooks/useCountdown'

interface Props {
  capsule: Capsule
  onDelete: () => void
  onEdit: () => void
  onView: () => void
}

function CountdownBadge({ target }: { target: string }) {
  const r = useCountdown(target)
  if (!r) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
        <Unlock size={11} /> Готово до відкриття
      </span>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#EADFD8] text-[#8c5346] shadow-sm">
      <Clock size={11} className="text-[#e8a49c]" />
      <span className="font-mono">
        {r.days > 0 && `${r.days}д `}
        {String(r.hours).padStart(2, '0')}г {String(r.minutes).padStart(2, '0')}хв {String(r.seconds).padStart(2, '0')}с
      </span>
    </div>
  )
}

export function CapsuleCard({ capsule, onDelete, onEdit, onView }: Props) {
  const isLocked = capsule.status === 'locked'
  const isReady = capsule.status === 'ready'
  const isOpened = capsule.status === 'opened'

  return (
    <div className="timecapsule-card rounded-3xl border border-[#EADFD8] bg-[#FFFDF9] p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
      <div>
        {/* Status & Date */}
        <div className="flex items-center justify-between mb-3.5">
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
            <span>
              {isLocked ? 'Запечатано' : isReady ? 'Готово' : 'Відкрито'}
            </span>
          </span>

          <span className="text-xs text-[#7e6a65] flex items-center gap-1.5 font-medium">
            <Calendar size={12} className="text-[#e8a49c]" />
            {new Date(capsule.target_datetime).toLocaleDateString('uk-UA', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Title in Playfair Display */}
        <h3 className="editorial-heading text-xl text-[#3d2c29] font-bold line-clamp-1">{capsule.title}</h3>

        {/* Live Countdown Badge */}
        {isLocked && (
          <div className="mt-3.5">
            <CountdownBadge target={capsule.target_datetime} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-[#EADFD8]/60">
        {!isLocked ? (
          <button
            onClick={onView}
            className="timecapsule-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full shadow-xs"
          >
            <Unlock size={13} /> {isOpened ? 'Читати спогад' : 'Відкрити'}
          </button>
        ) : (
          <div className="text-xs text-[#a4918c] font-medium italic flex items-center gap-1">
            <Lock size={11} /> Запечатано до призначеного дня
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {isLocked && (
            <button
              onClick={onEdit}
              title="Редагувати капсулу"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#7e6a65] hover:text-[#3d2c29] hover:bg-[#FAF7F2] rounded-full border border-transparent hover:border-[#EADFD8] transition-all"
            >
              <Edit3 size={12} /> Редагувати
            </button>
          )}
          <button
            onClick={onDelete}
            title="Видалити капсулу"
            className="p-1.5 text-[#a4918c] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

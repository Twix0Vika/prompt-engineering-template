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
  if (!r) return <span className="text-emerald-700 text-xs font-semibold">Ready to unlock</span>

  return (
    <div className="timecapsule-countdown inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
      <Clock size={12} />
      <span className="font-mono">
        {r.days > 0 && `${r.days}d `}
        {String(r.hours).padStart(2, '0')}h {String(r.minutes).padStart(2, '0')}m {String(r.seconds).padStart(2, '0')}s
      </span>
    </div>
  )
}

export function CapsuleCard({ capsule, onDelete, onEdit, onView }: Props) {
  const isLocked = capsule.status === 'locked'
  const isReady = capsule.status === 'ready'

  return (
    <div className="timecapsule-card rounded-2xl border border-[#e8d5ce] bg-white/85 backdrop-blur-md p-5 flex flex-col justify-between hover:shadow-md transition-all">
      <div>
        {/* Status badge */}
        <div className="flex items-center justify-between mb-3">
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

          <span className="text-xs text-[#7c6863] flex items-center gap-1 font-medium">
            <Calendar size={12} />
            {new Date(capsule.target_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h3 className="editorial-heading text-xl text-[#3d2c29] font-bold line-clamp-1">{capsule.title}</h3>

        {/* Countdown */}
        {isLocked && (
          <div className="mt-3">
            <CountdownBadge target={capsule.target_datetime} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[#e8d5ce]/60">
        {!isLocked ? (
          <button
            onClick={onView}
            className="timecapsule-primary inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold"
          >
            <Unlock size={13} /> View Memory
          </button>
        ) : (
          <div className="text-xs text-[#9e8983] font-medium italic">Sealed until date</div>
        )}

        <div className="flex items-center gap-2">
          {isLocked && (
            <button
              onClick={onEdit}
              title="Edit capsule"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#7c6863] hover:text-[#3d2c29] hover:bg-[#f5ebe6] rounded-lg transition-colors"
            >
              <Edit3 size={13} /> Edit
            </button>
          )}
          <button
            onClick={onDelete}
            title="Delete capsule"
            className="p-1.5 text-[#9e8983] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

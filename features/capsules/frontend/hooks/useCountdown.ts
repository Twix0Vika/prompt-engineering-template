import { useEffect, useState } from 'react'

export function useCountdown(targetDatetime: string) {
  const calculateRemaining = () => {
    const diff = new Date(targetDatetime).getTime() - Date.now()
    if (diff <= 0) return null
    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return { days, hours, minutes, seconds }
  }

  const [remaining, setRemaining] = useState(calculateRemaining)

  useEffect(() => {
    const id = setInterval(() => {
      const r = calculateRemaining()
      setRemaining(r)
      if (!r) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [targetDatetime])

  return remaining
}


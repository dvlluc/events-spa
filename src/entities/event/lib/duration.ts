import { DURATION_FORMAT, TIME } from '../config/constants'

export function calcDurationMinutes(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  return Math.round((end - start) / TIME.MILLISECONDS_PER_MINUTE)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / TIME.MINUTES_PER_HOUR)
  const rest = minutes % TIME.MINUTES_PER_HOUR
  const hour = DURATION_FORMAT.HOUR_LABEL
  const minute = DURATION_FORMAT.MINUTE_LABEL

  if (hours === 0) return `${rest} ${minute}`
  if (rest === 0) return `${hours} ${hour}`
  return `${hours} ${hour} ${rest} ${minute}`
}

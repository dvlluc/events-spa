import { DATE_FORMAT, TIME } from '../config/constants'

export function isoToLocalInput(iso: string): string {
  const date = new Date(iso)
  const asUtc = new Date(date.getTime() - date.getTimezoneOffset() * TIME.MILLISECONDS_PER_MINUTE)
  return asUtc.toISOString().slice(0, DATE_FORMAT.DATETIME_LOCAL_LENGTH)
}

export function localInputToIso(localInput: string): string {
  return new Date(localInput).toISOString()
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(DATE_FORMAT.LOCALE, DATE_FORMAT.OPTIONS).format(new Date(iso))
}

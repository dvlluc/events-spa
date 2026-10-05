import { DATE_FORMAT, TIME } from '../config/constants'

export function isoToLocalInput(iso: string): string {
  const date = new Date(iso)
  const asUtc = new Date(date.getTime() - date.getTimezoneOffset() * TIME.MILLISECONDS_PER_MINUTE)
  return asUtc.toISOString().slice(0, DATE_FORMAT.DATETIME_LOCAL_LENGTH)
}

export function localInputToIso(localInput: string): string {
  return new Date(localInput).toISOString()
}

let dateTimeFormatter: Intl.DateTimeFormat | undefined

export function formatDateTime(iso: string): string {
  dateTimeFormatter ??= new Intl.DateTimeFormat(DATE_FORMAT.LOCALE, DATE_FORMAT.OPTIONS)
  return dateTimeFormatter.format(new Date(iso))
}

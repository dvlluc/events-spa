import { VIRTUALIZATION } from '../config/constants'

export function shouldVirtualize(count: number): boolean {
  return count > VIRTUALIZATION.THRESHOLD
}

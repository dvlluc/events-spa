import type { EventItem } from '@/entities/event'
import { useModal } from '@/shared/lib'

type EventModalState = { isOpen: boolean; event: EventItem | null }

export function useEventModals() {
  const create = useModal({ isOpen: false })
  const edit = useModal<EventModalState>({ isOpen: false, event: null })
  const remove = useModal<EventModalState>({ isOpen: false, event: null })

  return { create, edit, remove }
}

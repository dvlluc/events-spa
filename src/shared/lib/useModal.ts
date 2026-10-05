import { reactive } from 'vue'

export type GlobalModalState = {
  isOpen: boolean
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
}

/**
 * Собирает state из source: ключи source записываются, отсутствующие в source
 * удаляются — иначе флаги прошлого открытия переживут reset/open.
 */
function syncState(state: object, source: object): void {
  for (const key of Object.keys(state)) {
    if (!(key in source)) Reflect.deleteProperty(state, key)
  }
  Object.assign(state, source)
}

export function useModal<T extends GlobalModalState>(initialState: T) {
  const state = reactive({ ...initialState })
  const initial: T = { ...initialState }

  function open(payload?: Partial<T>): void {
    syncState(state, { ...initial, ...payload, isOpen: true })
  }

  function close(): void {
    state.isOpen = false
  }

  function setLoading(loading: boolean): void {
    state.isLoading = loading
  }

  function setSuccess(): void {
    state.isSuccess = true
  }

  function setError(): void {
    state.isError = true
  }

  function reset(): void {
    syncState(state, initial)
  }

  return {
    state,
    open,
    close,
    setLoading,
    setSuccess,
    setError,
    reset,
  }
}

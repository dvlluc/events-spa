import { reactive } from 'vue'

export type GlobalModalState = {
  isOpen: boolean
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
}

export function useModal<T extends GlobalModalState>(initialState: T) {
  const state = reactive({ ...initialState })
  const initialStateCopy = { ...initialState }

  function open(payload?: Partial<T>) {
    Object.assign(state, initialStateCopy, payload, { isOpen: true })
  }

  function close() {
    state.isOpen = false
  }

  function setSuccess() {
    state.isSuccess = true
  }

  function setError() {
    state.isError = true
  }

  function setLoading(loading: boolean) {
    state.isLoading = loading
  }

  function reset() {
    Object.assign(state, initialStateCopy)
  }

  return {
    state,
    open,
    close,
    setSuccess,
    setError,
    setLoading,
    reset,
  }
}

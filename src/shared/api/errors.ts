import { HTTP_MESSAGES } from '@/shared/config'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string = HTTP_MESSAGES.API_ERROR(status)) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export class NetworkError extends Error {
  constructor(message: string = HTTP_MESSAGES.NETWORK, options?: ErrorOptions) {
    super(message, options)
    this.name = 'NetworkError'
  }
}

export class ContractError extends Error {
  constructor(message: string = HTTP_MESSAGES.CONTRACT, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ContractError'
  }
}

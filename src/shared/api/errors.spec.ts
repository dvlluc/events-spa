import { expect, test } from 'vitest'

import { HTTP_MESSAGES } from '@/shared/config'

import { ApiError, ContractError, NetworkError } from './errors'

test('ApiError хранит статус и подставляет статус в сообщение', () => {
  const error = new ApiError(404)

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('ApiError')
  expect(error.status).toBe(404)
  expect(error.message).toBe(HTTP_MESSAGES.API_ERROR(404))
})

test('NetworkError по умолчанию несёт сетевое сообщение и причину', () => {
  const cause = new TypeError('fetch failed')
  const error = new NetworkError(HTTP_MESSAGES.NETWORK, { cause })

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('NetworkError')
  expect(error.message).toBe(HTTP_MESSAGES.NETWORK)
  expect(error.cause).toBe(cause)
})

test('ContractError по умолчанию несёт сообщение контракта', () => {
  const error = new ContractError()

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('ContractError')
  expect(error.message).toBe(HTTP_MESSAGES.CONTRACT)
})

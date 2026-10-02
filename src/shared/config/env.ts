import { z } from 'zod'

import { ENV_MESSAGES } from './messages'

const envSchema = z.object({
  VITE_API_BASE_URL: z.url({
    protocol: /^https?$/,
    error: ENV_MESSAGES.API_BASE_URL_INVALID,
  }),
})

const result = envSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
})

if (!result.success) {
  const details = result.error.issues.map((issue) => `- ${issue.message}`).join('\n')
  throw new Error(`${ENV_MESSAGES.INVALID}\n${details}\n${ENV_MESSAGES.HINT}`)
}

export const env = result.data

import { VueQueryPlugin, type QueryClient } from '@tanstack/vue-query'
import { createPinia, type Pinia } from 'pinia'
import { createApp, defineComponent, h, type Plugin } from 'vue'

import { createQueryClient, type QueryClientOverrides } from '@/app/providers'

export type TestContext = {
  queryClient: QueryClient
  pinia: Pinia
  plugins: Plugin[]
}

export type ComposableHarness<T> = TestContext & {
  value: T
  unmount: () => void
}

export function createTestContext(overrides: QueryClientOverrides = {}): TestContext {
  const queryClient = createQueryClient({ gcTime: 0, ...overrides })
  const pinia = createPinia()

  return {
    queryClient,
    pinia,
    plugins: [pinia, (app) => app.use(VueQueryPlugin, { queryClient })],
  }
}

export function mountComposable<T>(
  composable: () => T,
  context: TestContext = createTestContext(),
): ComposableHarness<T> {
  let value!: T

  const Root = defineComponent({
    setup() {
      value = composable()
      return () => h('div')
    },
  })

  const app = createApp(Root)
  for (const plugin of context.plugins) app.use(plugin)

  const host = document.createElement('div')
  document.body.appendChild(host)
  app.mount(host)

  return {
    ...context,
    get value(): T {
      return value
    },
    unmount(): void {
      app.unmount()
      host.remove()
    },
  }
}

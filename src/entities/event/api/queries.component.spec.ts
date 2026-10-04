import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'
import { defineComponent, h } from 'vue'

import { createTestContext } from '@mocks/test-utils'

import { useEventsListQuery } from './queries'

const ListProbe = defineComponent({
  setup() {
    const query = useEventsListQuery({ page: 1, limit: 10, sortBy: 'id', order: 'asc' }, {})
    return () =>
      h(
        'div',
        { 'data-testid': 'status' },
        query.data.value ? `count:${query.data.value.length}` : 'loading',
      )
  },
})

test('компонент получает список через QueryClient из createTestContext', async () => {
  const { plugins } = createTestContext()
  const screen = await render(ListProbe, { global: { plugins } })

  await expect.element(screen.getByTestId('status')).toHaveTextContent('count:10')
})

import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'

import EventsPage from './EventsPage.vue'

test('страница событий рендерится в браузере', async () => {
  const screen = await render(EventsPage)

  await expect.element(screen.container.firstElementChild as HTMLElement).toBeInTheDocument()
})

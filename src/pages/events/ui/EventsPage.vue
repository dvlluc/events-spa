<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-end">
      <button type="button" data-variant="primary">{{ LIST_MESSAGES.CREATE }}</button>
    </div>

    <StateMessage v-if="isLoading" kind="loading" />
    <StateMessage v-else-if="error" kind="error" @retry="retry" />
    <StateMessage v-else-if="items.length === 0" kind="empty" />
    <template v-else>
      <EventsList :items="items" :is-virtualized="isVirtualized" />
      <Pager
        :page="page"
        :page-size="pageSize"
        :has-next="hasNext"
        @prev="store.setPage(store.page - 1)"
        @next="store.setPage(store.page + 1)"
        @go="store.setPage"
        @page-size="store.setPageSize"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { StateMessage } from '@/shared/ui'

import { LIST_MESSAGES } from '../config/messages'
import { useEventsList } from '../model/useEventsList'
import { useListStore } from '../model/listStore'
import EventsList from './EventsList.vue'
import Pager from './Pager.vue'

const store = useListStore()
const { items, isLoading, error, retry, page, pageSize, hasNext, isVirtualized } = useEventsList()
</script>

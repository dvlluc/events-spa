<script setup lang="ts">
import { EventDeleteModal } from '@/features/event-delete'
import { EventFormModal } from '@/features/event-form'
import { StateMessage } from '@/shared/ui'

import { LIST_MESSAGES } from '../config/messages'
import { useEventsList } from '../model/useEventsList'
import { useEventModals } from '../model/useEventModals'
import { useListStore } from '../model/listStore'
import EventsList from './EventsList.vue'
import Pager from './Pager.vue'

const store = useListStore()
const { items, isLoading, error, retry, page, pageSize, hasNext, isVirtualized } = useEventsList()
const { create, edit, remove } = useEventModals()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-end">
      <button type="button" data-variant="primary" @click="create.open()">
        {{ LIST_MESSAGES.CREATE }}
      </button>
    </div>

    <StateMessage v-if="isLoading" kind="loading" />
    <StateMessage v-else-if="error" kind="error" @retry="retry" />
    <StateMessage v-else-if="items.length === 0" kind="empty" />
    <template v-else>
      <EventsList
        :items="items"
        :is-virtualized="isVirtualized"
        @edit="edit.open({ event: $event })"
        @delete="remove.open({ event: $event })"
      />
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

    <EventFormModal v-if="create.state.isOpen" mode="create" @close="create.close" />
    <EventFormModal
      v-if="edit.state.isOpen && edit.state.event"
      mode="edit"
      :event="edit.state.event"
      @close="edit.close"
    />
    <EventDeleteModal
      v-if="remove.state.isOpen && remove.state.event"
      :event="remove.state.event"
      @close="remove.close"
    />
  </div>
</template>

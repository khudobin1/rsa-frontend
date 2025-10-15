<script setup lang="ts">
import type { THistoryItem } from '@/types'
import HistoryItem from './HistoryItem.vue'

interface HistoryProps {
  items: THistoryItem[]
  mode: 'encrypt' | 'decrypt'
}

const props = defineProps<HistoryProps>()
</script>

<template>
  <div
    :class="props.mode === 'decrypt' ? 'max-h-[230px]' : ''"
    class="flex flex-col gap-2 max-h-76 overflow-auto"
  >
    <h1 class="text-xl font-semibold">
      {{ props.mode === 'encrypt' ? 'История зашифрований' : 'История расшифрований' }}
    </h1>
    <div v-for="item in props.items" :key="item.cipher">
      <HistoryItem :item="item" :mode="props.mode" />
    </div>
  </div>
</template>

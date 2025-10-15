<script setup lang="ts">
import type { THistoryItem } from '@/types'
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import { Check, Copy, Trash } from 'lucide-vue-next'

interface HistoryDecryptItemProps {
  item: THistoryItem
}

const props = defineProps<HistoryDecryptItemProps>()
const emit = defineEmits<{
  (e: 'copy', item: THistoryItem): void
  (e: 'delete', item: THistoryItem): void
}>()
</script>

<template>
  <Item variant="outline">
    <ItemContent>
      <ItemTitle class="text-ellipsis flex flex-col gap-1 items-start"
        ><span class="font-mono text-base">{{ props.item.text }}</span>
      </ItemTitle>
      <ItemDescription class=""
        >{{ props.item.cipher }} •
        {{ new Date(props.item.timestamp).toLocaleString() }}</ItemDescription
      >
    </ItemContent>
    <ItemActions>
      <Button variant="outline" size="sm" @click="emit('copy', item)" class="cursor-pointer">
        <span v-if="item.copied" class="flex items-center gap-1"><Check /></span>
        <span v-else class="flex items-center gap-1"><Copy /></span>
      </Button>
      <Button
        variant="destructive"
        size="sm"
        class="border border-red-500/40 cursor-pointer"
        @click="emit('delete', item)"
      >
        <Trash />
      </Button>
    </ItemActions>
  </Item>
</template>

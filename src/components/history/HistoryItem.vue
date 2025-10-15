<script setup lang="ts">
import { inject } from 'vue'
import type { THistoryItem } from '@/types'
import { useCopy } from '@/composables/useCopy'

import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import { Check, Copy, Trash } from 'lucide-vue-next'

interface Props {
  item: THistoryItem
  mode: 'encrypt' | 'decrypt'
}

const props = defineProps<Props>()

const { handleCopy } = useCopy()
const handleDelete = inject<(item: THistoryItem) => void>('deleteItem')
console.info('Режим', props.mode)
</script>

<template>
  <Item variant="outline">
    <ItemContent>
      <ItemTitle class="text-ellipsis flex flex-col gap-1 items-start">
        <span class="font-mono text-base">
          {{ props.mode === 'encrypt' ? props.item.cipher : props.item.text }}
        </span>

        <template v-if="props.mode === 'encrypt'">
          <dl class="flex gap-2 text-foreground/80 text-sm">
            <div class="flex items-center gap-2">
              <dt class="font-semibold">Параметр n:</dt>
              <dd class="font-mono">{{ props.item.n }}</dd>
            </div>
            <p>·</p>
            <div class="flex items-center gap-2">
              <dt class="font-semibold">Параметр d:</dt>
              <dd class="font-mono">{{ props.item.d }}</dd>
            </div>
          </dl>
        </template>
      </ItemTitle>

      <ItemDescription>
        <span :class="props.mode === 'decrypt' ? 'font-mono font-light' : 'font-sans'">{{
          props.mode === 'encrypt' ? props.item.text : props.item.cipher
        }}</span>
        ·
        {{ new Date(props.item.timestamp).toLocaleString() }}
      </ItemDescription>
    </ItemContent>

    <ItemActions>
      <Button variant="outline" size="sm" @click="handleCopy(props.item)" class="cursor-pointer">
        <span v-if="props.item.copied" class="flex items-center gap-1"><Check /></span>
        <span v-else class="flex items-center gap-1"><Copy /></span>
      </Button>
      <Button
        variant="destructive"
        size="sm"
        class="border border-red-500/40 cursor-pointer hover:bg-destructive/50"
        @click="handleDelete?.(props.item)"
      >
        <Trash />
      </Button>
    </ItemActions>
  </Item>
</template>

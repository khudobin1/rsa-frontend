<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-transparent text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm backdrop-blur-[6px]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>

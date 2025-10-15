<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { TextSelect, ArrowUpRightIcon } from 'lucide-vue-next'

interface EmptyHistoryProps {
  class?: string
  title: string
  description: string
  linkText: string
  linkUrl: string
}

const props = defineProps<EmptyHistoryProps>()
</script>

<template>
  <Empty :class="props.class">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <TextSelect />
      </EmptyMedia>
      <EmptyTitle>{{ props.title }}</EmptyTitle>
      <EmptyDescription>
        {{ props.description }}
      </EmptyDescription>
    </EmptyHeader>
    <Button variant="link" as-child class="text-muted-foreground" size="sm">
      <RouterLink :to="props.linkUrl">{{ props.linkText }} <ArrowUpRightIcon /> </RouterLink>
    </Button>
  </Empty>
</template>

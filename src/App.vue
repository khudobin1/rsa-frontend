<script setup lang="ts">
import { Binary } from 'lucide-vue-next'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import WaveGrid from '@/components/WaveGrid.vue'
</script>

<template>
  <div class="flex items-center justify-center h-screen w-screen">
    <Card class="fixed top-4 right-6 left-6 px-10 z-10">
      <CardTitle class="flex items-center justify-between">
        <RouterLink to="/" class="flex gap-2 items-center"><Binary />Алгоритм RSA</RouterLink>
        <div class="flex items-center gap-4">
          <RouterLink to="/encrypt" class="flex gap-2 items-center hover:underline"
            >Зашифрование RSA</RouterLink
          >
          <RouterLink to="/decrypt" class="flex gap-2 items-center hover:underline"
            >Расшифрование RSA</RouterLink
          >
        </div>
      </CardTitle>
    </Card>
    <WaveGrid
      :cols="20"
      :rows="14"
      :amplitude="5"
      :speed="0.5"
      :freq="10"
      colorA="#2563eb"
      colorB="#3b82f6"
      :strokeWidth="1.5"
      :lineOpacity="0.35"
      :drawVertical="true"
      :soften="false"
      :seed="1"
    />
    <RouterView />
  </div>
</template>

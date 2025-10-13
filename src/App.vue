<script setup lang="ts">
import { Binary } from 'lucide-vue-next'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
</script>

<template>
  <div class="flex items-center justify-center h-screen w-screen bg-background">
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
    <RouterView />
  </div>
</template>

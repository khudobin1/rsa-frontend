<script setup lang="ts">
import {
  Binary,
  Type,
  Sparkles,
  TextSelect,
  ArrowUpRightIcon,
  Copy,
  Check,
  Trash,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useClipboard } from '@vueuse/core'

import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Item {
  text: string
  cipher: string
  d: string
  n: string
  timestamp: number
  copied: boolean
}

const source = ref('')
const { copy } = useClipboard({ source })

const handleCopy = async (item: Item) => {
  await copy(item.cipher)
  item.copied = true
  setTimeout(() => (item.copied = false), 1500)
}

const p = ref(null)
const q = ref(null)
const d = ref(null)
const n = ref(null)
const e = ref(null)

const items = ref<
  { text: string; cipher: string; d: string; n: string; timestamp: number; copied: boolean }[]
>([])

const loadItems = () => {
  const loaded: Item[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('encryptedText-')) {
      const value = localStorage.getItem(key)
      if (value !== null) {
        try {
          const obj = JSON.parse(value)
          loaded.push(obj)
        } catch (err) {
          console.error('Ошибка парсинга:', err)
        }
      }
    }
  }

  items.value = loaded.sort((a, b) => b.timestamp - a.timestamp)
}

const deleteItem = (item: any) => {
  const keyToRemove = Object.keys(localStorage).find((key) => {
    if (!key.startsWith('encryptedText-')) return false
    try {
      const val = JSON.parse(localStorage.getItem(key) || '{}')
      return val.text === item.text && val.cipher === item.cipher
    } catch {
      return false
    }
  })

  if (keyToRemove) {
    localStorage.removeItem(keyToRemove)
    loadItems()
  }
}

const openText = ref('')

const generateParams = async () => {
  const response = await axios.get('http://localhost:8080/keys/50')
  p.value = response.data.p
  q.value = response.data.q
  d.value = response.data.d
  n.value = response.data.n
  e.value = response.data.e
}

const encrypt = async () => {
  const response = await axios.post('http://localhost:8080/cipher', {
    text: openText.value.toLowerCase(),
    n: n.value,
    e: e.value,
  })
  const cipherStr = response.data.cipher.join(' ')
  localStorage.setItem(
    `encryptedText-${openText.value}-${n.value}-${e.value}`,
    JSON.stringify({
      text: openText.value,
      cipher: cipherStr,
      d: d.value,
      n: n.value,
      timestamp: Date.now(),
    }),
  )
  loadItems()
}

onMounted(() => {
  loadItems()
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col items-center justify-center">
    <Card class="w-[80%]">
      <CardContent class="flex flex-row gap-6">
        <div class="w-1/2 flex flex-col gap-3">
          <h1 class="text-xl font-semibold">Зашифрование</h1>
          <div class="space-y-2">
            <Label class="text-sm">Введите параметры</Label>
            <div class="flex gap-3 text-primary">
              <InputGroup>
                <InputGroupAddon>
                  <span class="text-sm">Параметр <span class="font-bold">p</span></span>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="p" align="left" />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon>
                  <span class="text-sm">Параметр <span class="font-bold">q</span></span>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="q" align="left" />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon>
                  <span class="text-sm">Параметр <span class="font-bold">d</span></span>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="d" align="left" />
              </InputGroup>
            </div>
          </div>
          <div class="relative mb-4">
            <Separator class="absolute top-2.5" />
            <span
              class="absolute left-1/2 right-1/2 bg-background text-center text-border text-sm w-[30px]"
              >или</span
            >
          </div>
          <Button class="cursor-pointer" @click="generateParams"><Sparkles />Сгенерируйте!</Button>
          <div class="space-y-2">
            <Label class="text-sm">Текст</Label>
            <InputGroup>
              <InputGroupAddon>
                <Type />
              </InputGroupAddon>
              <InputGroupInput
                class="text-sm placeholder:normal-case text-primary lowercase"
                v-model="openText"
                placeholder="Введите текст"
              />
            </InputGroup>
          </div>
          <Button class="cursor-pointer" @click="encrypt"><Binary />Зашифровать</Button>
        </div>
        <Separator orientation="vertical" />
        <div class="w-1/2">
          <Empty v-if="items.length === 0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TextSelect />
              </EmptyMedia>
              <EmptyTitle>Вы еще ничего не шифровали</EmptyTitle>
              <EmptyDescription>
                Вы еще ничего не шифровали. Попробуйте зашифровать свой первый текст в панели слева.
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="link" as-child class="text-muted-foreground" size="sm">
              <RouterLink to="/decrypt"> Нужно расшифровать? <ArrowUpRightIcon /> </RouterLink>
            </Button>
          </Empty>
          <div v-else class="flex flex-col gap-2 max-h-76 overflow-auto">
            <h1 class="text-xl font-semibold">История зашифрования</h1>
            <div v-for="item in items" :key="item.cipher" class="">
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle class="font-mono text-ellipsis"
                    >{{ item.cipher }} | n: {{ item.n }} | d: {{ item.d }}</ItemTitle
                  >
                  <ItemDescription class=""
                    >{{ item.text }} •
                    {{ new Date(item.timestamp).toLocaleString() }}</ItemDescription
                  >
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="handleCopy(item)"
                    class="cursor-pointer"
                  >
                    <span v-if="item.copied" class="flex items-center gap-1"
                      ><Check />Скопировано</span
                    >
                    <span v-else class="flex items-center gap-1"><Copy />Копировать</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    class="border border-red-500/40 cursor-pointer"
                    @click="deleteItem(item)"
                  >
                    <Trash />
                  </Button>
                </ItemActions>
              </Item>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

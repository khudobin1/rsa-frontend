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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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

const n = ref('')
const d = ref('')
const cipherText = ref('')

const handleCopy = async (item: Item) => {
  await copy(item.text)
  item.copied = true
  setTimeout(() => (item.copied = false), 1500)
}

const items = ref<Item[]>([])

const loadItems = () => {
  const loaded: Item[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('decryptedText-')) {
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

const deleteItem = (item: Item) => {
  const keyToRemove = Object.keys(localStorage).find((key) => {
    if (!key.startsWith('decryptedText-')) return false
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

const decrypt = async () => {
  const cipher = cipherText.value
    .trim()
    .split(/\s+/)
    .map((x) => parseInt(x, 10))
  const response = await axios.post('https://api.rsa.khudobin.ru/decipher', {
    cipher,
    n: parseInt(n.value, 10),
    d: parseInt(d.value, 10),
  })
  localStorage.setItem(
    `decryptedText-${cipherText.value}-${n.value}-${d.value}`,
    JSON.stringify({ cipher: cipherText.value, text: response.data.text, timestamp: Date.now() }),
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
          <h1 class="text-xl font-semibold">Расшифрование</h1>
          <div class="space-y-2">
            <Label class="text-sm">Введите ключи</Label>
            <div class="flex gap-3 text-primary">
              <InputGroup>
                <InputGroupAddon>
                  <span class="text-sm">Ключ <span class="font-bold">n</span></span>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="n" align="left" />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon>
                  <span class="text-sm">Ключ <span class="font-bold">d</span></span>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="d" align="left" />
              </InputGroup>
            </div>
          </div>

          <div class="space-y-2">
            <Label class="text-sm">Шифр</Label>
            <InputGroup>
              <InputGroupAddon>
                <Binary />
              </InputGroupAddon>
              <InputGroupInput
                class="text-sm placeholder:normal-case lowercase text-primary"
                v-model="cipherText"
                placeholder="Введите текст"
              />
            </InputGroup>
          </div>
          <Button class="cursor-pointer" @click="decrypt"><Type />Расшифровать</Button>
        </div>
        <Separator orientation="vertical" />
        <div class="w-1/2">
          <Empty v-if="items.length === 0" class="max-h-[200px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TextSelect />
              </EmptyMedia>
              <EmptyTitle>Вы еще ничего не расшифровали</EmptyTitle>
              <EmptyDescription>
                Вы еще ничего не расшифровали. Попробуйте расшифровать свой первый шифр в панели
                слева.
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="link" as-child class="text-muted-foreground" size="sm">
              <RouterLink to="/encrypt"> Нужно зашифровать? <ArrowUpRightIcon /> </RouterLink>
            </Button>
          </Empty>
          <div v-else class="flex flex-col gap-2 max-h-76 overflow-auto">
            <h1 class="text-xl font-semibold">История расшифрования</h1>
            <div v-for="item in items" :key="item.cipher" class="">
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle class="font-mono text-ellipsis">{{ item.text }}</ItemTitle>
                  <ItemDescription>
                    {{ item.cipher }} •
                    {{ new Date(item.timestamp).toLocaleString() }}
                  </ItemDescription>
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

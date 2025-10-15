<script setup lang="ts">
import { provide } from 'vue'

import EmptyHistory from '@/components/history/EmptyHistory.vue'
import HistoryList from '@/components/history/HistoryList.vue'
import { Binary, Type, Sparkles, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'

import { Spinner } from '@/components/ui/spinner'

import { ref } from 'vue'
import axios from 'axios'
import { useHistoryStorage } from '@/composables/useHistoryStorage'

const p = ref('')
const q = ref('')
const d = ref('')
const n = ref('')
const e = ref('')
const openText = ref('')

const loadingGenerate = ref(false)
const loadingEncrypt = ref(false)

const { items, loadItems, saveItem, deleteItem } = useHistoryStorage('encrypt')
provide('deleteItem', deleteItem)

const generateParams = async () => {
  loadingGenerate.value = true
  try {
    const response = await axios.get('https://api.rsa.khudobin.ru/keys/50')
    p.value = response.data.p
    q.value = response.data.q
    d.value = response.data.d
    n.value = response.data.n
    e.value = response.data.e
  } catch (error) {
    console.error('Ошибка генерации параметров:', error)
  } finally {
    loadingGenerate.value = false
  }
}

const encrypt = async () => {
  loadingEncrypt.value = true
  try {
    const response = await axios.post('https://api.rsa.khudobin.ru/cipher', {
      text: openText.value.toLowerCase(),
      n: n.value,
      e: e.value,
    })
    const cipherStr = response.data.cipher.join(' ')
    saveItem({
      text: openText.value,
      cipher: cipherStr,
      d: d.value,
      n: n.value,
    })
    loadItems()
  } catch (error) {
    console.error('Ошибка шифрования:', error)
  } finally {
    loadingEncrypt.value = false
  }
}
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
                  <span class="font-bold text-sm">p</span>
                </InputGroupAddon>
                <InputGroupAddon align="inline-end" v-if="p">
                  <Button @click="p = ''" variant="ghost" class="size-4">
                    <X class="w-1 h-1" />
                  </Button>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="p" />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon>
                  <span class="font-bold text-sm">q</span>
                </InputGroupAddon>
                <InputGroupAddon align="inline-end" v-if="q">
                  <Button @click="q = ''" variant="ghost" class="size-4">
                    <X class="w-1 h-1" />
                  </Button>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="q" />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon>
                  <span class="font-bold text-sm">d</span>
                </InputGroupAddon>
                <InputGroupAddon align="inline-end" v-if="d">
                  <Button @click="d = ''" variant="ghost" class="size-4">
                    <X class="w-1 h-1" />
                  </Button>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="d" align="left" />
              </InputGroup>
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <hr class="flex-1" />
            <p class="text-sm text-border">или</p>
            <hr class="flex-1" />
          </div>
          <Button class="cursor-pointer" @click="generateParams" :disabled="loadingGenerate"
            ><Spinner v-if="loadingGenerate" /><Sparkles v-else />Сгенерируйте!</Button
          >
          <div class="space-y-2">
            <Label class="text-sm">Текст</Label>
            <InputGroup>
              <InputGroupAddon>
                <Type />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end" v-if="openText">
                <Button @click="openText = ''" variant="ghost" class="size-4">
                  <X class="w-1 h-1" />
                </Button>
              </InputGroupAddon>
              <InputGroupInput
                class="text-sm placeholder:normal-case text-primary lowercase"
                v-model="openText"
                placeholder="Введите текст"
              />
            </InputGroup>
          </div>
          <Button
            class="cursor-pointer"
            @click="encrypt"
            :disabled="
              openText.length === 0 ||
              p.length === 0 ||
              q.length === 0 ||
              d.length === 0 ||
              loadingEncrypt
            "
            ><Spinner v-if="loadingEncrypt" /><Binary v-else />Зашифровать</Button
          >
        </div>
        <Separator orientation="vertical" />
        <div class="w-1/2">
          <EmptyHistory
            v-if="items.length === 0"
            title="Вы еще ничего не шифровали"
            description="Вы еще ничего не шифровали. Попробуйте зашифровать свой первый текст в панели слева."
            linkText="Нужно расшифровать?"
            linkUrl="/decrypt"
          />
          <HistoryList
            v-else
            :items="items"
            title="История зашифрования"
            mode="encrypt"
            @delete="deleteItem"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

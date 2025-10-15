<script setup lang="ts">
import EmptyHistory from '@/components/history/EmptyHistory.vue'
import HistoryList from '@/components/history/HistoryList.vue'
import { Binary, Type, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'

import { ref, onMounted, provide } from 'vue'
import axios from 'axios'
import { useHistoryStorage } from '@/composables/useHistoryStorage'
import { useDecryptStore } from '@/stores/decryptStore'

const n = ref('')
const d = ref('')
const cipherText = ref('')

const { items, loadItems, saveItem, deleteItem } = useHistoryStorage('decrypt')
provide('deleteItem', deleteItem)

const loadingDecrypt = ref(false)

const decrypt = async () => {
  loadingDecrypt.value = true
  try {
    const cipher = cipherText.value
      .trim()
      .split(/\s+/)
      .map((x) => parseInt(x, 10))

    const response = await axios.post('https://api.rsa.khudobin.ru/decipher', {
      cipher,
      n: parseInt(n.value, 10),
      d: parseInt(d.value, 10),
    })

    saveItem({
      cipher: cipherText.value,
      text: response.data.text,
      n: n.value,
      d: d.value,
    })
  } catch (error) {
    console.error('Ошибка расшифрования:', error)
  } finally {
    loadingDecrypt.value = false
  }
}

const decryptStore = useDecryptStore()

onMounted(() => {
  const payload = decryptStore.payload
  console.info('Пробуем расшифровать payload:')
  console.info(payload)
  if (payload) {
    const { nPayload, dPayload, textPayload } = payload
    cipherText.value = textPayload
    n.value = nPayload
    d.value = dPayload
    decrypt()
  }
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
                  <span class="font-bold text-sm">n</span>
                </InputGroupAddon>
                <InputGroupAddon align="inline-end" v-if="n">
                  <Button @click="n = ''" variant="ghost" class="size-4">
                    <X class="w-1 h-1" />
                  </Button>
                </InputGroupAddon>
                <InputGroupInput class="text-sm" v-model="n" align="left" />
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
          <div class="space-y-2">
            <Label class="text-sm">Шифр</Label>
            <InputGroup>
              <InputGroupAddon>
                <Binary />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end" v-if="cipherText">
                <Button @click="cipherText = ''" variant="ghost" class="size-4">
                  <X class="w-1 h-1" />
                </Button>
              </InputGroupAddon>
              <InputGroupInput
                class="text-sm placeholder:normal-case lowercase text-primary"
                v-model="cipherText"
                placeholder="Введите текст"
              />
            </InputGroup>
          </div>
          <Button
            class="cursor-pointer"
            @click="decrypt"
            :disabled="
              cipherText.length === 0 || d.length === 0 || n.length === 0 || loadingDecrypt
            "
            ><Spinner v-if="loadingDecrypt" /><Type v-else />Расшифровать</Button
          >
        </div>
        <Separator orientation="vertical" />
        <div class="w-1/2">
          <EmptyHistory
            v-if="items.length === 0"
            class="max-h-[200px]"
            title="Вы еще ничего не расшифровали"
            description="Вы еще ничего не расшифровали. Попробуйте расшифровать свой первый шифр в панели слева."
            linkText="Нужно зашифровать?"
            linkUrl="/encrypt"
          />
          <HistoryList v-else :items="items" mode="decrypt" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

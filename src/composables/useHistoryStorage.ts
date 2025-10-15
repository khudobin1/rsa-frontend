import { ref, provide, inject } from 'vue'
import type { THistoryItem } from '@/types'

export function useHistoryStorage(type: 'encrypt' | 'decrypt') {
  const items = ref<THistoryItem[]>([])
  const prefix = type === 'encrypt' ? 'encryptedText-' : 'decryptedText-'

  const loadItems = () => {
    const loaded: THistoryItem[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            loaded.push(JSON.parse(value))
          } catch (err) {
            console.error('Ошибка парсинга:', err)
          }
        }
      }
    }
    items.value = loaded.sort((a, b) => b.timestamp - a.timestamp)
  }

  const saveItem = (data: Omit<THistoryItem, 'timestamp'>) => {
    const key = `${prefix}${data.text}-${data.cipher}`
    const item: THistoryItem = { ...data, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(item))
    loadItems()
  }

  const deleteItem = (item: THistoryItem) => {
    const keyToRemove = Object.keys(localStorage).find((key) => {
      if (!key?.startsWith(prefix)) return false
      try {
        const val = JSON.parse(localStorage.getItem(key) || '{}')
        return val.text === item.text && val.cipher === item.cipher
      } catch {
        return false
      }
    })

    if (keyToRemove) {
      localStorage.removeItem(keyToRemove)
      items.value = items.value.filter((i) => i !== item)
    }
    loadItems()
    console.info('Осталось ', items.value.length)
  }

  loadItems()

  return { items, loadItems, saveItem, deleteItem }
}

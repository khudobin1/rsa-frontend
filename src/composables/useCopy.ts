import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import type { THistoryItem } from '@/types'

export function useCopy() {
  const source = ref('')
  const { copy } = useClipboard({ source })

  const handleCopy = async (item: THistoryItem, key: keyof THistoryItem = 'cipher') => {
    const value = String(item[key] ?? '')
    await copy(value)
    item.copied = true
    setTimeout(() => (item.copied = false), 1500)
  }

  return {
    handleCopy,
  }
}

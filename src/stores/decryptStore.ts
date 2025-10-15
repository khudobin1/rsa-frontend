// stores/decryptStore.ts
import { defineStore } from 'pinia'

export const useDecryptStore = defineStore('decrypt', {
  state: () => ({
    payload: null as null | {
      nPayload: string
      dPayload: string
      textPayload: string
    },
  }),
  actions: {
    setPayload(data: { nPayload: string; dPayload: string; textPayload: string }) {
      this.payload = data
    },
    clearPayload() {
      this.payload = null
    },
  },
})

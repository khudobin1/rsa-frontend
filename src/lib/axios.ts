import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://api.rsa.khudobin.ru',
  headers: {
    'Content-Type': 'application/json',
  },
})

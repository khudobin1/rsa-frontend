import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://92.51.39.215:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

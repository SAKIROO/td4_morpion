import axios from 'axios'

const apiKey = import.meta.env.VITE_MORPION_API_KEY

if (!apiKey) {
  console.warn('[morpion] VITE_MORPION_API_KEY is not set')
}

export default axios.create({
  baseURL: 'https://morpion-api.edu.netlor.fr',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `key=${apiKey || ''}`,
  },
})

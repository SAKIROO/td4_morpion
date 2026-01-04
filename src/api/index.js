import axios from 'axios'

const apiKey = import.meta.env.VITE_MORPION_API_KEY

if (!apiKey) {
  // Warn early so developers remember to set their personal API key in .env
  console.warn('[morpion] VITE_MORPION_API_KEY is not set')
}

export default axios.create({
  baseURL: 'https://morpion-api.edu.netlor.fr',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `key=${apiKey || ''}`,
  },
})

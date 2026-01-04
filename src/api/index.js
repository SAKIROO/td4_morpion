import axios from 'axios'

export default axios.create({
  baseURL: 'https://morpion-api.edu.netlor.fr',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'key=%udkxP8!4Hzd',
  },
})

// lib/axios.ts
import axios from 'axios'

// Optional: for accessing cookies in browser
import Cookies from '@/node_modules/@types/js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT from cookies
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized: Logging out...')
      Cookies.remove('token')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export default api

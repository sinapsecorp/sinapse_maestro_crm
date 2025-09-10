import axios from 'axios'
import { useAuthStore } from '../hooks/useAuthStore'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de resposta para tratar token inválido/expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error || {}
    const status = response?.status

    // Evita loops de retry
    if (status === 401 || status === 403) {
      try {
        useAuthStore.getState().logout()
      } catch (_) {
        // noop
      }
      // Redireciona para login sem manter histórico
      if (typeof window !== 'undefined') {
        const isOnLogin = window.location.pathname === '/login'
        if (!isOnLogin) window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default api

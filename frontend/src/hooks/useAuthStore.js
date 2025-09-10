import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  initialized: false,
  login: (token) => {
    localStorage.setItem('auth_token', token)
    set({ token, isAuthenticated: true, initialized: true })
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ token: null, isAuthenticated: false, initialized: true })
  },
  checkAuth: () => {
    const token = localStorage.getItem('auth_token')
    set({ token: token || null, isAuthenticated: !!token, initialized: true })
  },
}))

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function login(credentials) {
    // Demo mode: bypass backend authentication
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const mockToken = 'demo-token-' + Date.now()
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@gestirigation.com',
        nom_complet: 'Administrateur',
        role: 'ADMIN'
      }
      token.value = mockToken
      user.value = mockUser
      localStorage.setItem('token', mockToken)
      return { token: mockToken, user: mockUser }
    }
    throw new Error('Identifiants incorrects')
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  async function fetchUser() {
    if (!token.value) return

    // Demo mode: restore mock user from token
    if (token.value.startsWith('demo-token-')) {
      user.value = {
        id: 1,
        username: 'admin',
        email: 'admin@gestirigation.com',
        nom_complet: 'Administrateur',
        role: 'ADMIN'
      }
      return
    }

    try {
      const response = await api.get('/auth/me')
      user.value = response.data
    } catch (error) {
      logout()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser
  }
})
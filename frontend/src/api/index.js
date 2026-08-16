import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        window.location.href = '/login'
        ElMessage.error('Session expirée, veuillez vous reconnecter')
      } else if (status === 403) {
        ElMessage.error('Accès non autorisé')
      } else if (status === 404) {
        ElMessage.error('Ressource non trouvée')
      } else if (status === 500) {
        ElMessage.error('Erreur serveur')
      } else {
        ElMessage.error(data.message || 'Une erreur est survenue')
      }
    } else {
      ElMessage.error('Erreur de connexion au serveur')
    }
    
    return Promise.reject(error)
  }
)

export default api
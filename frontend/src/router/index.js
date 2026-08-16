import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('@/views/Clients.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/produits',
      name: 'produits',
      component: () => import('@/views/Produits.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ventes',
      name: 'ventes',
      component: () => import('@/views/Ventes.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/factures',
      name: 'factures',
      component: () => import('@/views/Factures.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stock',
      name: 'stock',
      component: () => import('@/views/Stock.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/fournisseurs',
      name: 'fournisseurs',
      component: () => import('@/views/Fournisseurs.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/bons-commande',
      name: 'bons-commande',
      component: () => import('@/views/BonsCommande.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/bons-livraison',
      name: 'bons-livraison',
      component: () => import('@/views/BonsLivraison.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/devis',
      name: 'devis',
      component: () => import('@/views/Devis.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/rapports',
      name: 'rapports',
      component: () => import('@/views/Rapports.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parametres',
      name: 'parametres',
      component: () => import('@/views/Parametres.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'ADMIN') {
    next('/')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
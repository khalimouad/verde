<template>
  <el-container class="layout-container">
    <!-- Mobile Header -->
    <el-header class="mobile-header" v-if="isMobile">
      <div class="header-content">
        <el-button 
          :icon="isMenuOpen ? Close : Menu" 
          @click="toggleMenu"
          class="menu-button"
        />
        <h1 class="app-title">Gest Irrigation</h1>
        <el-dropdown @command="handleCommand">
          <el-button :icon="User" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">Profil</el-dropdown-item>
              <el-dropdown-item command="logout" divided>Déconnexion</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- Sidebar -->
    <el-aside :width="isMobile ? (isMenuOpen ? '250px' : '0px') : '250px'" class="sidebar">
      <div class="sidebar-header">
        <h2 class="logo">Gest Irrigation</h2>
        <el-button 
          v-if="isMobile" 
          :icon="Close" 
          @click="toggleMenu"
          class="close-button"
        />
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="false"
        :router="true"
        class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>Tableau de bord</span>
        </el-menu-item>
        
        <el-menu-item index="/clients">
          <el-icon><User /></el-icon>
          <span>Clients</span>
        </el-menu-item>
        
        <el-menu-item index="/produits">
          <el-icon><Box /></el-icon>
          <span>Produits</span>
        </el-menu-item>
        
        <el-menu-item index="/ventes">
          <el-icon><ShoppingCart /></el-icon>
          <span>Ventes</span>
        </el-menu-item>
        
        <el-menu-item index="/factures">
          <el-icon><Document /></el-icon>
          <span>Factures</span>
        </el-menu-item>
        
        <el-menu-item index="/stock">
          <el-icon><Goods /></el-icon>
          <span>Stock</span>
        </el-menu-item>
        
        <el-menu-item index="/fournisseurs">
          <el-icon><Van /></el-icon>
          <span>Fournisseurs</span>
        </el-menu-item>
        
        <el-menu-item index="/bons-commande">
          <el-icon><DocumentCopy /></el-icon>
          <span>Bons Commande</span>
        </el-menu-item>
        
        <el-menu-item index="/bons-livraison">
          <el-icon><DocumentChecked /></el-icon>
          <span>Bons Livraison</span>
        </el-menu-item>
        
        <el-menu-item index="/devis">
          <el-icon><Edit /></el-icon>
          <span>Devis</span>
        </el-menu-item>
        
        <el-menu-item index="/rapports">
          <el-icon><DataAnalysis /></el-icon>
          <span>Rapports</span>
        </el-menu-item>
        
        <el-menu-item 
          index="/parametres" 
          v-if="authStore.isAdmin"
        >
          <el-icon><Setting /></el-icon>
          <span>Paramètres</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <el-main class="main-content">
      <slot />
    </el-main>

    <!-- Mobile Overlay -->
    <div 
      v-if="isMobile && isMenuOpen" 
      class="mobile-overlay"
      @click="toggleMenu"
    />
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { 
  House, User, Box, ShoppingCart, Document, 
  Goods, Van, Edit, DataAnalysis, Setting, 
  Menu, Close, DocumentCopy, DocumentChecked 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMobile = ref(false)
const isMenuOpen = ref(false)
const activeMenu = computed(() => route.path)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.mobile-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: none;
  padding: 0 16px;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.app-title {
  font-size: 18px;
  margin: 0;
  color: #303133;
}

.menu-button {
  border: none;
  background: transparent;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 20px;
  margin: 0;
  color: #409eff;
}

.close-button {
  border: none;
  background: transparent;
}

.sidebar-menu {
  border-right: none;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
  
  .sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    z-index: 1000;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>
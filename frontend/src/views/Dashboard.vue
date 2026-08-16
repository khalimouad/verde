<template>
  <Layout>
    <div class="dashboard">
      <h1 class="page-title">Tableau de bord</h1>
      
      <!-- Stats Cards -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon clients">
                <el-icon :size="32"><User /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ stats.clients }}</h3>
                <p>Clients</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon produits">
                <el-icon :size="32"><Box /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ stats.produits }}</h3>
                <p>Produits</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon ventes">
                <el-icon :size="32"><ShoppingCart /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ stats.ventes }}</h3>
                <p>Ventes ce mois</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon chiffre">
                <el-icon :size="32"><Money /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatCurrency(stats.chiffreAffaire) }}</h3>
                <p>Chiffre d'affaires</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Recent Activity and Alerts -->
      <el-row :gutter="20" class="content-row">
        <el-col :xs="24" :md="16">
          <el-card class="recent-activity">
            <template #header>
              <div class="card-header">
                <h3>Activité récente</h3>
              </div>
            </template>
            
            <el-timeline>
              <el-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :timestamp="formatDate(activity.date)"
                :type="activity.type"
              >
                {{ activity.description }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="8">
          <el-card class="alerts">
            <template #header>
              <div class="card-header">
                <h3>Alertes</h3>
              </div>
            </template>
            
            <div class="alert-item" v-for="alert in alerts" :key="alert.id">
              <el-icon :size="20" :color="alert.color">
                <Warning />
              </el-icon>
              <p>{{ alert.message }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Quick Actions -->
      <el-row :gutter="20" class="actions-row">
        <el-col :xs="24" :sm="12" :md="4">
          <el-button 
            type="primary" 
            @click="$router.push('/ventes/new')"
            class="quick-action"
          >
            <el-icon><Plus /></el-icon>
            Nouvelle Vente
          </el-button>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="4">
          <el-button 
            type="success" 
            @click="$router.push('/devis/new')"
            class="quick-action"
          >
            <el-icon><Edit /></el-icon>
            Nouveau Devis
          </el-button>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="4">
          <el-button 
            type="warning" 
            @click="$router.push('/clients/new')"
            class="quick-action"
          >
            <el-icon><User /></el-icon>
            Nouveau Client
          </el-button>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="4">
          <el-button 
            type="info" 
            @click="$router.push('/stock')"
            class="quick-action"
          >
            <el-icon><Goods /></el-icon>
            Voir Stock
          </el-button>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { 
  User, Box, ShoppingCart, Money, Warning, Plus, Edit, Goods 
} from '@element-plus/icons-vue'

const stats = ref({
  clients: 0,
  produits: 0,
  ventes: 0,
  chiffreAffaire: 0
})

const recentActivities = ref([
  {
    id: 1,
    description: 'Nouvelle vente #1234 - Client John Doe',
    date: new Date(),
    type: 'primary'
  },
  {
    id: 2,
    description: 'Stock faible pour produit POMPE-001',
    date: new Date(Date.now() - 3600000),
    type: 'warning'
  },
  {
    id: 3,
    description: 'Facture #5678 payée',
    date: new Date(Date.now() - 7200000),
    type: 'success'
  }
])

const alerts = ref([
  {
    id: 1,
    message: '5 produits en stock faible',
    color: '#E6A23C'
  },
  {
    id: 2,
    message: '3 factures en retard de paiement',
    color: '#F56C6C'
  },
  {
    id: 3,
    message: '1 commande fournisseur en attente',
    color: '#409EFF'
  }
])

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

onMounted(async () => {
  // TODO: Fetch real stats from API
  stats.value = {
    clients: 156,
    produits: 234,
    ventes: 45,
    chiffreAffaire: 45678.90
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 24px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.clients {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.produits {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.ventes {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.chiffre {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #303133;
}

.stat-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.content-row {
  margin-bottom: 24px;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-item p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.actions-row {
  margin-bottom: 24px;
}

.quick-action {
  width: 100%;
  height: 48px;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  
  .stat-content {
    gap: 12px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-info h3 {
    font-size: 20px;
  }
}
</style>
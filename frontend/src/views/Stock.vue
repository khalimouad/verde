<template>
  <Layout>
    <div class="stock-page">
      <div class="page-header">
        <h1>Gestion du Stock</h1>
        <el-button type="primary" :icon="Refresh" @click="loadStock">
          Actualiser
        </el-button>
      </div>

      <!-- Stock Alerts -->
      <el-alert
        v-if="lowStockItems.length > 0"
        :title="`${lowStockItems.length} produits en stock faible`"
        type="warning"
        :closable="false"
        class="stock-alert"
      />

      <el-card>
        <el-table :data="stock" v-loading="loading" stripe>
          <el-table-column prop="produit_code" label="Code" width="100" />
          <el-table-column prop="produit_nom" label="Produit" />
          <el-table-column prop="quantite" label="Quantité" width="100">
            <template #default="{ row }">
              <el-tag :type="getStockType(row)">{{ row.quantite }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="stock_min" label="Min" width="80" />
          <el-table-column prop="stock_max" label="Max" width="80" />
          <el-table-column prop="valeur_totale" label="Valeur">
            <template #default="{ row }">
              {{ formatCurrency(row.valeur_totale) }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="150">
            <template #default="{ row }">
              <el-button type="primary" :icon="Plus" circle size="small" @click="adjustStock(row, 'ENTREE')" />
              <el-button type="danger" :icon="Minus" circle size="small" @click="adjustStock(row, 'SORTIE')" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { Refresh, Plus, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const stock = ref([])

const lowStockItems = computed(() => {
  return stock.value.filter(item => item.quantite <= item.stock_min)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const getStockType = (row) => {
  if (row.quantite <= row.stock_min) return 'danger'
  if (row.quantite >= row.stock_max) return 'warning'
  return 'success'
}

const adjustStock = (item, type) => {
  ElMessage.info(`${type === 'ENTREE' ? 'Entrée' : 'Sortie'} de stock pour ${item.produit_nom}`)
}

const loadStock = async () => {
  loading.value = true
  try {
    stock.value = [
      { id: 1, produit_code: 'POMPE-001', produit_nom: 'Pompe Irrigation', quantite: 5, stock_min: 10, stock_max: 50, valeur_totale: 1250.00 },
      { id: 2, produit_code: 'TUYAU-002', produit_nom: 'Tuyau PVC 50mm', quantite: 120, stock_min: 20, stock_max: 200, valeur_totale: 5400.00 }
    ]
  } catch (error) {
    ElMessage.error('Erreur lors du chargement du stock')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStock()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #303133;
}

.stock-alert {
  margin-bottom: 20px;
}
</style>
<template>
  <Layout>
    <div class="ventes-page">
      <div class="page-header">
        <h1>Ventes</h1>
        <el-button type="primary" :icon="Plus" @click="showAddDialog">
          Nouvelle Vente
        </el-button>
      </div>

      <el-card>
        <el-table :data="ventes" v-loading="loading" stripe>
          <el-table-column prop="numero" label="N°" width="100" />
          <el-table-column prop="client_nom" label="Client" />
          <el-table-column prop="date_vente" label="Date">
            <template #default="{ row }">
              {{ formatDate(row.date_vente) }}
            </template>
          </el-table-column>
          <el-table-column prop="montant_ttc" label="Montant TTC">
            <template #default="{ row }">
              {{ formatCurrency(row.montant_ttc) }}
            </template>
          </el-table-column>
          <el-table-column prop="statut" label="Statut">
            <template #default="{ row }">
              <el-tag :type="getStatutType(row.statut)">{{ row.statut }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="150">
            <template #default="{ row }">
              <el-button type="primary" :icon="View" circle size="small" @click="viewVente(row)" />
              <el-button type="success" :icon="Document" circle size="small" @click="createFacture(row)" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { Plus, View, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const ventes = ref([])

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}

const getStatutType = (statut) => {
  const types = {
    'EN_COURS': 'warning',
    'FACTURE': 'success',
    'ANNULE': 'danger'
  }
  return types[statut] || 'info'
}

const showAddDialog = () => {
  ElMessage.info('Formulaire de nouvelle vente à implémenter')
}

const viewVente = (vente) => {
  ElMessage.info(`Détails de la vente ${vente.numero}`)
}

const createFacture = (vente) => {
  ElMessage.info(`Créer facture pour vente ${vente.numero}`)
}

const loadVentes = async () => {
  loading.value = true
  try {
    ventes.value = [
      { id: 1, numero: 'V2024-001', client_nom: 'John Doe', date_vente: '2024-01-15', montant_ttc: 1250.00, statut: 'EN_COURS' },
      { id: 2, numero: 'V2024-002', client_nom: 'Jane Smith', date_vente: '2024-01-16', montant_ttc: 890.50, statut: 'FACTURE' }
    ]
  } catch (error) {
    ElMessage.error('Erreur lors du chargement des ventes')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadVentes()
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
</style>
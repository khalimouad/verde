<template>
  <Layout>
    <div class="devis-page">
      <div class="page-header">
        <h1>Devis</h1>
        <el-button type="primary" :icon="Plus" @click="showAddDialog">
          Nouveau Devis
        </el-button>
      </div>

      <el-card>
        <el-table :data="devis" v-loading="loading" stripe>
          <el-table-column prop="numero" label="N°" width="100" />
          <el-table-column prop="client_nom" label="Client" />
          <el-table-column prop="date_devis" label="Date">
            <template #default="{ row }">
              {{ formatDate(row.date_devis) }}
            </template>
          </el-table-column>
          <el-table-column prop="date_validite" label="Validité">
            <template #default="{ row }">
              {{ formatDate(row.date_validite) }}
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
              <el-button type="primary" :icon="View" circle size="small" @click="viewDevis(row)" />
              <el-button type="success" :icon="Check" circle size="small" @click="convertToVente(row)" />
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
import { Plus, View, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const devis = ref([])

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
    'EN_ATTENTE': 'info',
    'ACCEPTE': 'success',
    'REFUSE': 'danger',
    'EXPIRE': 'warning'
  }
  return types[statut] || 'info'
}

const showAddDialog = () => {
  ElMessage.info('Formulaire nouveau devis à implémenter')
}

const viewDevis = (devi) => {
  ElMessage.info(`Visualiser devis ${devi.numero}`)
}

const convertToVente = (devi) => {
  ElMessage.info(`Convertir devis ${devi.numero} en vente`)
}

const loadDevis = async () => {
  loading.value = true
  try {
    devis.value = [
      { id: 1, numero: 'D2024-001', client_nom: 'John Doe', date_devis: '2024-01-15', date_validite: '2024-02-15', montant_ttc: 2500.00, statut: 'EN_ATTENTE' },
      { id: 2, numero: 'D2024-002', client_nom: 'Jane Smith', date_devis: '2024-01-10', date_validite: '2024-02-10', montant_ttc: 1800.00, statut: 'ACCEPTE' }
    ]
  } catch (error) {
    ElMessage.error('Erreur lors du chargement des devis')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDevis()
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
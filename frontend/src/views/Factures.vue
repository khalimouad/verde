<template>
  <Layout>
    <div class="factures-page">
      <div class="page-header">
        <h1>Factures</h1>
        <el-button type="primary" :icon="Download" @click="exportFactures">
          Exporter
        </el-button>
      </div>

      <el-card>
        <el-table :data="factures" v-loading="loading" stripe>
          <el-table-column prop="numero" label="N°" width="100" />
          <el-table-column prop="client_nom" label="Client" />
          <el-table-column prop="date_facture" label="Date">
            <template #default="{ row }">
              {{ formatDate(row.date_facture) }}
            </template>
          </el-table-column>
          <el-table-column prop="montant_ttc" label="Montant TTC">
            <template #default="{ row }">
              {{ formatCurrency(row.montant_ttc) }}
            </template>
          </el-table-column>
          <el-table-column prop="montant_reste" label="Reste à payer">
            <template #default="{ row }">
              {{ formatCurrency(row.montant_reste) }}
            </template>
          </el-table-column>
          <el-table-column prop="statut" label="Statut">
            <template #default="{ row }">
              <el-tag :type="getStatutType(row.statut)">{{ row.statut }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="150">
            <template #default="{ row }">
              <el-button type="primary" :icon="View" circle size="small" @click="viewFacture(row)" />
              <el-button type="success" :icon="Money" circle size="small" @click="addPayment(row)" />
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
import { Download, View, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const factures = ref([])

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
    'NON_PAYE': 'danger',
    'PARTIEL': 'warning',
    'PAYE': 'success'
  }
  return types[statut] || 'info'
}

const exportFactures = () => {
  ElMessage.info('Export des factures en cours...')
}

const viewFacture = (facture) => {
  ElMessage.info(`Visualiser facture ${facture.numero}`)
}

const addPayment = (facture) => {
  ElMessage.info(`Ajouter paiement pour facture ${facture.numero}`)
}

const loadFactures = async () => {
  loading.value = true
  try {
    factures.value = [
      { id: 1, numero: 'F2024-001', client_nom: 'John Doe', date_facture: '2024-01-15', montant_ttc: 1250.00, montant_reste: 500.00, statut: 'PARTIEL' },
      { id: 2, numero: 'F2024-002', client_nom: 'Jane Smith', date_facture: '2024-01-16', montant_ttc: 890.50, montant_reste: 0, statut: 'PAYE' }
    ]
  } catch (error) {
    ElMessage.error('Erreur lors du chargement des factures')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFactures()
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
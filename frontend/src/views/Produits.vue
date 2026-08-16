<template>
  <Layout>
    <div class="produits-page">
      <div class="page-header">
        <h1>Produits</h1>
        <el-button type="primary" :icon="Plus" @click="showAddDialog">
          Nouveau Produit
        </el-button>
      </div>

      <el-card>
        <el-table :data="produits" v-loading="loading" stripe>
          <el-table-column prop="code" label="Code" width="100" />
          <el-table-column prop="designation" label="Désignation" />
          <el-table-column prop="famille" label="Famille" />
          <el-table-column prop="prix_vente" label="Prix Vente">
            <template #default="{ row }">
              {{ formatCurrency(row.prix_vente) }}
            </template>
          </el-table-column>
          <el-table-column prop="stock_actuel" label="Stock" width="80" />
          <el-table-column label="Actions" width="150">
            <template #default="{ row }">
              <el-button type="primary" :icon="Edit" circle size="small" @click="editProduit(row)" />
              <el-button type="danger" :icon="Delete" circle size="small" @click="deleteProduit(row.id)" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Add/Edit Dialog -->
      <el-dialog v-model="dialogVisible" :title="editingProduit ? 'Modifier Produit' : 'Nouveau Produit'" width="700px">
        <el-form :model="produitForm" :rules="rules" ref="produitFormRef" label-width="120px">
          <el-form-item label="Code" prop="code">
            <el-input v-model="produitForm.code" />
          </el-form-item>
          <el-form-item label="Désignation" prop="designation">
            <el-input v-model="produitForm.designation" />
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="produitForm.description" type="textarea" />
          </el-form-item>
          <el-form-item label="Famille">
            <el-select v-model="produitForm.famille_id" placeholder="Sélectionner">
              <el-option label="Famille 1" value="1" />
              <el-option label="Famille 2" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="Prix Vente" prop="prix_vente">
            <el-input-number v-model="produitForm.prix_vente" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="Stock Min">
            <el-input-number v-model="produitForm.stock_min" :min="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">Annuler</el-button>
          <el-button type="primary" @click="saveProduit">Enregistrer</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const produits = ref([])
const dialogVisible = ref(false)
const editingProduit = ref(null)
const produitFormRef = ref(null)

const produitForm = reactive({
  code: '',
  designation: '',
  description: '',
  famille_id: '',
  prix_vente: 0,
  stock_min: 0
})

const rules = {
  code: [{ required: true, message: 'Code requis', trigger: 'blur' }],
  designation: [{ required: true, message: 'Désignation requise', trigger: 'blur' }],
  prix_vente: [{ required: true, message: 'Prix requis', trigger: 'blur' }]
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const showAddDialog = () => {
  editingProduit.value = null
  Object.assign(produitForm, {
    code: '',
    designation: '',
    description: '',
    famille_id: '',
    prix_vente: 0,
    stock_min: 0
  })
  dialogVisible.value = true
}

const editProduit = (produit) => {
  editingProduit.value = produit
  Object.assign(produitForm, produit)
  dialogVisible.value = true
}

const saveProduit = async () => {
  if (!produitFormRef.value) return
  await produitFormRef.value.validate(async (valid) => {
    if (valid) {
      ElMessage.success('Produit enregistré avec succès')
      dialogVisible.value = false
      loadProduits()
    }
  })
}

const deleteProduit = async (id) => {
  ElMessage.success('Produit supprimé')
  loadProduits()
}

const loadProduits = async () => {
  loading.value = true
  try {
    produits.value = [
      { id: 1, code: 'POMPE-001', designation: 'Pompe Irrigation', famille: 'Pompes', prix_vente: 250.00, stock_actuel: 15 },
      { id: 2, code: 'TUYAU-002', designation: 'Tuyau PVC 50mm', famille: 'Tuyaux', prix_vente: 45.00, stock_actuel: 120 }
    ]
  } catch (error) {
    ElMessage.error('Erreur lors du chargement des produits')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduits()
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
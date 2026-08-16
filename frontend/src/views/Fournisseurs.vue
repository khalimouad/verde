<template>
  <Layout>
    <div class="fournisseurs-page">
      <div class="page-header">
        <h1>Fournisseurs</h1>
        <el-button type="primary" :icon="Plus" @click="showAddDialog">
          Nouveau Fournisseur
        </el-button>
      </div>

      <el-card>
        <el-table :data="fournisseurs" v-loading="loading" stripe>
          <el-table-column prop="code" label="Code" width="100" />
          <el-table-column prop="nom" label="Nom" />
          <el-table-column prop="ville" label="Ville" />
          <el-table-column prop="telephone" label="Téléphone" />
          <el-table-column prop="email" label="Email" />
          <el-table-column prop="ice" label="ICE" width="120" />
          <el-table-column label="Actions" width="150">
            <template #default="{ row }">
              <el-button type="primary" :icon="Edit" circle size="small" @click="editFournisseur(row)" />
              <el-button type="danger" :icon="Delete" circle size="small" @click="deleteFournisseur(row.id)" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Add/Edit Dialog -->
      <el-dialog v-model="dialogVisible" :title="editingFournisseur ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'" width="600px">
        <el-form :model="fournisseurForm" :rules="rules" ref="fournisseurFormRef" label-width="120px">
          <el-form-item label="Code" prop="code">
            <el-input v-model="fournisseurForm.code" />
          </el-form-item>
          <el-form-item label="Nom" prop="nom">
            <el-input v-model="fournisseurForm.nom" />
          </el-form-item>
          <el-form-item label="Adresse">
            <el-input v-model="fournisseurForm.adresse" type="textarea" />
          </el-form-item>
          <el-form-item label="Ville">
            <el-input v-model="fournisseurForm.ville" />
          </el-form-item>
          <el-form-item label="Code Postal">
            <el-input v-model="fournisseurForm.code_postal" />
          </el-form-item>
          <el-form-item label="Téléphone">
            <el-input v-model="fournisseurForm.telephone" />
          </el-form-item>
          <el-form-item label="Email">
            <el-input v-model="fournisseurForm.email" type="email" />
          </el-form-item>
          <el-form-item label="ICE">
            <el-input v-model="fournisseurForm.ice" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">Annuler</el-button>
          <el-button type="primary" @click="saveFournisseur">Enregistrer</el-button>
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
import api from '@/api'

const loading = ref(false)
const fournisseurs = ref([])
const dialogVisible = ref(false)
const editingFournisseur = ref(null)
const fournisseurFormRef = ref(null)

const fournisseurForm = reactive({
  code: '',
  nom: '',
  adresse: '',
  ville: '',
  code_postal: '',
  telephone: '',
  email: '',
  ice: ''
})

const rules = {
  code: [{ required: true, message: 'Code requis', trigger: 'blur' }],
  nom: [{ required: true, message: 'Nom requis', trigger: 'blur' }]
}

const showAddDialog = () => {
  editingFournisseur.value = null
  Object.assign(fournisseurForm, {
    code: '',
    nom: '',
    adresse: '',
    ville: '',
    code_postal: '',
    telephone: '',
    email: '',
    ice: ''
  })
  dialogVisible.value = true
}

const editFournisseur = (fournisseur) => {
  editingFournisseur.value = fournisseur
  Object.assign(fournisseurForm, fournisseur)
  dialogVisible.value = true
}

const saveFournisseur = async () => {
  if (!fournisseurFormRef.value) return
  await fournisseurFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingFournisseur.value) {
          await api.put(`/api/fournisseurs/${editingFournisseur.value.id}`, fournisseurForm)
        } else {
          await api.post('/api/fournisseurs', fournisseurForm)
        }
        ElMessage.success('Fournisseur enregistré avec succès')
        dialogVisible.value = false
        loadFournisseurs()
      } catch (error) {
        ElMessage.error('Erreur lors de l\'enregistrement')
      }
    }
  })
}

const deleteFournisseur = async (id) => {
  try {
    await api.delete(`/api/fournisseurs/${id}`)
    ElMessage.success('Fournisseur supprimé')
    loadFournisseurs()
  } catch (error) {
    ElMessage.error('Erreur lors de la suppression')
  }
}

const loadFournisseurs = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/fournisseurs')
    fournisseurs.value = response.data
  } catch (error) {
    ElMessage.error('Erreur lors du chargement des fournisseurs')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFournisseurs()
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
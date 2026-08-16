<template>
  <Layout>
    <div class="clients-page">
      <div class="page-header">
        <h1>Clients</h1>
        <el-button type="primary" :icon="Plus" @click="showAddDialog">
          Nouveau Client
        </el-button>
      </div>

      <el-card>
        <el-table :data="clients" v-loading="loading" stripe>
          <el-table-column prop="code" label="Code" width="100" />
          <el-table-column prop="nom" label="Nom" />
          <el-table-column prop="ville" label="Ville" />
          <el-table-column prop="telephone" label="Téléphone" />
          <el-table-column prop="email" label="Email" />
          <el-table-column label="Actions" width="150">
            <template #default="{ row }">
              <el-button type="primary" :icon="Edit" circle size="small" @click="editClient(row)" />
              <el-button type="danger" :icon="Delete" circle size="small" @click="deleteClient(row.id)" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Add/Edit Dialog -->
      <el-dialog v-model="dialogVisible" :title="editingClient ? 'Modifier Client' : 'Nouveau Client'" width="600px">
        <el-form :model="clientForm" :rules="rules" ref="clientFormRef" label-width="120px">
          <el-form-item label="Code" prop="code">
            <el-input v-model="clientForm.code" />
          </el-form-item>
          <el-form-item label="Nom" prop="nom">
            <el-input v-model="clientForm.nom" />
          </el-form-item>
          <el-form-item label="Adresse">
            <el-input v-model="clientForm.adresse" type="textarea" />
          </el-form-item>
          <el-form-item label="Ville">
            <el-input v-model="clientForm.ville" />
          </el-form-item>
          <el-form-item label="Code Postal">
            <el-input v-model="clientForm.code_postal" />
          </el-form-item>
          <el-form-item label="Téléphone">
            <el-input v-model="clientForm.telephone" />
          </el-form-item>
          <el-form-item label="Email">
            <el-input v-model="clientForm.email" type="email" />
          </el-form-item>
          <el-form-item label="ICE">
            <el-input v-model="clientForm.ice" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">Annuler</el-button>
          <el-button type="primary" @click="saveClient">Enregistrer</el-button>
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
const clients = ref([])
const dialogVisible = ref(false)
const editingClient = ref(null)
const clientFormRef = ref(null)

const clientForm = reactive({
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
  editingClient.value = null
  Object.assign(clientForm, {
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

const editClient = (client) => {
  editingClient.value = client
  Object.assign(clientForm, client)
  dialogVisible.value = true
}

const saveClient = async () => {
  if (!clientFormRef.value) return
  await clientFormRef.value.validate(async (valid) => {
    if (valid) {
      // TODO: API call to save client
      ElMessage.success('Client enregistré avec succès')
      dialogVisible.value = false
      loadClients()
    }
  })
}

const deleteClient = async (id) => {
  // TODO: API call to delete client
  ElMessage.success('Client supprimé')
  loadClients()
}

const loadClients = async () => {
  loading.value = true
  try {
    // TODO: API call to load clients
    clients.value = [
      { id: 1, code: 'CLI001', nom: 'John Doe', ville: 'Paris', telephone: '0123456789', email: 'john@example.com' },
      { id: 2, code: 'CLI002', nom: 'Jane Smith', ville: 'Lyon', telephone: '0987654321', email: 'jane@example.com' }
    ]
  } catch (error) {
    ElMessage.error('Erreur lors du chargement des clients')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClients()
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
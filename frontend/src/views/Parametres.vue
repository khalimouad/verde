<template>
  <Layout>
    <div class="parametres-page">
      <h1 class="page-title">Paramètres</h1>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Général" name="general">
          <el-card>
            <el-form :model="generalSettings" label-width="150px">
              <el-form-item label="Nom de l'entreprise">
                <el-input v-model="generalSettings.companyName" />
              </el-form-item>
              <el-form-item label="Adresse">
                <el-input v-model="generalSettings.address" type="textarea" />
              </el-form-item>
              <el-form-item label="Téléphone">
                <el-input v-model="generalSettings.phone" />
              </el-form-item>
              <el-form-item label="Email">
                <el-input v-model="generalSettings.email" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSettings">Enregistrer</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="TVA" name="tva">
          <el-card>
            <div class="tab-header">
              <h3>Taux de TVA</h3>
              <el-button type="primary" :icon="Plus" @click="showTvaDialog">Nouveau Taux</el-button>
            </div>
            <el-table :data="tvaRates" stripe>
              <el-table-column prop="code" label="Code" />
              <el-table-column prop="taux" label="Taux (%)">
                <template #default="{ row }">
                  {{ row.taux }}%
                </template>
              </el-table-column>
              <el-table-column prop="description" label="Description" />
              <el-table-column label="Actions" width="100">
                <template #default="{ row }">
                  <el-button type="danger" :icon="Delete" circle size="small" @click="deleteTva(row.id)" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="Utilisateurs" name="users">
          <el-card>
            <div class="tab-header">
              <h3>Utilisateurs</h3>
              <el-button type="primary" :icon="Plus" @click="showUserDialog">Nouvel Utilisateur</el-button>
            </div>
            <el-table :data="users" stripe>
              <el-table-column prop="username" label="Nom d'utilisateur" />
              <el-table-column prop="email" label="Email" />
              <el-table-column prop="nom_complet" label="Nom complet" />
              <el-table-column prop="role" label="Rôle">
                <template #default="{ row }">
                  <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'primary'">{{ row.role }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="100">
                <template #default="{ row }">
                  <el-button type="danger" :icon="Delete" circle size="small" @click="deleteUser(row.id)" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="Sauvegarde" name="backup">
          <el-card>
            <h3>Sauvegarde et Restauration</h3>
            <el-space direction="vertical" style="width: 100%">
              <el-button type="primary" :icon="Download" @click="createBackup">
                Créer une sauvegarde
              </el-button>
              <el-button type="success" :icon="Upload" @click="restoreBackup">
                Restaurer une sauvegarde
              </el-button>
            </el-space>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { Plus, Delete, Download, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('general')

const generalSettings = reactive({
  companyName: 'Gest Irrigation',
  address: '',
  phone: '',
  email: ''
})

const tvaRates = ref([])
const users = ref([])

const saveSettings = () => {
  ElMessage.success('Paramètres enregistrés')
}

const showTvaDialog = () => {
  ElMessage.info('Formulaire nouveau taux TVA à implémenter')
}

const deleteTva = (id) => {
  ElMessage.success('Taux TVA supprimé')
}

const showUserDialog = () => {
  ElMessage.info('Formulaire nouvel utilisateur à implémenter')
}

const deleteUser = (id) => {
  ElMessage.success('Utilisateur supprimé')
}

const createBackup = () => {
  ElMessage.info('Création de la sauvegarde en cours...')
}

const restoreBackup = () => {
  ElMessage.info('Restauration de la sauvegarde en cours...')
}

onMounted(() => {
  tvaRates.value = [
    { id: 1, code: 'TVA20', taux: 20, description: 'TVA standard 20%' },
    { id: 2, code: 'TVA10', taux: 10, description: 'TVA réduite 10%' },
    { id: 3, code: 'TVA55', taux: 5.5, description: 'TVA super réduite 5.5%' }
  ]
  
  users.value = [
    { id: 1, username: 'admin', email: 'admin@gest-irigation.com', nom_complet: 'Administrateur', role: 'ADMIN' },
    { id: 2, username: 'user1', email: 'user1@gest-irigation.com', nom_complet: 'Utilisateur Test', role: 'USER' }
  ]
})
</script>

<style scoped>
.page-title {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header h3 {
  margin: 0;
  color: #303133;
}
</style>
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h1>Gest Irrigation</h1>
          <p>Connexion à votre espace de gestion</p>
        </div>
      </template>
      
      <el-form 
        :model="loginForm" 
        :rules="rules" 
        ref="loginFormRef"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="Nom d'utilisateur"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Mot de passe"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            Se connecter
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>Version 1.0.0 - Gestion Enterprise Irrigation</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: 'Veuillez saisir votre nom d\'utilisateur', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Veuillez saisir votre mot de passe', trigger: 'blur' },
    { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login(loginForm)
        ElMessage.success('Connexion réussie')
        router.push('/')
      } catch (error) {
        ElMessage.error('Identifiants incorrects')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
}

.card-header h1 {
  color: #409eff;
  margin: 0 0 8px 0;
  font-size: 28px;
}

.card-header p {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

.login-button {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 12px;
}

.login-footer p {
  margin: 0;
}
</style>
<template>
  <Layout>
    <div class="rapports-page">
      <h1 class="page-title">Rapports</h1>
      
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <el-card class="report-card" @click="generateReport('ventes')">
            <div class="report-content">
              <el-icon :size="48" color="#409eff"><TrendCharts /></el-icon>
              <h3>Rapport Ventes</h3>
              <p>Analyse des ventes par période</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8">
          <el-card class="report-card" @click="generateReport('stock')">
            <div class="report-content">
              <el-icon :size="48" color="#67c23a"><Goods /></el-icon>
              <h3>Rapport Stock</h3>
              <p>État des stocks et mouvements</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8">
          <el-card class="report-card" @click="generateReport('clients')">
            <div class="report-content">
              <el-icon :size="48" color="#e6a23c"><User /></el-icon>
              <h3>Rapport Clients</h3>
              <p>Analyse de la clientèle</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8">
          <el-card class="report-card" @click="generateReport('factures')">
            <div class="report-content">
              <el-icon :size="48" color="#f56c6c"><Document /></el-icon>
              <h3>Rapport Factures</h3>
              <p>Suivi des facturations</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8">
          <el-card class="report-card" @click="generateReport('fournisseurs')">
            <div class="report-content">
              <el-icon :size="48" color="#909399"><Van /></el-icon>
              <h3>Rapport Fournisseurs</h3>
              <p>Analyse des achats</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8">
          <el-card class="report-card" @click="generateReport('financier')">
            <div class="report-content">
              <el-icon :size="48" color="#409eff"><Money /></el-icon>
              <h3>Rapport Financier</h3>
              <p>Bilan financier global</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup>
import Layout from '@/components/Layout.vue'
import { TrendCharts, Goods, User, Document, Van, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const generateReport = (type) => {
  ElMessage.info(`Génération du rapport ${type} en cours...`)
}
</script>

<style scoped>
.page-title {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 24px;
}

.report-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 20px;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.report-content {
  text-align: center;
  padding: 20px;
}

.report-content h3 {
  margin: 16px 0 8px 0;
  color: #303133;
  font-size: 18px;
}

.report-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
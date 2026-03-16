<!-- 
  页面名称：Dashboard
  作用：仪表盘首页，展示数据统计图表
-->

<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-label">用户总数</div>
          <div class="stat-value">{{ userCount }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <div class="stat-label">商品总数</div>
          <div class="stat-value">{{ productCount }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-label">总库存</div>
          <div class="stat-value">{{ totalStock }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-label">库存总价值</div>
          <div class="stat-value">¥{{ totalValue.toLocaleString() }}</div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 商品分类分布柱状图 -->
      <div class="chart-card">
        <h3>商品分类库存分布</h3>
        <div ref="categoryChartRef" style="width: 100%; height: 300px;"></div>
      </div>
      
      <!-- 商品状态占比饼图 -->
      <div class="chart-card">
        <h3>商品状态占比</h3>
        <div ref="statusChartRef" style="width: 100%; height: 300px;"></div>
      </div>
    </div>
    
    <!-- 低库存预警列表 -->
    <div class="alert-card">
      <h3>⚠️ 低库存预警（库存小于10）</h3>
      <div v-if="lowStockProducts.length === 0" class="no-alert">
        暂无低库存商品
      </div>
      <table v-else class="alert-table">
        <thead>
          <tr>
            <th>商品名称</th>
            <th>分类</th>
            <th>当前库存</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in lowStockProducts" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td class="low-stock">{{ product.stock }}</td>
            <td>
              <button @click="goToProductManage" class="btn primary small">
                补货
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useProductStore } from '../stores/productStore'
import * as echarts from 'echarts'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

// 图表DOM引用
const categoryChartRef = ref(null)
const statusChartRef = ref(null)

// 计算属性 - 从store获取数据
const userCount = computed(() => userStore.users.length)
const productCount = computed(() => productStore.totalCount)
const totalStock = computed(() => productStore.totalStock)
const totalValue = computed(() => productStore.totalValue)
const lowStockProducts = computed(() => productStore.lowStockProducts)
const stockByCategory = computed(() => productStore.stockByCategory)

// 【核心理解】初始化图表
const initCharts = () => {
  // 分类库存柱状图
  const categoryChart = echarts.init(categoryChartRef.value)
  const categories = Object.keys(stockByCategory.value)
  const stocks = Object.values(stockByCategory.value)
  
  const categoryOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { rotate: 0 }
    },
    yAxis: {
      type: 'value',
      name: '库存量'
    },
    series: [
      {
        name: '库存',
        type: 'bar',
        data: stocks,
        itemStyle: {
          color: '#3498db'
        },
        barWidth: '60%'
      }
    ]
  }
  categoryChart.setOption(categoryOption)
  
  // 状态占比饼图
  const statusChart = echarts.init(statusChartRef.value)
  const activeCount = productStore.products.filter(p => p.status === 'active').length
  const inactiveCount = productStore.products.filter(p => p.status === 'inactive').length
  
  const statusOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '商品状态',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true
          }
        },
        data: [
          { value: activeCount, name: '上架中', itemStyle: { color: '#2ecc71' } },
          { value: inactiveCount, name: '已下架', itemStyle: { color: '#e74c3c' } }
        ]
      }
    ]
  }
  statusChart.setOption(statusOption)
  
  // 窗口大小变化时自适应
  window.addEventListener('resize', () => {
    categoryChart.resize()
    statusChart.resize()
  })
}

// 监听数据变化，更新图表
watch(
  [stockByCategory, () => productStore.products],
  () => {
    // 数据变化时重新初始化图表
    if (categoryChartRef.value && statusChartRef.value) {
      initCharts()
    }
  },
  { deep: true }
)

// 跳转到商品管理页面
const goToProductManage = () => {
  router.push('/products')
}

// 初始化加载数据
onMounted(async () => {
  /* ========== 【模拟数据】当前项目 ========== */
  // 确保数据已加载
  if (productStore.products.length === 0) {
    productStore.fetchProducts()
  }
  
  // 初始化图表
  setTimeout(() => {
    initCharts()
  }, 100)  // 等待DOM渲染完成
  
  /* ========== 【对接后端】真实项目应该调用异步方法 ========== */
  // try {
  //   await Promise.all([
  //     userStore.fetchUsers(),
  //     productStore.fetchProducts()
  //   ])
  //   initCharts()
  // } catch (error) {
  //   ElMessage.error('加载数据失败')
  // }
})
</script>

<style scoped>
.dashboard {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.chart-card h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 16px;
}

.alert-card {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  padding: 20px;
}

.alert-card h3 {
  color: #856404;
  margin-bottom: 15px;
  font-size: 16px;
}

.no-alert {
  text-align: center;
  color: #856404;
  padding: 20px;
}

.alert-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.alert-table th,
.alert-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.alert-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.low-stock {
  color: #ff4444;
  font-weight: bold;
}

.btn.small {
  padding: 4px 12px;
  font-size: 12px;
}
</style>

<!-- // src/api/dashboard.js - 【对接后端】仪表盘API
import request from '../utils/request'

export const dashboardApi = {
  // 获取统计数据
  getStats() {
    return request.get('/dashboard/stats')
  },
  
  // 获取图表数据
  getChartData(type) {
    return request.get(`/dashboard/charts/${type}`)
  },
  
  // 获取预警列表
  getAlerts() {
    return request.get('/dashboard/alerts')
  }
} -->
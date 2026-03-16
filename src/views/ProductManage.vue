<!-- 
  页面名称：ProductManage
  作用：商品管理页面，展示商品列表，支持增删改查
-->

<template>
  <div class="product-manage">
    <!-- 头部：标题和操作按钮 -->
    <div class="header">
      <h2>商品管理</h2>
      <div class="actions">
        <!--批量删除，v-if控制显示 -->
        <button 
          v-if="selectedIds.length > 0"
          @click="batchDelete"
          class="btn danger"
        >
          批量删除 ({{ selectedIds.length }})
        </button>
        <button @click="openAddModal" class="btn primary">
          + 新增商品
        </button>
      </div>
    </div>
    
    <!-- 搜索和筛选栏 -->
    <div class="filter-bar">
      <!-- 【面试必考+手写】v-model双向绑定 -->
      <input 
        v-model="searchText" 
        placeholder="搜索商品名称..."
        class="search-input"
      />
      <select v-model="categoryFilter" class="filter-select">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
      <select v-model="statusFilter" class="filter-select">
        <option value="">全部状态</option>
        <option value="active">上架</option>
        <option value="inactive">下架</option>
      </select>
    </div>
    
    <!-- 统计卡片（快捷展示） -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">商品总数</div>
        <div class="stat-value">{{ totalCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总库存</div>
        <div class="stat-value">{{ totalStock }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">库存总价值</div>
        <div class="stat-value">¥{{ totalValue.toLocaleString() }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">低库存商品</div>
        <div class="stat-value">{{ lowStockCount }}</div>
      </div>
    </div>
    
    <!-- 【面试必考+手写】加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
    
    <!-- 商品列表表格 -->
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th width="40">
              <!-- 【核心理解】全选 -->
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                @change="toggleAll"
              />
            </th>
            <th>ID</th>
            <th>商品名称</th>
            <th>分类</th>
            <th>价格</th>
            <th>库存</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <!-- 【面试必考+手写】v-for渲染列表 -->
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>
              <input 
                type="checkbox" 
                :value="product.id"
                v-model="selectedIds"
              />
            </td>
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>¥{{ product.price.toLocaleString() }}</td>
            <td>
              <span :class="{ 'low-stock': product.stock < 10 }">
                {{ product.stock }}
              </span>
            </td>
            <td>
              <!-- 【面试必考+手写】动态类名 -->
              <span class="status" :class="product.status">
                {{ product.status === 'active' ? '上架' : '下架' }}
              </span>
            </td>
            <td>{{ product.createTime }}</td>
            <td>
              <button @click="openEditModal(product)" class="btn edit">编辑</button>
              <button @click="deleteProduct(product.id)" class="btn delete">删除</button>
            </td>
          </tr>
          
          <!-- 空状态 -->
          <tr v-if="filteredProducts.length === 0">
            <td colspan="9" class="empty">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 新增/编辑模态框 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ modalTitle }}</h3>
        
        <!-- 【面试必考+手写】表单提交 -->
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>商品名称 <span class="required">*</span></label>
            <input 
              v-model="form.name" 
              required
              placeholder="请输入商品名称"
            />
          </div>
          
          <div class="form-group">
            <label>分类</label>
            <select v-model="form.category">
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label>价格 <span class="required">*</span></label>
              <input 
                v-model.number="form.price" 
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
              />
            </div>
            
            <div class="form-group half">
              <label>库存 <span class="required">*</span></label>
              <input 
                v-model.number="form.stock" 
                type="number"
                min="0"
                step="1"
                required
                placeholder="0"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="active">上架</option>
              <option value="inactive">下架</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn cancel">
              取消
            </button>
            <button type="submit" class="btn primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()
const loading = computed(() => productStore.loading)
const products = computed(() => productStore.products)
const categories = computed(() => productStore.categories)

// 统计计算属性
const totalCount = computed(() => productStore.totalCount)
const totalStock = computed(() => productStore.totalStock)
const totalValue = computed(() => productStore.totalValue)
const lowStockCount = computed(() => productStore.lowStockProducts.length)

// 搜索和筛选
const searchText = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')

// 【面试必考+手写】计算属性 - 过滤商品
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    // 搜索匹配（商品名称）
    const matchesSearch = !searchText.value || 
      product.name.toLowerCase().includes(searchText.value.toLowerCase())
    
    // 分类筛选
    const matchesCategory = !categoryFilter.value || product.category === categoryFilter.value
    
    // 状态筛选
    const matchesStatus = !statusFilter.value || product.status === statusFilter.value
    
    return matchesSearch && matchesCategory && matchesStatus
  })
})

// 选中的商品ID列表
const selectedIds = ref([])

// 【核心理解】是否全选
const isAllSelected = computed(() => {
  return filteredProducts.value.length > 0 && 
    selectedIds.value.length === filteredProducts.value.length
})

// 全选/取消全选
const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredProducts.value.map(p => p.id)
  }
}

// 批量删除
const batchDelete = () => {
  if (confirm(`确定删除选中的 ${selectedIds.value.length} 个商品吗？`)) {
    productStore.batchDeleteProducts(selectedIds.value)
    selectedIds.value = []
  }
}

// 模态框状态
const showModal = ref(false)
const modalTitle = ref('')
const editId = ref(null)

// 表单数据
const form = ref({
  name: '',
  category: '手机',
  price: 0,
  stock: 0,
  status: 'active'
})

// 打开新增模态框
const openAddModal = () => {
  modalTitle.value = '新增商品'
  editId.value = null
  form.value = { 
    name: '', 
    category: '手机', 
    price: 0, 
    stock: 0, 
    status: 'active' 
  }
  showModal.value = true
}

// 打开编辑模态框
const openEditModal = (product) => {
  modalTitle.value = '编辑商品'
  editId.value = product.id
  form.value = { ...product }  // 【核心理解】浅拷贝
  showModal.value = true
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
}

// 提交表单
const handleSubmit = () => {
  if (editId.value) {
    productStore.updateProduct(editId.value, form.value)
  } else {
    productStore.addProduct(form.value)
  }
  closeModal()
}

// 删除单个商品
const deleteProduct = (id) => {
  if (confirm('确定删除这个商品吗？')) {
    productStore.deleteProduct(id)
  }
}

// 初始化加载数据
onMounted(() => {
  /* ========== 【模拟数据】当前项目 ========== */
  productStore.fetchProducts()
  
  /* ========== 【对接后端】真实项目应该调用异步方法 ========== */
  // try {
  //   await productStore.fetchProducts()
  // } catch (error) {
  //   console.error('加载商品列表失败', error)
  //   ElMessage.error('加载失败')
  // }
})
</script>

<style scoped>
.product-manage {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn.primary {
  background: #3498db;
  color: white;
}

.btn.danger {
  background: #ff4444;
  color: white;
}

.btn.edit {
  background: #f1c40f;
  color: #2c3e50;
  margin-right: 5px;
}

.btn.delete {
  background: #ff4444;
  color: white;
}

.btn.cancel {
  background: #95a5a6;
  color: white;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 2;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-card.warning {
  background: #fff3cd;
  color: #856404;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-card.warning .stat-value {
  color: #856404;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.low-stock {
  color: #ff4444;
  font-weight: bold;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group.half {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.required {
  color: #ff4444;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
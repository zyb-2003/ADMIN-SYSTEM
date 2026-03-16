<!-- 
  页面名称：UserManage
  作用：用户管理页面，展示用户列表，支持增删改查
-->

<template>
  <div class="user-manage">
    <!-- 头部：标题和操作按钮 -->
    <div class="header">
      <h2>用户管理</h2>
      <div class="actions">
        <!-- 批量删除，v-if控制显示 -->
        <!-- 只有选中用户时才显示批量删除按钮 -->
        <button 
          v-if="selectedIds.length > 0"
          @click="batchDelete"
          class="btn danger"
        >
          批量删除 ({{ selectedIds.length }})
        </button>
        <button @click="openAddModal" class="btn primary">
          + 新增用户
        </button>
      </div>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <!--v-model双向绑定 -->
      <input 
        v-model="searchText" 
        placeholder="搜索用户名/邮箱..."
        class="search-input"
      />
      <select v-model="statusFilter" class="filter-select">
        <option value="">全部状态</option>
        <option value="active">启用</option>
        <option value="inactive">禁用</option>
      </select>
    </div>
    
    <!--加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
    
    <!-- 用户列表表格 -->
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
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <!--v-for渲染列表 -->
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <input 
                type="checkbox" 
                :value="user.id"
                v-model="selectedIds"
              />
            </td>
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </td>
            <td>
              <!-- 【面试必考+手写】动态类名 -->
              <span class="status" :class="user.status">
                {{ user.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ user.createTime }}</td>
            <td>
              <button @click="openEditModal(user)" class="btn edit">编辑</button>
              <button @click="deleteUser(user.id)" class="btn delete">删除</button>
            </td>
          </tr>
          
          <!-- 空状态 -->
          <tr v-if="filteredUsers.length === 0">
            <td colspan="8" class="empty">暂无数据</td>
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
            <label>用户名 <span class="required">*</span></label>
            <input 
              v-model="form.username" 
              required
              placeholder="请输入用户名"
            />
          </div>
          
          <div class="form-group">
            <label>邮箱</label>
            <input 
              v-model="form.email" 
              type="email"
              placeholder="请输入邮箱"
            />
          </div>
          
          <div class="form-group">
            <label>角色</label>
            <select v-model="form.role">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
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
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()
const loading = computed(() => userStore.userListLoading)
const users = computed(() => userStore.users)

// 搜索和筛选
const searchText = ref('')
const statusFilter = ref('')

// 计算属性 - 过滤用户
// 根据搜索文本和状态筛选用户列表
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // 搜索匹配：用户名或邮箱包含搜索文本
    const matchesSearch = !searchText.value || 
      user.username.toLowerCase().includes(searchText.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.value.toLowerCase())
    
    // 状态筛选
    const matchesStatus = !statusFilter.value || user.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

// 选中的用户ID列表
const selectedIds = ref([])

// 【核心理解】是否全选
const isAllSelected = computed(() => {
  return filteredUsers.value.length > 0 && 
    selectedIds.value.length === filteredUsers.value.length
})

// 全选/取消全选
const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredUsers.value.map(u => u.id)
  }
}

// 批量删除
const batchDelete = () => {
  if (confirm(`确定删除选中的 ${selectedIds.value.length} 个用户吗？`)) {
    userStore.batchDeleteUsers(selectedIds.value)
    selectedIds.value = []
  }
}

// 模态框状态
const showModal = ref(false)
const modalTitle = ref('')
const editId = ref(null)

// 表单数据
const form = ref({
  username: '',
  email: '',
  role: 'user',
  status: 'active'
})

// 打开新增模态框
const openAddModal = () => {
  modalTitle.value = '新增用户'
  editId.value = null
  form.value = { username: '', email: '', role: 'user', status: 'active' }
  showModal.value = true
}

// 打开编辑模态框
const openEditModal = (user) => {
  modalTitle.value = '编辑用户'
  editId.value = user.id
  form.value = { ...user }  // 【核心理解】浅拷贝
  showModal.value = true
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
}

// 提交表单
const handleSubmit = () => {
  if (editId.value) {
    userStore.updateUser(editId.value, form.value)
  } else {
    userStore.addUser(form.value)
  }
  closeModal()
}

// 删除单个用户
const deleteUser = (id) => {
  if (confirm('确定删除这个用户吗？')) {
    userStore.deleteUser(id)
  }
}

// 初始化加载数据
onMounted(() => {
  /* ========== 【模拟数据】当前项目 ========== */
  userStore.fetchUsers()
  
  /* ========== 【对接后端】真实项目应该调用异步方法 ========== */
  // try {
  //   await userStore.fetchUsers()
  // } catch (error) {
  //   console.error('加载用户列表失败', error)
  // }
})
</script>

<style scoped>
.user-manage {
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

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-select {
  width: 120px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.role-badge.admin {
  background: #f1c40f;
  color: #2c3e50;
}

.role-badge.user {
  background: #3498db;
  color: white;
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
  width: 400px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
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

<!-- 【对接后端】使用Element Plus的表格组件 -->
<!-- <template>
  <el-table :data="filteredUsers" v-loading="loading">
    <el-table-column type="selection" width="55" />
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="username" label="用户名" />
    <el-table-column prop="email" label="邮箱" />
    <el-table-column prop="role" label="角色">
      <template #default="{ row }">
        <el-tag :type="row.role === 'admin' ? 'success' : 'info'">
          {{ row.role === 'admin' ? '管理员' : '普通用户' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
          {{ row.status === 'active' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button size="small" @click="openEditModal(row)">编辑</el-button>
        <el-button size="small" type="danger" @click="deleteUser(row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template> -->
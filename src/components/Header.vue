<!-- 
  组件名称：Header
  作用：顶部导航栏，显示当前页面标题、用户信息、退出登录
-->
  <template>
    <!-- 左侧：面包屑，显示当前页面标题 -->
     <div class="breadcrumb">
        <span class="icon">🏠</span>
        <span>{{ currentRoute }}</span>
     </div>
        <!-- 右侧：用户信息和退出按钮 -->
         <div class=""user-area>
            <!-- 只有管理员才显示管理员徽章 -->
      <span v-if="isAdmin" class="admin-badge">管理员</span>
      <!-- 通知图标（静态展示） -->
      <button class="notification-btn">
        <span class="icon">🔔</span>
        <span class="badge">3</span>
      </button>
         </div>

  </template>
  <script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 计算属性 - 当前路由标题
const currentRoute = computed(() => route.meta.title || '')

// 用户信息
const userInfo = computed(() => userStore.userInfo)
const isAdmin = computed(() => userStore.isAdmin)

// 退出登录
const logout = () => {
  userStore.logout()
  router.push('/login')
}
// 【对接后端】真实通知功能
// import { ref, onMounted } from 'vue'

// const notifications = ref([])
// const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// onMounted(async () => {
//   // 获取通知列表
//   const res = await request.get('/notifications')
//   notifications.value = res
// })

// // WebSocket实时通知
// const ws = new WebSocket('wss://api.example.com/ws')
// ws.onmessage = (event) => {
//   const notification = JSON.parse(event.data)
//   notifications.value.unshift(notification)
//   // 显示弹窗提示
//   ElNotification({
//     title: '新通知',
//     message: notification.content
//   })
// }
</script>

<style scoped>
.header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-badge {
  padding: 4px 8px;
  background: #f1c40f;
  color: #2c3e50;
  border-radius: 4px;
  font-size: 12px;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4444;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.user-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: none;
  min-width: 120px;
  z-index: 1000;
}

.user-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a {
  display: block;
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
}

.dropdown-menu a:hover {
  background: #f5f5f5;
}
</style>
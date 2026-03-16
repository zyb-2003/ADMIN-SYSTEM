<!-- 
  组件名称：Sidebar
  作用：左侧菜单栏，显示logo、菜单列表、用户信息
  修改说明：添加响应式设计，支持折叠菜单（移动端）
-->
<template>
  <!-- 【修改】添加 :class 动态控制折叠状态 -->
  <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- Logo区域 -->
    <div class="logo" @click="toggleSidebar">
      <h2>{{ isCollapsed ? '管' : '后台管理系统' }}</h2>
      <!-- 【新增】移动端折叠按钮 -->
      <button class="collapse-btn" v-if="isMobile" @click.stop="toggleSidebar">
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </div>
    
    <!-- v-for渲染菜单 -->
    <div class="menu">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        class="menu-item"
        active-class="active"
        :title="isCollapsed ? item.title : ''"
      >
        <span class="icon">{{ item.icon }}</span>
        <!-- 【修改】折叠时隐藏文字 -->
        <span class="title" v-if="!isCollapsed">{{ item.title }}</span>
      </router-link>
    </div>
    
    <!-- 用户信息（底部） -->
    <div class="user-info" v-if="userInfo" :title="isCollapsed ? userInfo.username : ''">
      <div class="avatar">{{ userInfo.username?.[0] }}</div>
      <div class="info" v-if="!isCollapsed">
        <div class="name">{{ userInfo.username }}</div>
        <div class="role">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</div>
      </div>
    </div>

    <!-- 【新增】退出登录按钮 -->
    <div class="logout" @click="handleLogout">退出登录</div>

    <!-- 【新增】移动端遮罩层（点击关闭侧边栏） -->
    <div v-if="isMobile && !isCollapsed" class="sidebar-mask" @click="toggleSidebar"></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'  // 【新增】导入路由
import { useUserStore } from '../stores/userStore'

const router = useRouter()  // 【新增】
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 【新增】响应式状态
const windowWidth = ref(window.innerWidth)
const isMobile = ref(windowWidth.value < 768)  // 手机：小于768px
const isTablet = ref(windowWidth.value >= 768 && windowWidth.value < 1024)  // 平板：768-1024px
const isCollapsed = ref(isMobile.value)  // 移动端默认折叠

// 菜单配置数据
const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: '📊' },
  { path: '/users', title: '用户管理', icon: '👥' },
  { path: '/products', title: '商品管理', icon: '📦' }
]

// 【新增】监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
  isMobile.value = windowWidth.value < 768
  isTablet.value = windowWidth.value >= 768 && windowWidth.value < 1024
  
  // 移动端自动折叠，桌面端自动展开
  if (isMobile.value) {
    isCollapsed.value = true
  } else {
    isCollapsed.value = false
  }
}

// 【新增】切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 【新增】退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 【新增】监听折叠状态，控制body滚动（移动端）
watch(isCollapsed, (newVal) => {
  if (isMobile.value) {
    if (!newVal) {
      document.body.style.overflow = 'hidden'  // 侧边栏展开时禁止背景滚动
    } else {
      document.body.style.overflow = ''  // 恢复滚动
    }
  }
})

// 【对接后端】动态菜单 - 根据权限从后端获取
// 在store中获取菜单
// actions: {
//   async fetchMenu() {
//     const response = await request.get('/user/menu')
//     this.menuItems = response
//   }
// }

// 在Sidebar中使用
// const menuItems = computed(() => userStore.menuItems)
</script>

<style scoped>
/* ===== 基础样式（所有设备通用）===== */
.sidebar {
  width: 220px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  transition: all 0.3s ease;  /* 【新增】添加过渡动画 */
  z-index: 1000;  /* 【新增】确保侧边栏在最上层 */
}

/* 【新增】折叠状态样式 */
.sidebar.collapsed {
  width: 80px;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #34495e;
  position: relative;  /* 【新增】用于绝对定位按钮 */
  cursor: pointer;  /* 【新增】鼠标移入显示手型 */
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;  /* 【新增】保证高度一致 */
}

.logo h2 {
  color: white;
  margin: 0;
  font-size: 18px;  /* 【新增】固定字体大小 */
  transition: all 0.3s;  /* 【新增】过渡动画 */
  white-space: nowrap;  /* 【新增】防止文字换行 */
  overflow: hidden;  /* 【新增】隐藏超出部分 */
}

/* 【新增】折叠按钮 */
.collapse-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: #34495e;
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s;
}

.collapse-btn:hover {
  background: #3498db;
}

.menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;  /* 【新增】菜单过多时可滚动 */
}

/* 【修改】菜单项样式，适配折叠状态 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s;
  gap: 10px;
  white-space: nowrap;  /* 【新增】防止文字换行 */
  position: relative;
}

.menu-item:hover {
  background: #34495e;
}

/* 折叠时hover效果 */
.sidebar.collapsed .menu-item:hover {
  background: #3498db;
}

/* 折叠时显示提示文字（利用title属性） */
.sidebar.collapsed .menu-item:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: #3498db;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  margin-left: 10px;
  z-index: 1001;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.menu-item.active {
  background: #3498db;
  border-left: 4px solid #f1c40f;
}

.icon {
  font-size: 18px;
  width: 24px;
  text-align: center;  /* 【新增】图标居中 */
}

.title {
  font-size: 14px;
  transition: opacity 0.3s;  /* 【新增】文字渐变动画 */
}

/* 【修改】用户信息区域 */
.user-info {
  padding: 20px;
  border-top: 1px solid #34495e;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  min-height: 80px;  /* 【新增】固定高度 */
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  flex-shrink: 0;  /* 【新增】防止被压缩 */
}

.info {
  flex: 1;
  min-width: 0;  /* 【新增】防止文字溢出 */
}

.name {
  font-weight: bold;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;  /* 【新增】文字过长显示省略号 */
}

.role {
  font-size: 12px;
  color: #bdc3c7;
}

/* 【新增】移动端退出按钮 */
.mobile-logout {
  background: none;
  border: none;
  color: #ecf0f1;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s;
}

.mobile-logout:hover {
  background: #c0392b;
}

/* 【新增】移动端遮罩层 */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/*退出登录按钮调整*/
  /* 【新增】退出登录按钮样式 */
.logout {
  margin: 0 20px 20px 20px;        /* 外边距：上0 右20 下20 左20 */
  padding: 4px;                    /* 内边距 */
  background: #e74c3c;              /* 红色背景 */
  color: white;                     /* 白色文字 */
  border: none;                     /* 无边框 */
  border-radius: 4px;               /* 4px圆角 */
  font-size: 14px;                  /* 字体大小 */
  font-weight: 500;                 /* 字体粗细 */
  text-align: center;               /* 文字居中 */
  cursor: pointer;                  /* 鼠标手型 */
  transition: all 0.3s;             /* 过渡动画 */
}

/* 悬停效果 */
.logout:hover {
  background: #c0392b;              /* 深红色 */
  transform: translateY(-2px);       /* 向上浮动 */
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3); /* 红色阴影 */
}

/* 点击效果 */
.logout:active {
  transform: translateY(0);          /* 点击时恢复 */
  box-shadow: none;                  /* 取消阴影 */
}

/* 折叠状态下的退出按钮 */
.sidebar.collapsed .logout {
  margin: 0 10px 20px 10px;         /* 减小左右边距 */
  padding: 12px 0;                   /* 左右内边距为0 */
  font-size: 0;                      /* 隐藏文字 */
  position: relative;                 /* 相对定位 */
}

/* 折叠时用图标代替文字 */
.sidebar.collapsed .logout::before {
  content: "🚪";                     /* 退出图标 */
  font-size: 18px;                   /* 图标大小 */
}

/* 折叠时悬停显示文字 */
.sidebar.collapsed .logout:hover::after {
  content: "退出登录";                /* 显示文字 */
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  margin-left: 10px;
  z-index: 1001;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

/* ===== 响应式设计 - 平板 (768px - 1024px) ===== */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .sidebar {
    width: 200px;  /* 平板时稍微缩小 */
  }
  
  .sidebar.collapsed {
    width: 70px;  /* 折叠时更窄 */
  }
  
  .logo h2 {
    font-size: 16px;  /* 缩小字体 */
  }
  
  .menu-item {
    padding: 10px 15px;  /* 减小内边距 */
  }
  
  .user-info {
    padding: 15px;  /* 减小内边距 */
  }
}

/* ===== 响应式设计 - 手机 (小于768px) ===== */
@media screen and (max-width: 768px) {
  .sidebar {
    position: fixed;  /* 【修改】固定定位覆盖内容 */
    left: 0;
    top: 0;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0,0,0,0.3);  /* 【新增】阴影效果 */
  }
  
  /* 移动端折叠状态（隐藏大部分内容） */
  .sidebar.collapsed {
    width: 60px;
    transform: translateX(0);  /* 保持在左侧 */
  }
  
  /* 移动端展开状态 */
  .sidebar:not(.collapsed) {
    width: 250px;  /* 移动端展开时稍大，方便点击 */
    box-shadow: 2px 0 15px rgba(0,0,0,0.5);
  }
  
  .logo {
    padding: 15px 10px;
  }
  
  .logo h2 {
    font-size: 16px;
  }
  
  /* 折叠时标题隐藏，只显示第一个字 */
  .sidebar.collapsed .logo h2 {
    font-size: 18px;
    content: '管';  /* 实际上不生效，需要通过js或条件渲染 */
  }
  
  .menu-item {
    padding: 15px 15px;  /* 增大点击区域 */
  }
  
  .icon {
    font-size: 20px;  /* 增大图标 */
    width: 30px;
  }
  
  .user-info {
    padding: 15px 10px;
  }
  
  .avatar {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
  
  /* 移动端折叠时隐藏用户信息文字，只保留头像 */
  .sidebar.collapsed .info {
    display: none;
  }
  
  .sidebar.collapsed .user-info {
    justify-content: center;
    padding: 15px 5px;
  }
  
  /* 遮罩层只在移动端且侧边栏展开时显示 */
  .sidebar-mask {
    display: block;
  }
}

/* ===== 超小屏手机 (小于375px) ===== */
@media screen and (max-width: 375px) {
  .sidebar:not(.collapsed) {
    width: 220px;  /* 小屏幕再缩小一点 */
  }
  
  .menu-item {
    padding: 12px 12px;
  }
  
  .icon {
    font-size: 18px;
    width: 25px;
  }
  
  .avatar {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
}

/* ===== 横屏模式优化 ===== */
@media screen and (max-height: 600px) and (orientation: landscape) {
  .sidebar {
    overflow-y: auto;  /* 允许滚动 */
  }
  
  .menu {
    padding: 10px 0;
  }
  
  .menu-item {
    padding: 8px 15px;  /* 减小高度 */
  }
  
  .user-info {
    padding: 10px 15px;
    min-height: 60px;
  }
  
  .avatar {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  
}
</style>
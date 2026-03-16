<!-- 
  组件名称：DefaultLayout
  作用：默认布局，包含侧边栏和头部，包裹所有需要登录的页面
-->
<template>
      <div class="layout">
    <!-- 侧边栏组件 -->
    <Sidebar />
    
    <div class="main">
      <!-- 头部组件 -->
      <Header />
      
      <!-- 路由出口 -->
      <!--显示当前路由对应的页面组件 -->
      <div class="content">
        <router-view v-slot="{ Component }">
          <!-- 过渡动画 -->
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
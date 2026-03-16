// src/main.js - 代码逐行执行顺序

// 1. 导入依赖
import { createApp } from 'vue' // 从node_modules加载Vue核心
import { createPinia } from 'pinia' // 加载状态管理库
import App from './App.vue' // 加载根组件
import router from './router' // 加载路由配置
import './style.css' // 加载全局样式

// 2. 创建Vue应用实例
const app = createApp(App) // ← 这里创建了应用，但还没渲染

// 3. 注册插件
app.use(createPinia()) // ← 注册Pinia，让所有组件都能使用store
app.use(router) // ← 注册路由，让所有组件都能使用router

// 4. 挂载到DOM
app.mount('#app') // ← 把App组件渲染到index.html的div#app中
    // src/main.js - 【对接后端】真实项目版本

// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import App from './App.vue'
// import router from './router'

// // 导入UI组件库
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// // 导入全局样式
// import './styles/index.scss'

// // 导入权限指令
// import permission from './directives/permission'

// const app = createApp(App)

// // 注册插件
// app.use(createPinia())
// app.use(router)
// app.use(ElementPlus, {
//   locale: zhCn,
//   size: 'default'
// })

// // 注册全局指令
// app.directive('permission', permission)

// // 全局错误处理
// app.config.errorHandler = (err, vm, info) => {
//   console.error('全局错误:', err, info)
//   // 可以上报错误监控服务
// }

// app.mount('#app')
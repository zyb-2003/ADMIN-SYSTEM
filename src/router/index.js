//这个文件负责定义应用的路由规则，配置每个路径对应的组件，以及设置访问权限等元信息。
//路由是单页应用的核心部分，负责根据URL路径加载不同的组件，实现页面之间的导航和切换。

//导入Vue Router相关方法
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

//路由规则是一个数组，每个元素是一个对象，包含path、name、component和meta等属性。
//path表示路径，name表示路由名称，component表示对应的组件，meta表示元信息，可以包含访问权限、标题等信息。
// 配置每个路径对应的组件
const routes = [{
        path: '/login',
        name: 'login',
        component: () =>
            import ('../views/Login.vue'),
        meta: { requiresAuth: false, title: '登录' }
    },
    {
        path: '/',
        component: () =>
            import ('../layouts/DefaultLayout.vue'),
        meta: { requiresAuth: true },
        children: [{
                path: '',
                redirect: '/dashboard'
            },
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () =>
                    import ('../views/Dashboard.vue'),
                meta: { title: '仪表盘', icon: '📊' }
            },
            {
                path: 'users',
                name: 'users',
                component: () =>
                    import ('../views/UserManage.vue'),
                meta: { title: '用户管理', icon: '👥' }
            },
            {
                path: 'products',
                name: 'products',
                component: () =>
                    import ('../views/ProductManage.vue'),
                meta: { title: '商品管理', icon: '📦' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫 - 在每次路由切换前检查用户是否已登录
//to: 即将要进入的目标路由对象, from: 当前导航正要离开的路由对象, next: 这个函数必须被调用来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
router.beforeEach((to, from, next) => {
        const userStore = useUserStore()

        document.title = to.meta.title || '后台管理系统'

        if (to.meta.requiresAuth && !userStore.isLoggedIn) {
            next('/login')
        } else if (to.path === '/login' && userStore.isLoggedIn) {
            next('/dashboard')
        } else {
            next()
        }
    })
    //实际项目可能需要更复杂的权限检查，比如根据用户角色控制访问某些页面，可以在导航守卫中添加更多逻辑来实现。
    // 【对接后端】动态路由 - 根据权限动态添加路由

// // 定义常量路由（所有人都能访问）
// const constantRoutes = [
//   { path: '/login', component: Login },
//   { path: '/403', component: Forbidden },
//   { path: '/404', component: NotFound }
// ]

// // 定义异步路由（需要权限）
// const asyncRoutes = {
//   admin: [
//     { path: '/users', component: UserManage },
//     { path: '/products', component: ProductManage }
//   ],
//   editor: [
//     { path: '/products', component: ProductManage }
//   ]
// }

// // 路由守卫中动态添加路由
// router.beforeEach(async (to, from, next) => {
//   const userStore = useUserStore()

//   if (userStore.isLoggedIn && !userStore.permissions) {
//     // 获取用户权限
//     const permissions = await userStore.fetchPermissions()

//     // 根据权限动态添加路由
//     const routes = asyncRoutes[permissions.role] || []
//     routes.forEach(route => router.addRoute(route))

//     // 重新进入当前路由
//     next({ ...to, replace: true })
//   } else {
//     next()
//   }
// })

// 导出路由实例
export default router
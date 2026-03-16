// src/stores/userStore.js
// 【代码作用】导入Pinia的defineStore方法，用于创建状态管理仓库
import { defineStore } from 'pinia'
//创建一个名为'user'的store，管理用户相关的所有数据和方法
export const useUserStore = defineStore('user', {
    //state-响应式数据，存储用户信息和登录状态
    state: () => ({
        //登录状态持久化，从localStorage读取token，如果有就使用，没有就空字符串
        token: localStorage.getItem('token') || '', // 从localStorage获取token，初始值为空字符串
        //从localStorage读取用户信息，如果没有就null
        userInfo: JSON.parse(localStorage.getItem('userInfo')) || null, // 从localStorage获取用户信息，初始值为null   
        //登录按钮的加载状态，true时按钮禁用显示"登录中..."
        loading: false, // 登录按钮的加载状态，初始值为false
        //用户列表数据
        users: JSON.parse(localStorage.getItem('users')) || [], // 从localStorage获取用户列表，初始值为一个空数组
        userListLoading: false // 用户列表的加载状态，初始值为false
    }),
    //getters-计算属性，基于state的值计算出新的值，类似于Vue组件中的computed
    getters: {
        //判断是否已登录（是否有token）!!将token转成布尔值，有token就是true，没有就是false
        isLoggedIn: (state) => !!state.token,
        //判断是否是管理员
        isAdmin: (state) => {
            if (state.userInfo) return state.userInfo.role === 'admin';
            else return false;
        },
        //计算活跃用户数量
        activeUserCount: (state) => state.users.filter(u => u.status == 'active').length
    },
    //actions-方法，定义修改state的方法，可以包含异步操作，类似于Vue组件中的methods
    actions: {
        async login(username, password) {
            this.loading = true; // 开始登录，设置加载状态为true
            // 模拟登录请求，实际项目中应该替换为真实的API调用
            return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        //模拟验证用户名密码
                        if (username === 'zyb' && password === '2003') {
                            //生成假的token（实际项目中由后端返回）
                            const token = 'fake-token-' + Date.now()
                                //生成用户信息（实际项目中由后端返回）
                            const userInfo = {
                                    id: 1,
                                    username: 'zyb',
                                    role: 'admin'
                                }
                                //将token和用户信息保存到state
                            this.token = token
                            this.userInfo = userInfo
                                //localStorage持久化token和用户信息
                            localStorage.setItem('token', token)
                            localStorage.setItem('userInfo', JSON.stringify(userInfo))
                            this.loading = false; // 登录成功，设置加载状态为false
                            resolve({ success: true })
                        } else {
                            this.loading = false; // 登录失败，设置加载状态为false
                            reject(new Error('用户名或密码错误')) // 登录失败，返回错误信息
                        }
                    }, 1000)
                })
                //前端对接真实后端
                // const response = await request.post('/auth/login', {
                //     username,
                //     password
                // })
                //const response = await request.get('/users')
                //await request.put(`/users/${id}`, data)
                //await request.delete(`/users/${id}`)
        },
        //退出登录 
        logout() {
            // 清空state
            this.token = ''
            this.userInfo = null

            // 清除localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
        },
        //获取用户列表
        fetchUsers() {
            this.userListLoading = true; // 开始加载用户列表，设置加载状态为true
            setTimeout(() => {
                // 如果用户列表为空，初始化模拟数据
                if (this.users.length === 0) {
                    this.users = [
                        { id: 1, username: 'zyb', email: '1076383541@qq.com', role: 'admin', status: 'active', createTime: '2026-01-01' },
                        { id: 2, username: 'zhangsan', email: 'zhangsan@example.com', role: 'user', status: 'active', createTime: '2026-01-02' },
                        { id: 3, username: 'lisi', email: 'lisi@example.com', role: 'user', status: 'inactive', createTime: '2026-01-03' },
                        { id: 4, username: 'wangwu', email: 'wangwu@example.com', role: 'user', status: 'active', createTime: '2026-01-04' },
                        { id: 5, username: 'zhaoliu', email: 'zhaoliu@example.com', role: 'user', status: 'inactive', createTime: '2026-01-05' }
                    ]
                }
                this.userListLoading = false
                this.saveUsers()
            }, 500)
        },
        //添加用户
        addUser(user) {
            //用Date.now()生成唯一ID，实际项目中应该由后端生成
            const newUser = {
                ...user,
                id: Date.now(),
                createTime: new Date().toISOString().split('T')[0] // 生成当前日期作为创建时间，格式为YYYY-MM-DD
            }
            this.users.push(newUser)
            this.saveUsers()

        },
        //更新用户
        updateUser(id, data) {
            const index = this.users.findIndex(u => u.id === id)
            if (index !== -1) {
                //对象合并
                this.users[index] = {...this.users[index], ...data }
                this.saveUsers()
            }
        },
        //删除用户,保留id不相等的
        deleteUser(id) {
            this.users = this.users.filter(u => u.id !== id)
            this.saveUsers()
        },
        //批量删除用户,保留id不在ids数组中的
        batchDeleteUsers(ids) {
            this.users = this.users.filter(u => !ids.includes(u.id))
            this.saveUsers()
        },
        //保存用户列表到localStorage
        saveUsers() {
            localStorage.setItem('users', JSON.stringify(this.users))
        }
    }
})
// src/utils/request.js
// 【对接后端】axios封装，统一处理所有HTTP请求
// 真实项目中必须有的文件

import axios from 'axios'
import { ElMessage } from 'element-plus' // 假设使用Element Plus UI库
import router from '../router'

// 创建axios实例，配置基础URL和超时时间
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com', // 从环境变量读取
    timeout: 15000, // 15秒超时
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器 - 在每个请求发送前自动添加token
request.interceptors.request.use(
    config => {
        // 从localStorage获取token
        const token = localStorage.getItem('token')
        if (token) {
            // 将token添加到请求头的Authorization字段
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器 - 统一处理响应数据
request.interceptors.response.use(
    response => {
        // 【对接后端】假设后端返回格式为 { code: 200, data: {}, message: 'success' }
        // 可以根据实际后端接口格式调整
        const res = response.data

        if (res.code === 200) {
            // 只返回data部分，简化使用
            return res.data
        } else {
            // 业务错误统一处理
            ElMessage.error(res.message || '请求失败')
            return Promise.reject(new Error(res.message))
        }
    },
    error => {
        // HTTP错误统一处理
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 未授权，token过期
                    ElMessage.error('登录已过期，请重新登录')
                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    router.push('/login')
                    break
                case 403:
                    ElMessage.error('没有权限访问')
                    break
                case 500:
                    ElMessage.error('服务器错误')
                    break
                default:
                    ElMessage.error(`请求失败: ${error.response.status}`)
            }
        } else if (error.request) {
            ElMessage.error('网络连接失败，请检查网络')
        } else {
            ElMessage.error('请求配置错误')
        }
        return Promise.reject(error)
    }
)

export default request
// src/stores/productStore.js
// 【代码作用】管理商品相关的所有数据和方法
import { defineStore } from 'pinia'

// 【面试必考+手写】定义product store
export const useProductStore = defineStore('product', {

    // 【面试必考+手写】state - 响应式数据
    state: () => ({
        // 【模拟数据】商品列表
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        loading: false, // 加载状态
        categories: ['手机', '电脑', '配件', '家电'] // 商品分类（模拟数据）
    }),

    // 【面试必考+手写】getters - 计算属性
    getters: {
        // 商品总数
        totalCount: (state) => state.products.length,

        // 总库存
        totalStock: (state) => state.products.reduce((sum, p) => sum + p.stock, 0),

        // 总金额（库存总价值）
        totalValue: (state) => state.products.reduce((sum, p) => sum + (p.price * p.stock), 0),

        // 按分类统计库存
        stockByCategory: (state) => {
            const stats = {}
            state.products.forEach(p => {
                if (!stats[p.category]) {
                    stats[p.category] = 0
                }
                stats[p.category] += p.stock
            })
            return stats
        },

        // 低库存商品（库存小于10）
        lowStockProducts: (state) => state.products.filter(p => p.stock < 10)
    },

    // 【面试必考+手写】actions - 方法
    actions: {
        // 【模拟数据】获取商品列表
        fetchProducts() {
            this.loading = true

            /* ========== 【模拟数据】当前项目使用的模拟数据 ========== */
            setTimeout(() => {
                    if (this.products.length === 0) {
                        this.products = [
                            { id: 1, name: 'iPhone 15', price: 6999, stock: 100, category: '手机', status: 'active', createTime: '2024-01-01' },
                            { id: 2, name: 'MacBook Pro', price: 12999, stock: 50, category: '电脑', status: 'active', createTime: '2024-01-02' },
                            { id: 3, name: 'AirPods', price: 1299, stock: 200, category: '配件', status: 'active', createTime: '2024-01-03' },
                            { id: 4, name: 'iPad Pro', price: 7999, stock: 5, category: '电脑', status: 'inactive', createTime: '2024-01-04' },
                            { id: 5, name: '小米电视', price: 2999, stock: 30, category: '家电', status: 'active', createTime: '2024-01-05' }
                        ]
                    }
                    this.loading = false
                    this.saveToStorage()
                }, 500)
                /* ========== 模拟数据结束 ========== */
        },

        // 【核心】添加商品
        addProduct(product) {
            const newProduct = {
                ...product,
                id: Date.now(),
                price: Number(product.price),
                stock: Number(product.stock),
                createTime: new Date().toISOString().split('T')[0]
            }
            this.products.push(newProduct)
            this.saveToStorage()
        },

        // 【核心】更新商品
        updateProduct(id, data) {
            const index = this.products.findIndex(p => p.id === id)
            if (index !== -1) {
                this.products[index] = {...this.products[index], ...data }
                this.saveToStorage()
            }
        },

        // 【核心】删除商品
        deleteProduct(id) {
            this.products = this.products.filter(p => p.id !== id)
            this.saveToStorage()
        },

        // 批量删除
        batchDeleteProducts(ids) {
            this.products = this.products.filter(p => !ids.includes(p.id))
            this.saveToStorage()
        },

        // 保存到localStorage
        saveToStorage() {
            localStorage.setItem('products', JSON.stringify(this.products))
        }
    }
})

// src/api/product.js - 【对接后端】商品API封装
// import request from '../utils/request'

// export const productApi = {
//   // 获取商品列表
//   getProducts(params) {
//     return request.get('/products', { params })
//   },

//   // 获取单个商品
//   getProduct(id) {
//     return request.get(`/products/${id}`)
//   },

//   // 创建商品
//   createProduct(data) {
//     return request.post('/products', data)
//   },

//   // 更新商品
//   updateProduct(id, data) {
//     return request.put(`/products/${id}`, data)
//   },

//   // 删除商品
//   deleteProduct(id) {
//     return request.delete(`/products/${id}`)
//   },

//   // 批量删除
//   batchDeleteProducts(ids) {
//     return request.post('/products/batch-delete', { ids })
//   },

//   // 获取商品统计
//   getProductStats() {
//     return request.get('/products/stats')
//   }
// }
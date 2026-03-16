<!-- 
  页面名称：Login
  作用：用户登录页面，输入用户名密码进行登录
-->
<template>
  <!-- 【核心理解】flex居中布局 -->
  <!-- 整个容器占满视口，内容居中显示 -->
  <div class="login-container">
    <div class="login-box">
      <!-- 【修改】h2改成div，可以包含更多内容 -->
      <div class="login-header">
        <h2>后台管理系统</h2>
        <!-- 【新增】移动端隐藏的副标题 -->
        <p class="subtitle" v-if="!isMobile">欢迎回来，请登录您的账号</p>
      </div>

      <!-- @submit.prevent 阻止表单默认提交 -->
      <!-- 防止点击提交按钮时页面刷新 -->
      <form @submit.prevent="handleLogin">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label>用户名</label>
          <!-- v-model双向绑定 -->
          <!-- 输入的内容自动同步到username变量 -->
          <input 
            type="text" 
            v-model="username" 
            placeholder="请输入用户名" 
            required 
            :class="{ 'input-error': error && !username }"
          />
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label>密码</label>
          <!-- type="password" 隐藏输入内容 -->
          <input 
            type="password" 
            v-model="password" 
            placeholder="请输入密码" 
            autocomplete="off" 
            required 
            :class="{ 'input-error': error && !password }"
          />
        </div>

        <!-- 【新增】表单选项：记住密码和忘记密码（响应式布局） -->
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>记住密码</span>
          </label>
          <!-- 【新增】忘记密码链接，阻止默认跳转 -->
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
            忘记密码?
          </a>
        </div>

        <!-- 登录按钮 -->
        <div class="form-group">
          <button 
            type="submit" 
            class="login-button" 
            :disabled="loading"
            :class="{ 'loading': loading }"
          >
            <!-- 【修改】登录按钮内容改为动态显示 -->
            <span v-if="!loading">登录</span>
            <span v-else class="loading-text">
              <span class="spinner"></span>
              登录中...
            </span>
          </button>
        </div>

        <!-- v-if 错误提示 -->
        <!-- 【修改】错误提示增加图标和动画 -->
        <transition name="fade">
          <div v-if="error" class="error">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>
        </transition>

        <!-- 提示信息 -->
        <div class="hint" :class="{ 'mobile-hint': isMobile }">
          <p>提示：用户名 zyb，密码 2003</p>
          <!-- 【新增】移动端显示小字提示 -->
          <p v-if="isMobile" class="small-hint">点击登录体验系统</p>
        </div>

        <!-- 【新增】移动端显示注册链接 -->
        <div class="register-link" v-if="isMobile">
          还没有账号？ <a href="#" @click.prevent="handleRegister">立即注册</a>
        </div>
      </form>

      <!-- 【新增】其他登录方式（只在平板以上显示） -->
      <div class="other-login" v-if="!isMobile">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="social-icons">
          <button class="social-btn wechat">微信</button>
          <button class="social-btn qq">QQ</button>
          <button class="social-btn github">GitHub</button>
        </div>
      </div>
    </div>

    <!-- 【新增】背景装饰元素（只在平板以上显示） -->
    <div class="background-decoration" v-if="!isMobile">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'  // 【修改】增加导入
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 表单数据
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
// 【新增】记住密码功能
const rememberMe = ref(false)

// 【新增】响应式状态 - 监听窗口宽度
const windowWidth = ref(window.innerWidth)
const isMobile = ref(windowWidth.value < 768)  // 手机：小于768px

// 【新增】监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
  isMobile.value = windowWidth.value < 768
}

// 【新增】生命周期钩子
onMounted(() => {
  window.addEventListener('resize', handleResize)
  // 如果有记住的密码，自动填充（实际项目中需要解密存储）
  const savedUsername = localStorage.getItem('savedUsername')
  if (savedUsername && rememberMe.value) {
    username.value = savedUsername
  }
})

// 【新增】清理监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 处理登录逻辑
const handleLogin = async () => {
  // 【新增】前端表单验证
  if (!username.value || !password.value) {
    error.value = '用户名和密码不能为空'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 调用store中的登录方法
    await userStore.login(username.value, password.value)
    
    // 【新增】如果勾选记住密码，保存用户名
    if (rememberMe.value) {
      localStorage.setItem('savedUsername', username.value)
    } else {
      localStorage.removeItem('savedUsername')
    }
    
    // 登录成功，跳转到首页
    router.push('/')
  } catch (err) {
    // 登录失败，显示错误信息
    error.value = err.message || '登录失败，请重试'
  } finally {
    // 重置加载状态
    loading.value = false
  }
}

// 【新增】忘记密码处理
const handleForgotPassword = () => {
  alert('请联系管理员重置密码')
}

// 【新增】注册处理
const handleRegister = () => {
  alert('注册功能开发中')
}

// 【对接后端】真实项目中可以增加的功能
// 1. 表单验证库（如vee-validate）
// 2. 回车键快捷登录
// 3. 加载状态动画
// 4. 图形验证码
</script>

<style scoped>
/* ===== 基础样式（所有设备通用）===== */
.login-container {
  min-height: 100vh;  /* 【修改】height 改为 min-height，防止内容溢出 */
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* 【新增】相对定位，用于放置背景装饰 */
  position: relative;
  overflow: hidden;  /* 防止装饰元素溢出 */
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  /* 【新增】层级，确保在装饰元素上面 */
  z-index: 10;
  /* 【新增】动画效果 */
  animation: slideUp 0.5s ease;
}

/* 【新增】登录框入场动画 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 【修改】h2样式 */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 8px;  /* 【修改】调整间距 */
}

/* 【新增】副标题样式 */
.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;  /* 【修改】增加内边距，提高触控体验 */
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;  /* 【修改】增大字体，移动端更好看 */
  transition: all 0.3s;  /* 【修改】增加过渡效果 */
  box-sizing: border-box;  /* 【新增】确保padding不影响宽度 */
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);  /* 【新增】聚焦效果 */
}

/* 【新增】输入框错误状态 */
.input-error {
  border-color: #ff4444;
}

.input-error:focus {
  border-color: #ff4444;
  box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1);
}

/* 【新增】表单选项行 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  cursor: pointer;
}

.remember-me input {
  width: auto;
  margin: 0;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #5a67d8;
  text-decoration: underline;
}

button {
  width: 100%;
  padding: 14px;  /* 【修改】增加内边距 */
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;  /* 【新增】加粗 */
  cursor: pointer;
  transition: all 0.3s;
  position: relative;  /* 【新增】用于loading效果 */
  overflow: hidden;  /* 【新增】防止波纹溢出 */
}

button:hover {
  background: #5a67d8;
  transform: translateY(-1px);  /* 【新增】微动效 */
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;  /* 【修改】禁用时无动画 */
  box-shadow: none;
}

/* 【新增】loading状态按钮 */
button.loading {
  background: #5a67d8;
  cursor: wait;
}

/* 【新增】loading文字样式 */
.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 【新增】loading动画 */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 【修改】错误提示样式 */
.error {
  color: #ff4444;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

/* 【新增】错误提示动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.hint {
  margin-top: 20px;
  padding: 12px;  /* 【修改】增加内边距 */
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 13px;  /* 【修改】稍微增大 */
  color: #999;
  text-align: center;
  line-height: 1.5;  /* 【新增】行高 */
}

.hint p {
  margin: 0;
}

/* 【新增】移动端提示小字 */
.small-hint {
  font-size: 12px;
  color: #ccc;
  margin-top: 5px !important;
}

/* 【新增】其他登录方式区域 */
.other-login {
  margin-top: 30px;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 20px;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #ddd;
  z-index: 1;
}

.divider span {
  position: relative;
  z-index: 2;
  background: white;
  padding: 0 10px;
  color: #999;
  font-size: 13px;
}

.social-icons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.social-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.social-btn:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.social-btn.wechat:hover {
  color: #07c160;
  border-color: #07c160;
}

.social-btn.qq:hover {
  color: #12b7f5;
  border-color: #12b7f5;
}

.social-btn.github:hover {
  color: #333;
  border-color: #333;
}

/* 【新增】移动端注册链接 */
.register-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 【新增】背景装饰元素 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 10s infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: 50px;
  right: 50px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* ===== 响应式设计 - 平板（768px - 1024px）===== */
@media screen and (max-width: 1024px) {
  .login-box {
    width: 380px;  /* 稍微缩小 */
    padding: 35px;
  }
}

/* ===== 响应式设计 - 手机（小于768px）===== */
@media screen and (max-width: 768px) {
  .login-container {
    background: white;  /* 移动端简化背景 */
    align-items: flex-start;  /* 靠顶部对齐 */
    padding-top: 50px;  /* 增加顶部间距 */
  }

  .login-box {
    width: 90%;  /* 宽度占满 */
    max-width: 400px;
    padding: 30px 20px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    margin: 0 auto;
    animation: slideUpMobile 0.4s ease;  /* 移动端简化动画 */
  }

  /* 移动端简化的入场动画 */
  @keyframes slideUpMobile {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .login-header h2 {
    font-size: 24px;  /* 调整标题大小 */
  }

  .form-group {
    margin-bottom: 15px;  /* 减少间距 */
  }

  input {
    padding: 14px;  /* 增大触控区域 */
    font-size: 16px;  /* 防止iOS自动缩放 */
  }

  button {
    padding: 16px;  /* 增大按钮触控区域 */
    font-size: 18px;
  }

  .form-options {
    margin-bottom: 15px;
  }

  /* 移动端勾选框更大 */
  .remember-me input {
    width: 18px;
    height: 18px;
  }

  .hint {
    margin-top: 15px;
    padding: 10px;
    font-size: 12px;
  }

  /* 移动端点击效果 */
  button:active {
    transform: scale(0.98);
  }

  .forgot-password:active {
    opacity: 0.7;
  }
}

/* ===== 响应式设计 - 超小屏手机（小于375px）===== */
@media screen and (max-width: 375px) {
  .login-box {
    width: 95%;
    padding: 20px 15px;
  }

  .login-header h2 {
    font-size: 22px;
  }

  input, button {
    padding: 12px;
    font-size: 15px;
  }

  .form-options {
    font-size: 13px;
  }

  .hint {
    font-size: 11px;
    padding: 8px;
  }
}

/* ===== 横屏模式优化 ===== */
@media screen and (max-height: 600px) and (orientation: landscape) {
  .login-container {
    align-items: center;
    padding: 20px 0;
  }

  .login-box {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .login-header {
    margin-bottom: 15px;
  }

  .login-header h2 {
    font-size: 20px;
  }
}
</style>
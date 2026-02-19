<template>
  <div id="userLoginPage">
    <div class="login-shell">
      <section class="intro-panel">
        <p class="eyebrow">Sion Picture</p>
        <h1 class="headline">欢迎登录云图库</h1>
        <p class="summary">企业级智能协同云图库，统一管理视觉素材，安全共享团队灵感。</p>
        <ul class="feature-list">
          <li>
            <SafetyCertificateOutlined />
            多角色权限控制
          </li>
          <li>
            <CloudSyncOutlined />
            云端同步与版本管理
          </li>
          <li>
            <TeamOutlined />
            团队协作与空间分组
          </li>
        </ul>
      </section>

      <section class="form-panel">
        <h2 class="title">账号登录</h2>
        <p class="desc">输入账号密码进入工作台</p>
        <a-form
          :model="formState"
          name="basic"
          autocomplete="off"
          layout="vertical"
          @finish="handleSubmit"
        >
          <a-form-item
            label="账号"
            name="userAccount"
            :rules="[{ required: true, message: '请输入账号' }]"
          >
            <a-input v-model:value="formState.userAccount" placeholder="请输入账号" allow-clear />
          </a-form-item>
          <a-form-item
            label="密码"
            name="userPassword"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码不能小于 8 位' },
            ]"
          >
            <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
          </a-form-item>
          <div class="tips">
            没有账号？
            <RouterLink class="register-link" to="/user/register">去注册</RouterLink>
          </div>
          <a-form-item class="submit-item">
            <a-button type="primary" html-type="submit" block>登录</a-button>
          </a-form-item>
        </a-form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { postUser } from '@/api/user'
import { message } from 'ant-design-vue'
import { CloudSyncOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons-vue'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()
const getApiErrorMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const getErrorMessage = (error: unknown) => {
  return getApiErrorMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

const getSafeRedirectPath = () => {
  const redirectParam = route.query.redirect
  if (typeof redirectParam !== 'string' || !redirectParam) {
    return '/'
  }
  const decodedRedirect = decodeURIComponent(redirectParam)
  try {
    const redirectUrl = new URL(decodedRedirect, window.location.origin)
    if (redirectUrl.origin !== window.location.origin) {
      return '/'
    }
    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}` || '/'
  } catch {
    return decodedRedirect.startsWith('/') ? decodedRedirect : '/'
  }
}

const handleSubmit = async (values: API.UserLoginRequest) => {
  try {
    const res = await postUser(values)
    // 登录成功，把登录状态保存到全局状态中
    if (res.data.code === 0 && res.data.data) {
      await loginUserStore.fetchLoginUser()
      message.success('登录成功')
      const redirectPath = getSafeRedirectPath()
      const loginUserRole = loginUserStore.loginUser.userRole
      const targetPath =
        redirectPath.startsWith('/admin') && loginUserRole !== 'admin' ? '/' : redirectPath
      router.replace({
        path: targetPath,
        replace: true,
      })
    } else {
      message.error('登录失败：' + res.data.message)
    }
  } catch (error) {
    message.error('登录失败：' + getErrorMessage(error))
  }
}
</script>

<style scoped>
#userLoginPage {
  --page-bg-top: #f8fafd;
  --page-bg-bottom: #ecf2f8;
  --surface: #ffffff;
  --surface-soft: #f3f7fb;
  --line: #d4deea;
  --text-main: #1f2d3d;
  --text-subtle: #5d6f86;
  --brand: #345375;
  --brand-hover: #2a4563;

  padding: 8px 0;
}

.login-shell {
  max-width: 920px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(320px, 460px);
  gap: 20px;
}

.intro-panel {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: linear-gradient(170deg, var(--page-bg-top) 0%, var(--page-bg-bottom) 100%);
  padding: 28px 24px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.headline {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  color: var(--text-main);
}

.summary {
  margin: 12px 0 20px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-subtle);
}

.feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.feature-list li {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ccdaea;
  background: #f7faff;
  color: #30485f;
  border-radius: 12px;
  padding: 9px 12px;
}

.feature-list li :deep(svg) {
  color: #3e5f82;
  font-size: 16px;
}

.form-panel {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  padding: 24px 24px 10px;
}

.title {
  margin: 0;
  font-size: 24px;
  color: var(--text-main);
}

.desc {
  margin: 8px 0 18px;
  color: var(--text-subtle);
}

.tips {
  margin-bottom: 16px;
  color: var(--text-subtle);
  font-size: 13px;
  text-align: right;
}

.register-link {
  color: var(--brand);
}

#userLoginPage :deep(.ant-form-item-label > label) {
  color: var(--text-main);
  font-weight: 600;
}

#userLoginPage :deep(.ant-input),
#userLoginPage :deep(.ant-input-affix-wrapper) {
  min-height: 44px;
  border-radius: 12px;
  border-color: #b8c9dc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

#userLoginPage :deep(.ant-input-affix-wrapper .ant-input) {
  min-height: auto;
}

#userLoginPage :deep(.ant-input:focus),
#userLoginPage :deep(.ant-input-focused),
#userLoginPage :deep(.ant-input-affix-wrapper-focused) {
  border-color: var(--brand);
  box-shadow: 0 0 0 2px rgb(52 83 117 / 12%);
}

#userLoginPage :deep(.ant-btn-primary) {
  min-height: 44px;
  border-radius: 12px;
  background: var(--brand);
  border-color: var(--brand);
  font-weight: 600;
}

#userLoginPage :deep(.ant-btn-primary:hover),
#userLoginPage :deep(.ant-btn-primary:focus) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
    max-width: 520px;
  }

  .headline {
    font-size: 26px;
  }
}

@media (max-width: 576px) {
  .intro-panel,
  .form-panel {
    border-radius: 14px;
    padding: 18px 16px;
  }

  .headline {
    font-size: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  #userLoginPage :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

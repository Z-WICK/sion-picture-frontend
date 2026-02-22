<template>
  <div id="userLoginPage">
    <section class="auth-shell panel-card">
      <span class="auth-glow auth-glow--primary" aria-hidden="true" />
      <span class="auth-glow auth-glow--secondary" aria-hidden="true" />

      <div class="auth-grid">
        <section class="auth-story">
          <p class="story-kicker">SION PICTURE ACCESS</p>
          <h1 class="story-title">登录后继续你的图片工作流</h1>
          <p class="story-subtitle">聚焦检索、上传与协作，把素材管理变成一条连贯工作线。</p>

          <div class="story-pill-row" aria-label="核心能力">
            <span class="story-pill">
              <SafetyCertificateOutlined />
              权限安全
            </span>
            <span class="story-pill">
              <CloudSyncOutlined />
              同步归档
            </span>
            <span class="story-pill">
              <TeamOutlined />
              团队协作
            </span>
          </div>

          <div class="story-roadmap" aria-label="登录后可执行流程">
            <article class="roadmap-item">
              <span class="roadmap-index">01</span>
              <div class="roadmap-body">
                <p class="roadmap-title">精准检索</p>
                <p class="roadmap-desc">关键词 + 分类 + 标签，快速定位素材。</p>
              </div>
            </article>
            <article class="roadmap-item">
              <span class="roadmap-index">02</span>
              <div class="roadmap-body">
                <p class="roadmap-title">高效上传</p>
                <p class="roadmap-desc">单图与批量统一入口，减少重复配置。</p>
              </div>
            </article>
            <article class="roadmap-item">
              <span class="roadmap-index">03</span>
              <div class="roadmap-body">
                <p class="roadmap-title">空间协同</p>
                <p class="roadmap-desc">个人和团队空间共享同一操作体验。</p>
              </div>
            </article>
          </div>

          <div class="story-actions">
            <a-button ghost href="/" target="_blank">首页</a-button>
            <a-button ghost href="/gallery" target="_blank">公开图库</a-button>
            <a-button ghost :href="githubRepo" target="_blank" rel="noopener noreferrer">
              GitHub
            </a-button>
          </div>
        </section>

        <section class="auth-form">
          <div class="form-header">
            <p class="form-kicker">Account Sign In</p>
            <h2 class="form-title">账号登录</h2>
            <p class="form-subtitle">输入账号密码，进入工作台。</p>
          </div>

          <div class="mini-kpi-row form-kpi-row">
            <span class="mini-kpi">
              <strong>{{ accountLength }}</strong>
              <span>账号字符</span>
            </span>
            <span class="mini-kpi">
              <strong>{{ passwordLength }}</strong>
              <span>密码字符</span>
            </span>
            <span class="mini-kpi">
              <strong>{{ passwordStrength }}</strong>
              <span>强度</span>
            </span>
          </div>

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
              <a-input
                v-model:value="formState.userAccount"
                placeholder="请输入账号"
                autocomplete="username"
                allow-clear
              />
            </a-form-item>
            <a-form-item
              label="密码"
              name="userPassword"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码不能小于 8 位' },
              ]"
            >
              <a-input-password
                v-model:value="formState.userPassword"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
            </a-form-item>
            <div class="form-footnote">
              没有账号？
              <RouterLink class="register-link" to="/user/register">立即注册</RouterLink>
            </div>
            <a-form-item class="submit-item">
              <a-button type="primary" html-type="submit" block>
                <template #icon>
                  <ArrowRightOutlined />
                </template>
                进入工作台
              </a-button>
            </a-form-item>
          </a-form>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { postUser } from '@/api/user'
import { message } from 'ant-design-vue'
import {
  ArrowRightOutlined,
  CloudSyncOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'

const githubRepo = 'https://github.com/Z-WICK/sion-picture-frontend'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})
const accountLength = computed(() => formState.userAccount?.trim().length ?? 0)
const passwordLength = computed(() => formState.userPassword?.length ?? 0)
const passwordStrength = computed(() => {
  if (passwordLength.value >= 12) {
    return '稳健'
  }
  if (passwordLength.value >= 8) {
    return '中等'
  }
  return '较弱'
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
  --line: #cfdceb;
  --line-strong: #b7cadf;
  --text-main: #1f3248;
  --text-subtle: #5d738b;
  --brand: #355273;
  --brand-hover: #284562;

  padding: 10px 0;
}

.auth-shell {
  max-width: 1120px;
  margin: 0 auto;
  padding: 18px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(128% 112% at 0% 0%, rgb(208 223 241 / 35%) 0%, transparent 58%),
    radial-gradient(132% 120% at 96% 98%, rgb(231 240 251 / 42%) 0%, transparent 60%),
    linear-gradient(180deg, #fcfeff 0%, #eef4fc 100%);
}

.auth-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(2px);
}

.auth-glow--primary {
  width: 280px;
  height: 280px;
  top: -150px;
  left: -90px;
  background: radial-gradient(circle, rgb(176 199 225 / 42%) 0%, rgb(176 199 225 / 0%) 70%);
}

.auth-glow--secondary {
  width: 320px;
  height: 320px;
  right: -130px;
  bottom: -180px;
  background: radial-gradient(circle, rgb(173 197 223 / 38%) 0%, rgb(173 197 223 / 0%) 72%);
}

.auth-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 420px);
  gap: 14px;
  align-items: stretch;
}

.auth-story {
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background: linear-gradient(180deg, rgb(255 255 255 / 92%) 0%, rgb(237 245 253 / 92%) 100%);
  padding: 20px;
  display: grid;
  align-content: start;
  gap: 14px;
}

.story-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #60768d;
}

.story-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.18;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.story-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-subtle);
  max-width: 520px;
}

.story-pill-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.story-pill {
  min-height: 32px;
  border-radius: 999px;
  border: 1px solid #c7d8eb;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2d4968;
  font-size: 12px;
}

.story-pill :deep(svg) {
  font-size: 14px;
  color: #3d5d80;
}

.story-roadmap {
  display: grid;
  gap: 8px;
}

.roadmap-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  border: 1px solid #ccdbeb;
  border-radius: 11px;
  background: rgb(247 251 255 / 94%);
  padding: 10px;
}

.roadmap-index {
  width: 30px;
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid #bcd0e6;
  background: linear-gradient(180deg, #fefeff 0%, #e9f2fb 100%);
  display: grid;
  place-items: center;
  color: #2f4d6f;
  font-size: 11px;
  font-weight: 700;
}

.roadmap-body {
  display: grid;
  gap: 2px;
}

.roadmap-title {
  margin: 0;
  color: #233d5a;
  font-size: 13px;
  font-weight: 600;
}

.roadmap-desc {
  margin: 0;
  color: #627a92;
  font-size: 12px;
  line-height: 1.55;
}

.story-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.auth-form {
  border: 1px solid var(--line);
  border-radius: 14px;
  background:
    radial-gradient(130% 140% at 100% 0%, rgb(198 217 238 / 20%) 0%, transparent 58%),
    linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  padding: 20px 18px 12px;
  display: grid;
  align-content: start;
}

.form-header {
  margin-bottom: 12px;
}

.form-kicker {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #647d95;
}

.form-title {
  margin: 0;
  font-size: 23px;
  line-height: 1.2;
  color: var(--text-main);
}

.form-subtitle {
  margin: 6px 0 0;
  color: var(--text-subtle);
  font-size: 13px;
}

.form-kpi-row {
  margin-bottom: 12px;
}

.form-footnote {
  margin-top: 2px;
  margin-bottom: 14px;
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
  min-height: 39px;
  border-radius: 10px;
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
  min-height: 40px;
  border-radius: 10px;
  background: var(--brand);
  border-color: var(--brand);
  font-weight: 600;
}

#userLoginPage :deep(.ant-btn-primary:hover),
#userLoginPage :deep(.ant-btn-primary:focus) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
}

@media (max-width: 960px) {
  .auth-shell {
    max-width: 680px;
    padding: 14px;
  }

  .auth-grid {
    grid-template-columns: 1fr;
  }

  .story-title {
    font-size: 26px;
  }
}

@media (max-width: 576px) {
  .auth-shell {
    padding: 10px;
  }

  .auth-story,
  .auth-form {
    padding: 14px 12px;
  }

  .story-title {
    font-size: 22px;
  }

  .story-pill {
    flex: 1 1 110px;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  #userLoginPage :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

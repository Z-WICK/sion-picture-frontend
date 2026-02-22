<template>
  <div id="mySpacePage" class="page-shell my-space-shell">
    <section class="redirect-card" :class="`is-${phase}`">
      <header class="card-head">
        <div class="status-head-row">
          <p class="status-kicker">My Space</p>
          <span class="status-chip" :class="`is-${phase}`">{{ phaseLabel }}</span>
        </div>
        <h1 class="status-title">{{ statusTitle }}</h1>
        <p class="status-description">{{ statusDescription }}</p>
      </header>

      <div class="progress-track" role="progressbar" :aria-valuenow="progressValue" aria-valuemin="0" aria-valuemax="100">
        <span class="progress-value" :style="{ width: `${progressValue}%` }" />
      </div>

      <div class="status-meta-row" aria-label="当前状态细节">
        <span class="status-meta-item">
          <strong>{{ currentStepLabel }}</strong>
          <span>当前阶段</span>
        </span>
        <span v-if="countdownVisible" class="status-meta-item">
          <strong>{{ redirectCountdown }}s</strong>
          <span>自动跳转</span>
        </span>
        <span class="status-meta-item">
          <strong>{{ targetLabel }}</strong>
          <span>目标页面</span>
        </span>
      </div>

      <div class="status-actions">
        <a-button
          v-if="phase === 'checking'"
          type="primary"
          :icon="h(LoadingOutlined)"
          loading
          disabled
        >
          正在检查
        </a-button>

        <template v-else-if="phase === 'routing'">
          <a-button type="primary" @click="goToTargetSpace" :icon="h(ArrowRightOutlined)">
            立即进入空间
          </a-button>
          <a-button @click="router.replace('/gallery')">返回图库</a-button>
        </template>

        <template v-else-if="phase === 'needLogin'">
          <a-button type="primary" @click="router.replace('/user/login')" :icon="h(LoginOutlined)">
            去登录
          </a-button>
          <a-button @click="router.replace('/gallery')">先逛图库</a-button>
        </template>

        <template v-else-if="phase === 'noSpace'">
          <a-button type="primary" @click="router.replace('/add_space')" :icon="h(PlusOutlined)">
            创建空间
          </a-button>
          <a-button @click="router.replace('/gallery')">返回图库</a-button>
        </template>

        <template v-else>
          <a-button type="primary" @click="checkUserSpace" :icon="h(ReloadOutlined)">重试</a-button>
          <a-button @click="router.replace('/')">回到首页</a-button>
        </template>
      </div>

      <p v-if="phase === 'error' && errorDetail" class="error-text">{{ errorDetail }}</p>

      <ul class="status-steps" aria-label="跳转流程">
        <li :class="stepClass('auth')">校验登录状态</li>
        <li :class="stepClass('query')">查询个人空间</li>
        <li :class="stepClass('route')">跳转目标页面</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ArrowRightOutlined,
  LoadingOutlined,
  LoginOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { postSpaceListPageVo } from '@/api/space'

type Phase = 'checking' | 'routing' | 'needLogin' | 'noSpace' | 'error'
type FlowStep = 'auth' | 'query' | 'route'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const phase = ref<Phase>('checking')
const errorDetail = ref('')
const targetSpacePath = ref('/gallery')
const redirectCountdown = ref(0)

let countdownTimer: number | undefined

const statusTitle = computed(() => {
  if (phase.value === 'checking') {
    return '正在检查你的空间'
  }
  if (phase.value === 'routing') {
    return '空间已找到，即将进入'
  }
  if (phase.value === 'needLogin') {
    return '需要先登录账号'
  }
  if (phase.value === 'noSpace') {
    return '还没有创建个人空间'
  }
  return '加载我的空间失败'
})

const statusDescription = computed(() => {
  if (phase.value === 'checking') {
    return '系统正在同步登录状态和空间信息，请稍候。'
  }
  if (phase.value === 'routing') {
    return `将在 ${redirectCountdown.value} 秒后自动进入你的空间，也可以立即跳转。`
  }
  if (phase.value === 'needLogin') {
    return `将在 ${redirectCountdown.value} 秒后前往登录页。`
  }
  if (phase.value === 'noSpace') {
    return `将在 ${redirectCountdown.value} 秒后前往创建空间页面。`
  }
  return '网络波动或服务异常导致请求失败，请重试。'
})

const progressValue = computed(() => {
  if (phase.value === 'checking') {
    return 38
  }
  if (phase.value === 'routing') {
    return 100
  }
  if (phase.value === 'needLogin') {
    return 55
  }
  if (phase.value === 'noSpace') {
    return 76
  }
  return 24
})
const phaseLabel = computed(() => {
  if (phase.value === 'checking') {
    return '检测中'
  }
  if (phase.value === 'routing') {
    return '可进入'
  }
  if (phase.value === 'needLogin') {
    return '需登录'
  }
  if (phase.value === 'noSpace') {
    return '需创建'
  }
  return '异常'
})
const currentStepLabel = computed(() => {
  if (phase.value === 'checking') {
    return '查询空间'
  }
  if (phase.value === 'routing') {
    return '准备跳转'
  }
  if (phase.value === 'needLogin') {
    return '登录校验'
  }
  if (phase.value === 'noSpace') {
    return '空间创建'
  }
  return '重试等待'
})
const countdownVisible = computed(() => {
  return phase.value === 'routing' || phase.value === 'needLogin' || phase.value === 'noSpace'
})
const targetLabel = computed(() => {
  if (phase.value === 'routing') {
    return '空间详情'
  }
  if (phase.value === 'needLogin') {
    return '登录页'
  }
  if (phase.value === 'noSpace') {
    return '创建空间'
  }
  if (phase.value === 'error') {
    return '手动重试'
  }
  return '等待解析'
})

const clearCountdown = () => {
  if (countdownTimer !== undefined) {
    window.clearInterval(countdownTimer)
    countdownTimer = undefined
  }
}

const scheduleRedirect = (path: string, seconds: number) => {
  clearCountdown()
  redirectCountdown.value = seconds
  targetSpacePath.value = path
  countdownTimer = window.setInterval(() => {
    redirectCountdown.value -= 1
    if (redirectCountdown.value <= 0) {
      clearCountdown()
      router.replace(path)
    }
  }, 1000)
}

const requestWithTimeout = async (timeoutMs: number) => {
  const timeoutTask = new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error('请求超时，请稍后重试'))
    }, timeoutMs)
  })
  return Promise.race([
    postSpaceListPageVo({
      userId: loginUserStore.loginUser.id,
      current: 1,
      pageSize: 1,
    }),
    timeoutTask,
  ])
}

const goToTargetSpace = () => {
  clearCountdown()
  router.replace(targetSpacePath.value)
}

const checkUserSpace = async () => {
  clearCountdown()
  errorDetail.value = ''
  phase.value = 'checking'

  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    phase.value = 'needLogin'
    scheduleRedirect('/user/login', 3)
    return
  }

  try {
    const res = await requestWithTimeout(9000)
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '接口返回异常')
    }

    const firstSpace = res.data.data?.records?.[0]
    if (firstSpace?.id) {
      phase.value = 'routing'
      scheduleRedirect(`/space/${firstSpace.id}`, 2)
      return
    }

    phase.value = 'noSpace'
    scheduleRedirect('/add_space', 4)
  } catch (error: unknown) {
    phase.value = 'error'
    errorDetail.value = error instanceof Error ? error.message : '未知异常，请稍后重试'
  }
}

const stepClass = (step: FlowStep) => {
  if (phase.value === 'error') {
    return step === 'auth' ? 'is-done' : 'is-pending'
  }
  if (phase.value === 'checking') {
    return step === 'auth' ? 'is-done' : step === 'query' ? 'is-active' : 'is-pending'
  }
  if (phase.value === 'needLogin') {
    return step === 'auth' ? 'is-active' : 'is-pending'
  }
  if (phase.value === 'noSpace') {
    return step === 'route' ? 'is-active' : 'is-done'
  }
  return step === 'route' ? 'is-active' : 'is-done'
}

onMounted(() => {
  checkUserSpace()
})

onBeforeUnmount(() => {
  clearCountdown()
})
</script>

<style scoped>
.my-space-shell {
  min-height: calc(100vh - 164px);
  place-items: center;
  padding: clamp(16px, 3vw, 28px) 0;
}

.redirect-card {
  width: min(640px, 100%);
  border-radius: 22px;
  border: 1px solid #c9d8e7;
  padding: clamp(18px, 2.2vw, 28px);
  background:
    radial-gradient(120% 110% at 100% 0%, rgb(125 154 187 / 16%) 0%, transparent 58%),
    linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, rgb(243 248 254 / 94%) 100%);
  box-shadow:
    0 16px 34px rgb(28 49 70 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 76%);
  display: grid;
  gap: 14px;
}

.card-head {
  display: grid;
  gap: 8px;
}

.status-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.status-kicker {
  margin: 0;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #60748d;
}

.status-chip {
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #d2deeb;
  background: linear-gradient(180deg, #ffffff 0%, #edf5fc 100%);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  color: #5d7590;
  font-size: 11px;
  font-weight: 600;
}

.status-chip.is-routing {
  border-color: #96aec8;
  background: #dce9f7;
  color: #1f3b56;
}

.status-chip.is-needLogin,
.status-chip.is-noSpace {
  border-color: #b8c9dc;
  background: #e7eff8;
  color: #355273;
}

.status-chip.is-error {
  border-color: #d1a5ad;
  background: #f7e9ec;
  color: #8f3643;
}

.status-title {
  margin: 0;
  font-size: clamp(1.35rem, 2.3vw, 1.75rem);
  line-height: 1.24;
  letter-spacing: -0.012em;
  color: #1e3046;
}

.status-description {
  margin: 0;
  color: #5d7188;
  line-height: 1.66;
}

.progress-track {
  height: 8px;
  border-radius: 999px;
  border: 1px solid #c8d8e9;
  background: linear-gradient(180deg, #f8fbff 0%, #edf4fb 100%);
  overflow: hidden;
}

.progress-value {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #355273 0%, #6e8eb1 100%);
  transition: width 0.26s ease;
}

.status-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-meta-item {
  min-height: 32px;
  border-radius: 10px;
  border: 1px solid #d2deeb;
  background: linear-gradient(180deg, #ffffff 0%, #eef5fc 100%);
  padding: 4px 9px;
  display: inline-grid;
  gap: 1px;
}

.status-meta-item strong {
  font-size: 12px;
  line-height: 1.2;
  color: #2a4663;
}

.status-meta-item span {
  font-size: 11px;
  color: #61788f;
}

.status-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.status-actions :deep(.ant-btn) {
  min-height: 42px;
  padding-inline: 18px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.status-actions :deep(.ant-btn:focus-visible) {
  outline: 2px solid #6e8eb1;
  outline-offset: 2px;
}

.error-text {
  margin: 0;
  color: #b04252;
  font-size: 13px;
  line-height: 1.6;
}

.status-steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.status-steps li {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid #cfdceb;
  padding: 10px;
  font-size: 12px;
  line-height: 1.4;
  display: grid;
  align-content: center;
  background: linear-gradient(180deg, #ffffff 0%, #f3f8fe 100%);
  color: #688099;
}

.status-steps li.is-active {
  border-color: #92abc6;
  color: #213951;
  background: linear-gradient(180deg, #edf4fd 0%, #dfeaf8 100%);
}

.status-steps li.is-done {
  border-color: #abc0d6;
  color: #2d4968;
}

@media (max-width: 680px) {
  .my-space-shell {
    min-height: calc(100vh - 136px);
  }

  .status-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .status-steps {
    grid-template-columns: 1fr;
  }

  .status-meta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .status-meta-item:last-child {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .progress-value {
    transition: none;
  }
}
</style>

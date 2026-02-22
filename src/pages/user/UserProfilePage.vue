<template>
  <div id="userProfilePage" class="page-shell user-profile-shell">
    <section class="page-toolbar profile-hero">
      <span class="hero-glow hero-glow--one" aria-hidden="true" />
      <span class="hero-glow hero-glow--two" aria-hidden="true" />

      <div class="profile-hero-main">
        <div class="identity-block">
          <a-avatar class="identity-avatar" :size="70" :src="formState.userAvatar || undefined">
            {{ displayName.slice(0, 1) }}
          </a-avatar>
          <div class="identity-content">
            <p class="identity-kicker">Profile Center</p>
            <h2 class="page-title">{{ displayName }}</h2>
            <p class="page-subtitle">{{ identitySubtitle }}</p>
          </div>
        </div>

        <a-space size="small" class="page-toolbar-actions profile-hero-actions">
          <a-button ghost href="/gallery" target="_blank">公开图库</a-button>
          <a-button ghost href="/my_space" target="_blank">我的空间</a-button>
          <a-button :loading="submitting" @click="resetForm">恢复当前资料</a-button>
        </a-space>
      </div>

      <div class="mini-kpi-row profile-kpi-row">
        <span class="mini-kpi">
          <strong>{{ profileCompletion }}%</strong>
          <span>资料完整度</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ formState.userName?.length ?? 0 }}</strong>
          <span>昵称字符</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ formState.userProfile?.length ?? 0 }}</strong>
          <span>简介字符</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ displayRole }}</strong>
          <span>当前角色</span>
        </span>
      </div>
    </section>

    <section class="profile-layout">
      <section class="panel-card profile-editor-panel">
        <div class="panel-head">
          <h3 class="panel-title">编辑资料</h3>
          <p class="panel-subtitle">保存后将同步到你的公开身份展示。</p>
        </div>

        <a-form :model="formState" layout="vertical" autocomplete="off" @finish="handleSubmit">
          <a-form-item name="userName" label="昵称" :rules="[{ required: true, message: '请输入昵称' }]">
            <a-input
              v-model:value="formState.userName"
              :maxlength="30"
              placeholder="请输入昵称"
              allow-clear
            />
          </a-form-item>
          <a-form-item name="userAvatar" label="头像链接">
            <a-input
              v-model:value="formState.userAvatar"
              :maxlength="512"
              placeholder="请输入头像 URL"
              allow-clear
            />
          </a-form-item>
          <a-form-item name="userProfile" label="个人简介">
            <a-textarea
              v-model:value="formState.userProfile"
              :maxlength="200"
              :auto-size="{ minRows: 4, maxRows: 6 }"
              placeholder="请输入个人简介"
              show-count
            />
          </a-form-item>
          <p class="form-hint">建议使用一句话说明你的创作方向，方便团队快速识别身份。</p>
          <a-form-item class="profile-submit-row">
            <a-space>
              <a-button type="primary" html-type="submit" :loading="submitting">保存更新</a-button>
              <a-button @click="resetForm">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </section>

      <aside class="profile-side-column">
        <section class="panel-card profile-preview-panel">
          <div class="side-head">
            <h3 class="side-title">实时名片</h3>
            <span class="role-chip">{{ displayRole }}</span>
          </div>
          <article class="preview-card">
            <a-avatar :size="84" :src="formState.userAvatar || undefined">
              {{ displayName.slice(0, 1) }}
            </a-avatar>
            <p class="preview-name">{{ displayName }}</p>
            <p class="preview-bio">{{ formState.userProfile || '还没有填写个人简介' }}</p>
          </article>
        </section>

        <section class="panel-card profile-status-panel">
          <h3 class="side-title">资料完成清单</h3>
          <div class="status-list">
            <article v-for="item in completionItems" :key="item.key" class="status-item">
              <span class="status-icon" :class="{ 'is-done': item.done }">
                <CheckCircleFilled v-if="item.done" />
                <ClockCircleFilled v-else />
              </span>
              <div class="status-content">
                <p class="status-label">{{ item.label }}</p>
                <p class="status-desc">{{ item.description }}</p>
              </div>
              <strong class="status-state" :class="{ 'is-done': item.done }">
                {{ item.done ? '已完成' : '待完善' }}
              </strong>
            </article>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { postUserEdit } from '@/api/user'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { CheckCircleFilled, ClockCircleFilled } from '@ant-design/icons-vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()
const submitting = ref(false)

const formState = reactive<API.UserEditRequest>({
  userName: '',
  userAvatar: '',
  userProfile: '',
})
const profileCompletion = computed(() => {
  const items = [
    Boolean(formState.userName?.trim()),
    Boolean(formState.userAvatar?.trim()),
    Boolean(formState.userProfile?.trim()),
  ]
  return Math.round((items.filter(Boolean).length / items.length) * 100)
})
const displayName = computed(() => {
  const name = formState.userName?.trim()
  return name || loginUserStore.loginUser.userName?.trim() || '未设置昵称'
})
const displayRole = computed(() => (loginUserStore.loginUser.userRole === 'admin' ? '管理员' : '普通用户'))
const identitySubtitle = computed(() => {
  if (profileCompletion.value >= 100) {
    return '资料已完善，可直接用于公开展示。'
  }
  return `当前资料完整度 ${profileCompletion.value}% ，建议继续补充信息。`
})
const completionItems = computed(() => [
  {
    key: 'name',
    label: '昵称',
    description: '用于公开展示与团队识别',
    done: Boolean(formState.userName?.trim()),
  },
  {
    key: 'avatar',
    label: '头像',
    description: '建议使用清晰头像提升识别度',
    done: Boolean(formState.userAvatar?.trim()),
  },
  {
    key: 'profile',
    label: '个人简介',
    description: '一句话说明你的创作方向',
    done: Boolean(formState.userProfile?.trim()),
  },
])

const fillFormFromLoginUser = () => {
  const user = loginUserStore.loginUser
  formState.userName = user.userName ?? ''
  formState.userAvatar = user.userAvatar ?? ''
  formState.userProfile = user.userProfile ?? ''
}

const toLoginWithRedirect = async () => {
  await router.replace(`/user/login?redirect=${encodeURIComponent('/user/profile')}`)
}

const getApiErrorMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}

const getErrorMessage = (error: unknown) => {
  return getApiErrorMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

const resetForm = () => {
  fillFormFromLoginUser()
}

const handleSubmit = async () => {
  const name = formState.userName?.trim()
  if (!name) {
    message.error('请输入昵称')
    return
  }
  submitting.value = true
  try {
    const res = await postUserEdit({
      userName: name,
      userAvatar: formState.userAvatar?.trim() || undefined,
      userProfile: formState.userProfile?.trim() || undefined,
    })
    if (res.data.code === 0) {
      await loginUserStore.fetchLoginUser()
      fillFormFromLoginUser()
      message.success('保存成功')
    } else {
      message.error('保存失败：' + res.data.message)
    }
  } catch (error) {
    message.error('保存失败：' + getErrorMessage(error))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loginUserStore.fetchLoginUser()
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await toLoginWithRedirect()
    return
  }
  fillFormFromLoginUser()
})
</script>

<style scoped>
#userProfilePage {
  max-width: 1140px;
  margin: 0 auto;
}

.user-profile-shell {
  gap: 12px;
}

.profile-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(126% 108% at 0% 0%, rgb(213 227 243 / 34%) 0%, transparent 58%),
    radial-gradient(132% 112% at 100% 100%, rgb(226 237 248 / 36%) 0%, transparent 62%),
    linear-gradient(180deg, rgb(255 255 255 / 95%) 0%, #f0f6fd 100%);
}

.hero-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
}

.hero-glow--one {
  width: 240px;
  height: 240px;
  top: -130px;
  left: -80px;
  background: radial-gradient(circle, rgb(178 201 226 / 38%) 0%, rgb(178 201 226 / 0%) 72%);
}

.hero-glow--two {
  width: 260px;
  height: 260px;
  right: -120px;
  bottom: -150px;
  background: radial-gradient(circle, rgb(178 201 226 / 34%) 0%, rgb(178 201 226 / 0%) 74%);
}

.profile-hero-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.identity-block {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.identity-avatar {
  border: 2px solid rgb(255 255 255 / 80%);
  box-shadow: 0 8px 20px rgb(32 57 82 / 18%);
}

.identity-content {
  min-width: 0;
}

.identity-kicker {
  margin: 0 0 2px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5e7690;
}

.profile-kpi-row {
  position: relative;
  z-index: 1;
  margin-top: 10px;
}

.profile-layout {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  align-items: start;
}

.profile-editor-panel {
  background:
    radial-gradient(130% 140% at 100% 0%, rgb(206 222 239 / 18%) 0%, transparent 58%),
    linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
}

.panel-head {
  margin-bottom: 10px;
}

.panel-title {
  margin: 0;
  font-size: 17px;
  color: #223e5d;
}

.panel-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #627a93;
}

.form-hint {
  margin: -2px 0 14px;
  font-size: 12px;
  color: #627a93;
}

.profile-submit-row {
  margin-bottom: 0;
}

.profile-side-column {
  display: grid;
  gap: 12px;
  position: sticky;
  top: 12px;
}

.side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.side-title {
  margin: 0;
  font-size: 15px;
  color: #23374d;
}

.role-chip {
  min-height: 28px;
  border-radius: 999px;
  border: 1px solid #c7d7e8;
  background: #edf4fc;
  color: #355273;
  font-size: 11px;
  padding: 4px 9px;
  display: inline-flex;
  align-items: center;
}

.preview-card {
  border: 1px solid #d2dfec;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 14px 12px;
  text-align: center;
}

.preview-name {
  margin: 10px 0 6px;
  font-size: 16px;
  color: #22384f;
  word-break: break-word;
}

.preview-bio {
  margin: 0;
  color: #5e738a;
  line-height: 1.6;
}

.status-list {
  display: grid;
  gap: 8px;
}

.status-item {
  min-height: 60px;
  border-radius: 10px;
  border: 1px solid #d2dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 9px 10px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.status-icon {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid #ccdced;
  background: #f5f9ff;
  display: grid;
  place-items: center;
  color: #758ca4;
  font-size: 13px;
}

.status-icon.is-done {
  border-color: #a9c0d9;
  background: #e5f0fb;
  color: #3b5d82;
}

.status-content {
  min-width: 0;
}

.status-label {
  margin: 0;
  font-size: 12px;
  color: #2a4664;
}

.status-desc {
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 1.45;
  color: #6b8299;
}

.status-state {
  font-size: 12px;
  color: #6f869e;
  white-space: nowrap;
}

.status-state.is-done {
  color: #31557a;
}

@media (max-width: 992px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-side-column {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  #userProfilePage {
    max-width: 100%;
  }

  .profile-side-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .identity-block {
    align-items: flex-start;
  }

  .profile-hero-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .status-item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .status-state {
    grid-column: 2 / 3;
  }
}
</style>

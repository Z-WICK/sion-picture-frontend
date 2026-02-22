<template>
  <header id="globalHeader">
    <a-row class="header-row" :wrap="true" align="middle">
      <a-col flex="228px" class="brand-col">
        <div class="brand-shell">
          <button
            v-if="showSiderToggle"
            type="button"
            class="sider-toggle"
            aria-label="打开导航抽屉"
            @click="emit('toggleSider')"
          >
            <MenuOutlined />
          </button>
          <RouterLink to="/gallery">
            <div class="title-bar">
              <img class="logo" src="../assets/logo.svg" alt="logo" />
              <div class="title">灵感之源</div>
            </div>
          </RouterLink>
          <span class="route-chip">{{ currentMenuLabel }}</span>
        </div>
      </a-col>

      <a-col flex="auto" class="menu-col">
        <div class="menu-surface">
          <div class="menu-scroll">
            <a-menu
              class="nav-menu"
              v-model:selectedKeys="current"
              mode="horizontal"
              :items="items"
              @click="doMenuClick"
            />
          </div>
          <a-dropdown v-if="isAdmin">
            <a-button class="admin-center-btn">
              管理
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="goTo('/admin/userManage')">用户管理</a-menu-item>
                <a-menu-item @click="goTo('/admin/pictureManage')">图片管理</a-menu-item>
                <a-menu-item @click="goTo('/admin/spaceManage')">空间管理</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-col>

      <a-col flex="206px" class="user-col">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <ASpace class="user-trigger">
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
                <span class="user-identity">
                  <span class="user-name">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
                  <span class="user-meta">
                    {{ isAdmin ? '管理员模式' : '在线' }}
                  </span>
                </span>
              </ASpace>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="goUserProfile">
                    <UserOutlined />
                    个人信息
                  </a-menu-item>
                  <a-menu-item @click="goMySpace">
                    <TeamOutlined />
                    我的空间
                  </a-menu-item>
                  <a-menu-item v-if="isAdmin" @click="goTo('/admin/userManage')">
                    <AppstoreOutlined />
                    管理中心
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button class="login-btn" type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </header>
</template>

<script lang="ts" setup>
import { computed, h, ref, watch } from 'vue'
import {
  AppstoreOutlined,
  DownOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { postUserLogout } from '@/api/user'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

interface Props {
  showSiderToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSiderToggle: false,
})

const emit = defineEmits<{
  (e: 'toggleSider'): void
}>()

type HeaderMenuKey = '/gallery' | '/add_picture' | '/my_space'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const route = useRoute()

const showSiderToggle = computed(() => Boolean(props.showSiderToggle))
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 'admin')

const resolveSelectedKey = (path: string): HeaderMenuKey => {
  if (path.startsWith('/add_picture')) {
    return '/add_picture'
  }
  if (
    path.startsWith('/my_space') ||
    path.startsWith('/space/') ||
    path.startsWith('/space_analyze') ||
    path.startsWith('/add_space')
  ) {
    return '/my_space'
  }
  return '/gallery'
}

const current = ref<string[]>([resolveSelectedKey(route.path)])

watch(
  () => route.path,
  (path) => {
    current.value = [resolveSelectedKey(path)]
  },
  { immediate: true },
)

const menuLabelMap: Record<HeaderMenuKey, string> = {
  '/gallery': '公共图库',
  '/add_picture': '上传中心',
  '/my_space': '空间工作区',
}

const currentMenuLabel = computed(() => {
  const path = route.path
  if (path.startsWith('/admin')) {
    return '管理中心'
  }
  if (path.startsWith('/search_picture')) {
    return '以图搜图'
  }
  if (path.startsWith('/user/')) {
    return '账号中心'
  }
  if (path.startsWith('/picture/')) {
    return '图片详情'
  }
  return menuLabelMap[resolveSelectedKey(path)]
})

const goTo = async (path: string) => {
  await router.push(path)
}

const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

const doLogout = async () => {
  const res = await postUserLogout()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('注销成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败' + res.data.message)
  }
}

const goUserProfile = async () => {
  await router.push('/user/profile')
}

const goMySpace = async () => {
  await router.push('/my_space')
}

const items: MenuProps['items'] = [
  {
    key: '/gallery',
    icon: () => h(HomeOutlined),
    label: '图库',
    title: '公开图库',
  },
  {
    key: '/add_picture',
    icon: () => h(UploadOutlined),
    label: '上传',
    title: '创建图片',
  },
  {
    key: '/my_space',
    icon: () => h(TeamOutlined),
    label: '空间',
    title: '我的空间',
  },
]
</script>

<style scoped>
#globalHeader {
  --line: #d5dfeb;
  --line-strong: #b9cbde;
  --text-main: #1f2d3d;
  --text-subtle: #5d6f86;
  --brand: #355273;
  --brand-hover: #294565;
}

.header-row {
  position: relative;
  min-height: 64px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background:
    radial-gradient(124% 130% at 0% 0%, rgb(255 255 255 / 95%) 0%, transparent 62%),
    linear-gradient(180deg, #f9fbff 0%, #edf4fd 100%);
  padding: 7px 11px;
  column-gap: 9px;
  row-gap: 7px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    0 10px 24px rgb(33 52 74 / 6%);
}

.header-row::after {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgb(145 169 195 / 48%) 35%, transparent 100%);
  pointer-events: none;
}

.brand-col {
  min-width: 0;
}

.brand-shell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.sider-toggle {
  display: none;
  min-height: 36px;
  min-width: 36px;
  border: 1px solid #c7d5e5;
  border-radius: 10px;
  background: linear-gradient(180deg, #f7fbff 0%, #eaf2fc 100%);
  color: #355273;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.sider-toggle:hover {
  border-color: #9db3cc;
  background: #ecf3fb;
  color: #2b4868;
}

.title-bar {
  display: flex;
  align-items: center;
  min-height: 40px;
  border-radius: 11px;
  padding: 2px 7px 2px 3px;
  transition: background-color 0.2s ease;
}

.title-bar:hover {
  background: #edf3fb;
}

.title {
  color: var(--text-main);
  font-size: 16px;
  font-weight: 620;
  margin-left: 9px;
  letter-spacing: -0.01em;
}

.logo {
  height: 34px;
}

.route-chip {
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #cddced;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  color: #54708c;
  font-size: 10px;
  white-space: nowrap;
}

.menu-col {
  min-width: 0;
}

.menu-surface {
  border: 1px solid rgb(199 214 230 / 70%);
  border-radius: 12px;
  background: linear-gradient(180deg, rgb(255 255 255 / 82%) 0%, rgb(238 246 255 / 72%) 100%);
  padding: 2px 5px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
}

.menu-scroll {
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.menu-scroll::-webkit-scrollbar {
  display: none;
}

#globalHeader :deep(.nav-menu.ant-menu) {
  min-width: max-content;
  background: transparent;
  border-bottom: none;
  line-height: 34px;
}

#globalHeader :deep(.nav-menu.ant-menu-horizontal::after) {
  border-bottom: none;
}

#globalHeader :deep(.nav-menu .ant-menu-item) {
  position: relative;
  height: 34px;
  line-height: 34px;
  margin: 0 3px;
  padding-inline: 11px;
  border-radius: 9px;
  color: var(--text-subtle);
  font-size: 12px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

#globalHeader :deep(.nav-menu .ant-menu-item .anticon) {
  color: #617b96;
}

#globalHeader :deep(.nav-menu .ant-menu-item::after) {
  border-bottom: none !important;
}

#globalHeader :deep(.nav-menu .ant-menu-item::before) {
  content: '';
  position: absolute;
  inset: auto 12px 4px;
  height: 2px;
  border-radius: 999px;
  background: rgb(53 82 115 / 56%);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.2s ease;
}

#globalHeader :deep(.nav-menu .ant-menu-item:hover),
#globalHeader :deep(.nav-menu .ant-menu-item-active) {
  color: #2c496a;
  background: #e8f0fa;
}

#globalHeader :deep(.nav-menu .ant-menu-item-selected) {
  color: #1e3851;
  background: #dfeaf7;
  font-weight: 600;
}

#globalHeader :deep(.nav-menu .ant-menu-item-selected::before) {
  transform: scaleX(1);
}

.admin-center-btn {
  min-height: 30px;
  border-radius: 999px;
  border-color: #cadbed;
  background: linear-gradient(180deg, #fcfeff 0%, #f0f6fd 100%);
  color: #3e5b7b;
  padding-inline: 10px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.admin-center-btn:hover,
.admin-center-btn:focus {
  border-color: #aac0d7;
  background: #e8f1fa;
  color: #254460;
}

.user-col {
  min-width: 154px;
}

.user-login-status {
  display: flex;
  justify-content: flex-end;
}

.user-trigger {
  min-height: 40px;
  max-width: 190px;
  border-radius: 12px;
  border: 1px solid var(--line-strong);
  background: linear-gradient(180deg, #f8fbff 0%, #edf4fd 100%);
  color: var(--text-main);
  padding: 5px 10px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.user-trigger:hover {
  border-color: #95adc7;
  background: #edf4fb;
  box-shadow: 0 7px 18px rgb(36 56 79 / 8%);
}

.user-identity {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.user-name {
  max-width: 112px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.2;
}

.user-meta {
  max-width: 112px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  color: #698098;
  letter-spacing: 0.02em;
}

.login-btn {
  min-height: 38px;
  border-radius: 10px;
  padding-inline: 13px;
  background: var(--brand);
  border-color: var(--brand);
  font-weight: 600;
}

.login-btn:hover,
.login-btn:focus {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
}

@media (max-width: 992px) {
  .sider-toggle {
    display: inline-grid;
    place-items: center;
  }

  .route-chip {
    display: none;
  }

  .header-row {
    padding: 8px 9px;
    border-radius: 14px;
  }

  .title {
    font-size: 15px;
    margin-left: 7px;
  }

  #globalHeader :deep(.nav-menu .ant-menu-item) {
    margin: 0 2px;
    padding-inline: 9px;
  }

  .admin-center-btn {
    padding-inline: 8px;
    font-size: 11px;
  }

  .user-trigger {
    max-width: 170px;
    padding-inline: 8px;
  }
}

@media (max-width: 768px) {
  .brand-col {
    flex: 1 1 auto !important;
    max-width: none;
  }

  .user-col {
    flex: 0 0 auto !important;
    max-width: none;
  }

  .menu-col {
    order: 3;
    flex: 1 0 100% !important;
    max-width: 100%;
  }

  .title {
    display: none;
  }

  .admin-center-btn {
    min-height: 28px;
    padding-inline: 7px;
    font-size: 10px;
  }

  .user-trigger {
    min-height: 36px;
    border-radius: 9px;
    padding-inline: 7px;
  }

  .user-meta {
    display: none;
  }

  .user-name {
    max-width: 82px;
  }

  .login-btn {
    min-height: 36px;
    padding-inline: 10px;
  }

  #globalHeader :deep(.nav-menu .ant-menu-item) {
    height: 32px;
    line-height: 32px;
    border-radius: 8px;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  #globalHeader :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

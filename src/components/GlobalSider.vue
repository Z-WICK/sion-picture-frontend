<template>
  <div id="globalSider">
    <a-layout-sider v-if="showDesktopSider" width="196" class="sider-shell">
      <div class="sider-card">
        <div class="sider-accent" aria-hidden="true" />
        <div class="sider-heading">
          <div class="sider-heading-main">
            <p class="sider-eyebrow">Workspace</p>
            <span class="sider-badge">{{ teamSpaceCount }} 团队</span>
          </div>
          <h3 class="sider-title">导航菜单</h3>
          <p class="sider-subtitle">聚焦核心入口，快速切换协作空间</p>
        </div>
        <div class="sider-quick-actions" role="navigation" aria-label="快捷操作">
          <button
            v-for="action in quickActions"
            :key="action.key"
            type="button"
            class="quick-action-btn"
            @click="handleQuickAction(action.key)"
          >
            <component :is="action.icon" class="quick-action-icon" />
            <span>{{ action.label }}</span>
          </button>
        </div>
        <a-menu
          class="sider-menu"
          v-model:selectedKeys="current"
          mode="inline"
          :items="menuItems"
          @click="doMenuClick"
        />
      </div>
    </a-layout-sider>

    <a-drawer
      v-if="showMobileDrawer"
      class="sider-drawer"
      placement="left"
      :open="mobileOpen"
      :width="284"
      :closable="false"
      :mask-closable="true"
      @update:open="onDrawerOpenChange"
      @close="closeDrawer"
    >
      <div class="drawer-topbar">
        <div>
          <p class="drawer-eyebrow">Menu</p>
          <h4 class="drawer-title">站点导航</h4>
        </div>
        <a-button class="drawer-close-btn" type="text" aria-label="关闭导航" @click="closeDrawer">
          <template #icon>
            <CloseOutlined />
          </template>
        </a-button>
      </div>
      <div class="sider-card sider-card--drawer">
        <div class="sider-accent" aria-hidden="true" />
        <div class="sider-heading">
          <div class="sider-heading-main">
            <p class="sider-eyebrow">Workspace</p>
            <span class="sider-badge">{{ teamSpaceCount }} 团队</span>
          </div>
          <h3 class="sider-title">导航菜单</h3>
          <p class="sider-subtitle">聚焦核心入口，快速切换协作空间</p>
        </div>
        <div class="sider-quick-actions" role="navigation" aria-label="快捷操作">
          <button
            v-for="action in quickActions"
            :key="`mobile-${action.key}`"
            type="button"
            class="quick-action-btn"
            @click="handleQuickAction(action.key)"
          >
            <component :is="action.icon" class="quick-action-icon" />
            <span>{{ action.label }}</span>
          </button>
        </div>
        <a-menu
          class="sider-menu"
          v-model:selectedKeys="current"
          mode="inline"
          :items="menuItems"
          @click="doMenuClick"
        />
      </div>
    </a-drawer>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import {
  CloseOutlined,
  PictureOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import type { LocationQuery, RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { postSpaceUserListMy } from '@/api/spaceUser'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

interface Props {
  mobileOpen?: boolean
}

type QuickActionKey = 'gallery' | 'upload' | 'createTeam'

interface QuickActionItem {
  key: QuickActionKey
  label: string
  icon: Component
}

const props = withDefaults(defineProps<Props>(), {
  mobileOpen: false,
})

const emit = defineEmits<{
  (e: 'update:mobileOpen', value: boolean): void
}>()

const loginUserStore = useLoginUserStore()
const router = useRouter()

const isMobileViewport = ref(false)
const MOBILE_BREAKPOINT_PX = 992
const MENU_KEY_CREATE_TEAM = 'menu:create-team'
const MENU_KEY_TEAM_EMPTY = 'menu:team-empty'

const quickActions: QuickActionItem[] = [
  {
    key: 'gallery',
    label: '图库',
    icon: PictureOutlined,
  },
  {
    key: 'upload',
    label: '上传',
    icon: UploadOutlined,
  },
  {
    key: 'createTeam',
    label: '建团队',
    icon: TeamOutlined,
  },
]

const mobileOpen = computed(() => props.mobileOpen)
const showDesktopSider = computed(() => Boolean(loginUserStore.loginUser.id) && !isMobileViewport.value)
const showMobileDrawer = computed(() => Boolean(loginUserStore.loginUser.id) && isMobileViewport.value)

const closeDrawer = () => {
  emit('update:mobileOpen', false)
}

const onDrawerOpenChange = (nextOpen: boolean) => {
  emit('update:mobileOpen', nextOpen)
}

const handleViewportChange = () => {
  isMobileViewport.value = window.innerWidth <= MOBILE_BREAKPOINT_PX
  if (!isMobileViewport.value && props.mobileOpen) {
    closeDrawer()
  }
}

const resolveQueryType = (query: LocationQuery) => {
  const rawType = Array.isArray(query.type) ? query.type[0] : query.type
  if (rawType === undefined) {
    return undefined
  }
  const parsedType = Number(rawType)
  return Number.isNaN(parsedType) ? undefined : parsedType
}

const resolveCurrentMenuKey = (path: string, query: LocationQuery) => {
  if (path === '/add_space' && resolveQueryType(query) === SPACE_TYPE_ENUM.TEAM) {
    return MENU_KEY_CREATE_TEAM
  }
  return path
}

const navigate = (target: RouteLocationRaw) => {
  router.push(target)
  if (isMobileViewport.value) {
    closeDrawer()
  }
}

const navigateByMenuKey = (key: string) => {
  if (key === MENU_KEY_CREATE_TEAM) {
    navigate({
      path: '/add_space',
      query: {
        type: String(SPACE_TYPE_ENUM.TEAM),
      },
    })
    return
  }
  if (key.startsWith('/')) {
    navigate(key)
  }
}

const handleQuickAction = (key: QuickActionKey) => {
  if (key === 'gallery') {
    navigate('/gallery')
    return
  }
  if (key === 'upload') {
    navigate('/add_picture')
    return
  }
  navigate({
    path: '/add_space',
    query: {
      type: String(SPACE_TYPE_ENUM.TEAM),
    },
  })
}

onMounted(() => {
  handleViewportChange()
  window.addEventListener('resize', handleViewportChange, { passive: true })
})

const primaryMenuItems = [
  {
    key: '/gallery',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: MENU_KEY_CREATE_TEAM,
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]

const teamSpaceList = ref<API.SpaceUserVO[]>([])
const teamSpaceCount = computed(() => teamSpaceList.value.length)

const teamSpaceMenuItems = computed(() => {
  if (teamSpaceList.value.length < 1) {
    return [
      {
        key: MENU_KEY_TEAM_EMPTY,
        label: '暂未加入团队空间',
        disabled: true,
      },
    ]
  }
  return teamSpaceList.value.map((spaceUser) => ({
    key: `/space/${spaceUser.spaceId}`,
    label: spaceUser.space?.spaceName || `团队空间 #${spaceUser.spaceId}`,
  }))
})

const menuItems = computed(() => {
  return [
    {
      type: 'group',
      label: '核心入口',
      key: 'menu:group-primary',
      children: primaryMenuItems,
    },
    {
      type: 'group',
      label: teamSpaceList.value.length > 0 ? `团队空间 (${teamSpaceList.value.length})` : '团队空间',
      key: 'menu:group-team',
      children: teamSpaceMenuItems.value,
    },
  ]
})

const getErrorMessage = (error: unknown) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message
  if (responseMessage) {
    return responseMessage
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

const fetchTeamSpaceList = async () => {
  try {
    const res = await postSpaceUserListMy()
    if (res.data.code === 0 && res.data.data) {
      teamSpaceList.value = res.data.data
      return
    }
    teamSpaceList.value = []
    message.error('加载我的团队空间失败，' + res.data.message)
  } catch (error) {
    teamSpaceList.value = []
    message.error('加载我的团队空间失败，' + getErrorMessage(error))
  }
}

watch(
  () => loginUserStore.loginUser.id,
  (userId) => {
    if (userId) {
      fetchTeamSpaceList()
      return
    }
    teamSpaceList.value = []
    closeDrawer()
  },
  { immediate: true },
)

const current = ref<string[]>([
  resolveCurrentMenuKey(router.currentRoute.value.path, router.currentRoute.value.query),
])

const removeAfterEach = router.afterEach((to) => {
  current.value = [resolveCurrentMenuKey(to.path, to.query)]
  closeDrawer()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleViewportChange)
  removeAfterEach()
})

const doMenuClick = ({ key }: { key: string | number }) => {
  navigateByMenuKey(String(key))
}
</script>

<style scoped>
#globalSider {
  padding-right: 8px;
}

#globalSider .sider-shell {
  background: transparent !important;
  padding-top: 2px;
}

#globalSider .sider-card {
  position: relative;
  margin: 4px 0 4px 4px;
  border-radius: 14px;
  border: 1px solid #d1ddec;
  background: linear-gradient(180deg, rgb(250 253 255 / 94%) 0%, rgb(236 244 252 / 92%) 100%);
  backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    0 16px 30px rgb(32 51 73 / 8%);
  padding: 10px 8px 8px;
  overflow: hidden;
}

#globalSider .sider-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(132% 96% at 0% 0%, rgb(98 126 157 / 10%) 0%, transparent 62%),
    radial-gradient(90% 92% at 100% 100%, rgb(74 106 136 / 8%) 0%, transparent 66%);
  pointer-events: none;
}

#globalSider .sider-card:hover .sider-accent {
  opacity: 1;
}

#globalSider .sider-accent {
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #395a7e 0%, #aac2dc 100%);
  opacity: 0.76;
  transition: opacity 0.2s ease;
}

#globalSider .sider-heading {
  position: relative;
  z-index: 1;
  padding: 6px 8px 2px;
}

#globalSider .sider-heading-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

#globalSider .sider-eyebrow {
  margin: 0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #687a90;
}

#globalSider .sider-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  color: #34506f;
  background: rgb(220 232 246 / 90%);
  border: 1px solid rgb(154 179 204 / 34%);
}

#globalSider .sider-title {
  margin: 4px 0 0;
  font-size: 14px;
  color: #22384f;
}

#globalSider .sider-subtitle {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: #6a7f96;
}

#globalSider .sider-quick-actions {
  position: relative;
  z-index: 1;
  padding: 8px 8px 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

#globalSider .quick-action-btn {
  min-height: 42px;
  border-radius: 10px;
  border: 1px solid rgb(153 178 202 / 30%);
  background: rgb(234 243 252 / 82%);
  color: #2f4d6b;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 6px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

#globalSider .quick-action-btn:hover {
  background: rgb(215 229 244 / 96%);
  border-color: rgb(122 151 179 / 45%);
  color: #1d3854;
  transform: translateY(-1px);
}

#globalSider .quick-action-btn:focus-visible {
  outline: 2px solid #3d6188;
  outline-offset: 1px;
}

#globalSider .quick-action-icon {
  font-size: 13px;
}

#globalSider :deep(.sider-menu.ant-menu) {
  position: relative;
  z-index: 1;
  background: transparent;
}

#globalSider :deep(.sider-menu.ant-menu-inline) {
  border-inline-end: none;
}

#globalSider :deep(.sider-menu .ant-menu-item),
#globalSider :deep(.sider-menu .ant-menu-submenu-title) {
  position: relative;
  min-height: 38px;
  line-height: 38px;
  margin: 4px 0;
  border-radius: 9px;
  color: #495d74;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

#globalSider :deep(.sider-menu .ant-menu-item .anticon),
#globalSider :deep(.sider-menu .ant-menu-submenu-title .anticon) {
  color: #60758d;
}

#globalSider :deep(.sider-menu .ant-menu-item::after) {
  border-inline-end: none;
}

#globalSider :deep(.sider-menu .ant-menu-item:hover),
#globalSider :deep(.sider-menu .ant-menu-submenu-title:hover),
#globalSider :deep(.sider-menu .ant-menu-item-active) {
  background: #e7eff9;
  color: #2b4868;
}

#globalSider :deep(.sider-menu .ant-menu-item-selected) {
  background: #dce9f6;
  color: #1f3851;
  font-weight: 600;
}

#globalSider :deep(.sider-menu .ant-menu-item-selected .anticon) {
  color: #365778;
}

#globalSider :deep(.sider-menu .ant-menu-item-selected::before) {
  content: '';
  position: absolute;
  left: 8px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 999px;
  background: #365778;
}

#globalSider :deep(.sider-menu .ant-menu-item-group-title) {
  padding-inline: 8px;
  margin-top: 10px;
  margin-bottom: 2px;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: #72859b;
}

#globalSider :deep(.sider-menu .ant-menu-item.ant-menu-item-disabled) {
  color: #8ea0b4 !important;
  background: rgb(232 240 248 / 72%);
}

#globalSider .drawer-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 4px 8px;
}

#globalSider .drawer-eyebrow {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6d8097;
}

#globalSider .drawer-title {
  margin: 3px 0 0;
  font-size: 16px;
  color: #1f344b;
}

#globalSider .drawer-close-btn {
  color: #365778;
}

#globalSider :deep(.sider-drawer .ant-drawer-content-wrapper) {
  box-shadow: 0 18px 44px rgb(27 46 68 / 18%);
}

#globalSider :deep(.sider-drawer .ant-drawer-content),
#globalSider :deep(.sider-drawer .ant-drawer-body) {
  background: linear-gradient(180deg, #f5f9fe 0%, #e9f0f8 100%);
}

#globalSider :deep(.sider-drawer .ant-drawer-body) {
  padding: 8px 6px 8px 8px;
}

#globalSider .sider-card--drawer {
  margin: 0;
  min-height: calc(100vh - 62px);
}

@media (max-width: 992px) {
  #globalSider {
    padding-right: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  #globalSider :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

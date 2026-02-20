<template>
  <header id="globalHeader">
    <a-row class="header-row" :wrap="false" align="middle">
      <a-col flex="228px" class="brand-col">
        <RouterLink to="/gallery">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.svg" alt="logo" />
            <div class="title">灵感之源</div>
          </div>
        </RouterLink>
      </a-col>

      <a-col flex="auto" class="menu-col">
        <a-menu
          class="nav-menu"
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>

      <a-col flex="220px" class="user-col">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <ASpace class="user-trigger">
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
                <span class="user-name">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
              </ASpace>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="goUserProfile">
                    <UserOutlined />
                    个人信息
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                  <a-menu-item @click="goMySpace">
                    <UserOutlined />
                    我的空间
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
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { postUserLogout } from '@/api/user'

const loginUserStore = useLoginUserStore()

const router = useRouter()
// 当前选中菜单
const current = ref<string[]>([])

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 监听路由变化，更新当前选中菜单
router.afterEach((to) => {
  current.value = [to.path]
})
//用户注销
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
// 菜单列表
const originItems = [
  {
    key: '/gallery',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
]

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    // 如果菜单项的key以/admin开头，则判断用户是否为管理员
    const menuKey = String(menu?.key ?? '')
    if (menuKey.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenus(originItems))
</script>

<style scoped>
#globalHeader {
  --line: #d5dfeb;
  --line-strong: #becde0;
  --text-main: #1f2d3d;
  --text-subtle: #5d6f86;
  --brand: #355273;
  --brand-hover: #294565;
}

.header-row {
  min-height: 74px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, #f9fbff 0%, #eef4fb 100%);
  padding: 10px 14px;
}

.title-bar {
  display: flex;
  align-items: center;
  min-height: 48px;
  border-radius: 12px;
  padding: 4px 8px 4px 4px;
  transition: background-color 0.2s ease;
}

.title-bar:hover {
  background: #edf3fb;
}

.title {
  color: var(--text-main);
  font-size: 18px;
  font-weight: 600;
  margin-left: 12px;
}

.logo {
  height: 42px;
}

.menu-col {
  min-width: 0;
}

#globalHeader :deep(.nav-menu.ant-menu) {
  background: transparent;
  border-bottom: none;
  line-height: 44px;
}

#globalHeader :deep(.nav-menu.ant-menu-horizontal::after) {
  border-bottom: none;
}

#globalHeader :deep(.nav-menu .ant-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: 0 6px;
  padding-inline: 14px;
  border-radius: 10px;
  color: var(--text-subtle);
  transition: color 0.2s ease, background-color 0.2s ease;
}

#globalHeader :deep(.nav-menu .ant-menu-item::after) {
  border-bottom: none !important;
}

#globalHeader :deep(.nav-menu .ant-menu-item:hover),
#globalHeader :deep(.nav-menu .ant-menu-item-active) {
  color: #2c496a;
  background: #e7eef8;
}

#globalHeader :deep(.nav-menu .ant-menu-item-selected) {
  color: #1e3851;
  background: #dde8f4;
  font-weight: 600;
}

.user-col {
  min-width: 160px;
}

.user-login-status {
  display: flex;
  justify-content: flex-end;
}

.user-trigger {
  min-height: 44px;
  max-width: 196px;
  border-radius: 12px;
  border: 1px solid var(--line-strong);
  background: #f7faff;
  color: var(--text-main);
  padding: 8px 12px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.user-trigger:hover {
  border-color: #9db3cb;
  background: #edf4fb;
}

.user-name {
  max-width: 118px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-btn {
  min-height: 44px;
  border-radius: 12px;
  padding-inline: 20px;
  background: var(--brand);
  border-color: var(--brand);
  font-weight: 600;
}

.login-btn:hover,
.login-btn:focus {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
}

@media (max-width: 900px) {
  .header-row {
    padding: 8px 10px;
  }

  .title {
    font-size: 16px;
    margin-left: 8px;
  }

  #globalHeader :deep(.nav-menu .ant-menu-item) {
    margin: 0 4px;
    padding-inline: 10px;
  }

  .user-trigger {
    max-width: 160px;
    padding-inline: 10px;
  }

  .user-name {
    max-width: 86px;
  }
}

@media (max-width: 768px) {
  .title {
    display: none;
  }

  .brand-col {
    flex: 0 0 64px !important;
    max-width: 64px;
  }

  .user-col {
    flex: 0 0 124px !important;
    max-width: 124px;
  }

  .user-trigger {
    min-height: 40px;
    border-radius: 10px;
    padding-inline: 8px;
  }

  .login-btn {
    min-height: 40px;
    padding-inline: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  #globalHeader :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

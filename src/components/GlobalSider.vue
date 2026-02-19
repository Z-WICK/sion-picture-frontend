<template>
  <div id="globalSider">
    <a-layout-sider
      v-if="loginUserStore.loginUser.id"
      width="200"
      breakpoint="lg"
      collapsed-width="0"
      class="sider-shell"
    >
      <div class="sider-card">
        <div class="sider-heading">
          <p class="sider-eyebrow">Workspace</p>
          <h3 class="sider-title">导航菜单</h3>
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
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { postSpaceUserListMy } from '@/api/spaceUser'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()

// 固定的菜单列表
const fixedMenuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]

const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  // 如果用户没有团队空间，则只展示固定菜单
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  // 如果用户有团队空间，则展示固定菜单和团队空间菜单
  // 展示团队空间分组
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

// 加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await postSpaceUserListMy()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  // 登录才加载
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})

const router = useRouter()
// 当前要高亮的菜单项
const current = ref<string[]>([])
// 监听路由变化，更新高亮菜单项
router.afterEach((to) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<style scoped>
#globalSider {
  padding-right: 8px;
}

#globalSider .sider-shell {
  background: transparent !important;
}

#globalSider .sider-card {
  margin: 6px 0 6px 6px;
  border-radius: 16px;
  border: 1px solid #d5dfeb;
  background: linear-gradient(180deg, #f9fbfe 0%, #eef3f9 100%);
  padding: 10px;
}

#globalSider .sider-heading {
  padding: 8px 10px 6px;
}

#globalSider .sider-eyebrow {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #687a90;
}

#globalSider .sider-title {
  margin: 3px 0 0;
  font-size: 16px;
  color: #23374d;
}

#globalSider :deep(.sider-menu.ant-menu) {
  background: transparent;
}

#globalSider :deep(.sider-menu.ant-menu-inline) {
  border-inline-end: none;
}

#globalSider :deep(.sider-menu .ant-menu-item),
#globalSider :deep(.sider-menu .ant-menu-submenu-title) {
  min-height: 44px;
  line-height: 44px;
  margin: 6px 0;
  border-radius: 10px;
  color: #495d74;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

#globalSider :deep(.sider-menu .ant-menu-item .anticon),
#globalSider :deep(.sider-menu .ant-menu-submenu-title .anticon) {
  color: #60758d;
}

#globalSider :deep(.sider-menu .ant-menu-item:hover),
#globalSider :deep(.sider-menu .ant-menu-submenu-title:hover),
#globalSider :deep(.sider-menu .ant-menu-item-active) {
  background: #e6edf6;
  color: #2b4868;
}

#globalSider :deep(.sider-menu .ant-menu-item-selected) {
  background: #dce8f4;
  color: #1f3851;
  font-weight: 600;
}

#globalSider :deep(.sider-menu .ant-menu-item-selected .anticon) {
  color: #365778;
}

#globalSider :deep(.sider-menu .ant-menu-item-selected::after) {
  border-inline-end: 3px solid #365778;
}

#globalSider :deep(.sider-menu .ant-menu-item-group-title) {
  padding-inline: 12px;
  margin-top: 10px;
  margin-bottom: 2px;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: #72859b;
}

@media (max-width: 992px) {
  #globalSider {
    padding-right: 0;
  }

  #globalSider .sider-card {
    margin: 4px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  #globalSider :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

<template>
  <div id="basicLayout">
    <a-layout class="layout-shell">
      <a-layout-header class="header">
        <GlobalHeader :show-sider-toggle="showSiderToggle" @toggle-sider="toggleSiderDrawer" />
      </a-layout-header>
      <a-layout class="main-shell">
        <GlobalSider v-model:mobile-open="siderDrawerOpen" />
        <a-layout-content class="content">
          <section class="content-frame">
            <header class="context-bar">
              <p class="context-eyebrow">Sion Picture Workspace</p>
              <div class="context-main">
                <div class="context-main-copy">
                  <h1 class="context-title">{{ currentRouteTitle }}</h1>
                  <nav class="context-breadcrumb" aria-label="当前路径">
                    <ol class="breadcrumb-list">
                      <li
                        v-for="(label, index) in breadcrumbLabels"
                        :key="`${label}-${index}`"
                        class="breadcrumb-item"
                        :aria-current="index === breadcrumbLabels.length - 1 ? 'page' : undefined"
                      >
                        {{ label }}
                      </li>
                    </ol>
                  </nav>
                </div>
                <div class="context-meta">
                  <span class="context-chip">{{ currentRoutePath }}</span>
                  <span class="context-chip context-chip--soft">{{ workspaceMode }}</span>
                </div>
              </div>
              <div class="context-actions">
                <a-button size="small" ghost href="/gallery">公开图库</a-button>
                <a-button v-if="loginUserStore.loginUser.id" size="small" ghost href="/my_space">
                  我的空间
                </a-button>
              </div>
            </header>
            <div class="view-stage">
              <router-view />
            </div>
          </section>
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer">
        <a href="https://blog.johncloud.us.kg" target="_blank" rel="noopener noreferrer">
          SionNetWork by Sion
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()
const route = useRoute()
const siderDrawerOpen = ref(false)

const showSiderToggle = computed(() => Boolean(loginUserStore.loginUser.id))

const currentRouteTitle = computed(() => {
  if (route.path === '/gallery') {
    return '图片工作台'
  }
  if (route.path === '/space_analyze') {
    return '空间分析'
  }
  const metaTitle = route.meta?.title
  if (typeof metaTitle === 'string' && metaTitle.trim()) {
    return metaTitle
  }
  if (typeof route.name === 'string' && route.name.trim()) {
    return route.name
  }
  return '灵感画廊'
})

const currentRoutePath = computed(() => {
  if (route.path === '/gallery') {
    return '发现 · 收藏 · 创作'
  }
  return route.path
})
const workspaceMode = computed(() => {
  if (loginUserStore.loginUser.userRole === 'admin') {
    return '管理员视图'
  }
  return loginUserStore.loginUser.id ? '创作视图' : '游客视图'
})
const breadcrumbLabels = computed(() => {
  const labels = route.matched
    .map((item) => {
      const metaTitle = item.meta?.title
      if (typeof metaTitle === 'string' && metaTitle.trim()) {
        return metaTitle.trim()
      }
      if (typeof item.name === 'string' && item.name.trim()) {
        return item.name.trim()
      }
      return ''
    })
    .filter(Boolean)
  if (labels.length > 0) {
    return labels.slice(-3)
  }
  return [currentRouteTitle.value]
})

const toggleSiderDrawer = () => {
  if (!showSiderToggle.value) {
    return
  }
  siderDrawerOpen.value = !siderDrawerOpen.value
}

watch(
  () => route.fullPath,
  () => {
    siderDrawerOpen.value = false
  },
)
</script>

<style scoped>
#basicLayout {
  --app-bg-top: #f5f9fe;
  --app-bg-bottom: #e9f0f8;
  --surface: #f7fbff;
  --line: #d5dfeb;
  --text-subtle: #5e7086;
  --text-main: #253a51;
  --frame-line: rgb(170 191 214 / 54%);
  --frame-shadow: 0 18px 44px rgb(30 49 71 / 10%);

  min-height: 100vh;
  padding: 10px;
  background:
    radial-gradient(120% 130% at 0% 0%, #ffffff 0%, transparent 58%),
    radial-gradient(120% 130% at 100% 100%, #f3f7fd 0%, transparent 54%),
    linear-gradient(180deg, var(--app-bg-top) 0%, var(--app-bg-bottom) 100%);
}

#basicLayout .layout-shell {
  min-height: calc(100vh - 20px);
  background: transparent;
  position: relative;
}

#basicLayout .layout-shell::before {
  content: '';
  position: absolute;
  inset: 16px 16px 12px;
  border-radius: 18px;
  border: 1px solid rgb(200 215 231 / 42%);
  box-shadow: 0 26px 66px rgb(31 49 69 / 8%);
  pointer-events: none;
}

#basicLayout .header {
  height: auto;
  line-height: normal;
  padding: 0;
  margin-bottom: 10px;
  background: transparent;
  position: sticky;
  top: 8px;
  z-index: 30;
}

#basicLayout .main-shell {
  background: transparent;
}

#basicLayout .footer {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgb(247 251 255 / 80%);
  backdrop-filter: blur(4px);
  padding: 10px 14px;
  text-align: center;
  color: var(--text-subtle);
}

#basicLayout .footer a {
  color: var(--text-subtle);
  transition: color 0.2s ease;
}

#basicLayout .footer a:hover {
  color: var(--text-main);
}

#basicLayout .content {
  border: 1px solid var(--frame-line);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 88%) 0%, rgb(247 251 255 / 88%) 100%),
    var(--surface);
  margin-bottom: 14px;
  padding: 10px;
  min-height: 480px;
  box-shadow: var(--frame-shadow);
  overflow: hidden;
}

#basicLayout .content-frame {
  position: relative;
  border-radius: 14px;
  border: 1px solid rgb(217 229 241 / 86%);
  background: linear-gradient(180deg, rgb(255 255 255 / 96%) 0%, rgb(246 250 255 / 94%) 100%);
  overflow: hidden;
}

#basicLayout .content-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(96% 86% at 8% 0%, rgb(93 123 157 / 13%) 0%, transparent 58%),
    radial-gradient(82% 78% at 100% 100%, rgb(74 108 142 / 10%) 0%, transparent 62%);
  pointer-events: none;
}

#basicLayout .context-bar {
  position: relative;
  z-index: 1;
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgb(210 223 237 / 70%);
  background: linear-gradient(180deg, rgb(246 250 255 / 96%) 0%, rgb(238 246 255 / 78%) 100%);
}

#basicLayout .context-eyebrow {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #68809b;
}

#basicLayout .context-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
  margin-top: 4px;
}

#basicLayout .context-main-copy {
  min-width: 0;
}

#basicLayout .context-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.24;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

#basicLayout .context-breadcrumb {
  margin-top: 5px;
}

#basicLayout .breadcrumb-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

#basicLayout .breadcrumb-item {
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #d1deec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  color: #5e7590;
}

#basicLayout .breadcrumb-item[aria-current='page'] {
  border-color: #b6c9dd;
  color: #35506f;
  font-weight: 600;
}

#basicLayout .context-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

#basicLayout .context-chip {
  min-height: 24px;
  border-radius: 999px;
  border: 1px solid #cad9e8;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  color: #48627f;
}

#basicLayout .context-chip--soft {
  border-style: dashed;
  background: rgb(255 255 255 / 72%);
  color: #627a93;
}

#basicLayout .context-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

#basicLayout .view-stage {
  position: relative;
  z-index: 1;
  padding: 12px;
}

#basicLayout :deep(.ant-layout),
#basicLayout :deep(.ant-layout-sider),
#basicLayout :deep(.ant-layout-content),
#basicLayout :deep(.ant-layout-footer),
#basicLayout :deep(.ant-layout-header) {
  background: transparent;
}

@media (max-width: 992px) {
  #basicLayout {
    padding: 8px;
  }

  #basicLayout .layout-shell::before {
    inset: 12px 12px 10px;
  }

  #basicLayout .content {
    padding: 12px;
    min-height: 420px;
  }

  #basicLayout .context-title {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  #basicLayout {
    padding: 6px;
  }

  #basicLayout .header {
    top: 6px;
  }

  #basicLayout .layout-shell::before {
    inset: 8px 8px 8px;
    border-radius: 14px;
  }

  #basicLayout .content {
    border-radius: 14px;
    padding: 8px;
    min-height: 380px;
  }

  #basicLayout .context-bar {
    padding: 12px 12px 10px;
  }

  #basicLayout .context-main {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  #basicLayout .context-title {
    font-size: 18px;
  }

  #basicLayout .context-meta {
    justify-content: flex-start;
  }

  #basicLayout .context-chip {
    min-height: 22px;
    font-size: 10px;
  }

  #basicLayout .context-actions {
    margin-top: 6px;
    gap: 6px;
  }

  #basicLayout .view-stage {
    padding: 10px;
  }

  #basicLayout .footer {
    border-radius: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  #basicLayout :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

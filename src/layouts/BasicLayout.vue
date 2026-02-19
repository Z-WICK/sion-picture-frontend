<template>
  <div id="basicLayout">
    <a-layout class="layout-shell">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout class="main-shell">
        <GlobalSider />
        <a-layout-content class="content">
          <router-view />
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
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style scoped>
#basicLayout {
  --app-bg-top: #f5f9fe;
  --app-bg-bottom: #e9f0f8;
  --surface: #f7fbff;
  --line: #d5dfeb;
  --text-subtle: #5e7086;
  --text-main: #253a51;

  min-height: 100vh;
  padding: 12px;
  background:
    radial-gradient(120% 130% at 0% 0%, #ffffff 0%, transparent 58%),
    radial-gradient(120% 130% at 100% 100%, #f3f7fd 0%, transparent 54%),
    linear-gradient(180deg, var(--app-bg-top) 0%, var(--app-bg-bottom) 100%);
}

#basicLayout .layout-shell {
  min-height: calc(100vh - 24px);
  background: transparent;
}

#basicLayout .header {
  height: auto;
  line-height: normal;
  padding: 0;
  margin-bottom: 14px;
  background: transparent;
  position: sticky;
  top: 10px;
  z-index: 30;
}

#basicLayout .main-shell {
  background: transparent;
}

#basicLayout .footer {
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgb(247 251 255 / 80%);
  backdrop-filter: blur(4px);
  padding: 14px 16px;
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
  border: 1px solid var(--line);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 88%) 0%, rgb(247 251 255 / 88%) 100%),
    var(--surface);
  margin-bottom: 20px;
  padding: 20px;
  min-height: 520px;
  box-shadow: 0 16px 30px rgb(37 58 81 / 8%);
  overflow: hidden;
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
    padding: 10px;
  }

  #basicLayout .content {
    padding: 16px;
    min-height: 460px;
  }
}

@media (max-width: 768px) {
  #basicLayout {
    padding: 8px;
  }

  #basicLayout .header {
    top: 8px;
  }

  #basicLayout .content {
    border-radius: 14px;
    padding: 14px;
    min-height: 420px;
  }

  #basicLayout .footer {
    border-radius: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  #basicLayout :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

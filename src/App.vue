<template>
  <div id="app">
    <router-view v-if="isBlankLayout" />
    <LazyBasicLayout v-else />
  </div>
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { getHealth } from '@/api/health'

const LazyBasicLayout = defineAsyncComponent(() => import('@/layouts/BasicLayout.vue'))
const loginUserStore = useLoginUserStore()
const route = useRoute()
const isBlankLayout = computed(() => route.meta.layout === 'blank')
const appReady = ref(false)

const initMainApp = () => {
  if (appReady.value) {
    return
  }
  appReady.value = true
  loginUserStore.fetchLoginUser()
  getHealth().then((res) => {
    console.log(res)
  })
}

watch(isBlankLayout, (blank) => {
  if (!blank) {
    initMainApp()
  }
}, {
  immediate: true,
})

</script>

<style>
#app {
}
</style>

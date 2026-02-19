<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>
<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { getHealth } from '@/api/health'

const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()

getHealth().then((res) => {
  console.log(res)
})

</script>

<style>
#app {
}
</style>

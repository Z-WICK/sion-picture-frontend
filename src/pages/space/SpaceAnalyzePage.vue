<template>
  <div id="spaceAnalyzePage">
    <h2>
      空间图库分析 -
      <span v-if="queryAll">全部空间</span>
      <span v-else-if="queryPublic">公共图库</span>
      <span v-else>
        <a :href="`/space/${spaceId}`" target="_blank">空间 id：{{ spaceId }}</a>
      </span>
    </h2>
    <div style="margin-bottom: 16px" />
    <a-spin :spinning="checkingPermission">
      <a-result
        v-if="!checkingPermission && analyzeAccessState === 'not_found'"
        status="404"
        title="空间不存在"
        sub-title="该空间可能已被删除或不存在，请确认空间链接是否正确。"
      />
      <a-result
        v-else-if="!checkingPermission && analyzeAccessState === 'forbidden'"
        status="403"
        title="无权限访问空间分析"
        sub-title="当前账号无空间分析权限，请联系管理员授权后重试。"
      />
      <a-row v-else-if="!checkingPermission" :gutter="[16, 16]">
        <!-- 空间使用分析 -->
        <a-col :xs="24" :md="12">
          <SpaceUsageAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </a-col>
        <!-- 空间分类分析 -->
        <a-col :xs="24" :md="12">
          <SpaceCategoryAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </a-col>
        <!-- 标签分析 -->
        <a-col :xs="24" :md="12">
          <SpaceTagAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </a-col>
        <!-- 图片大小分段分析 -->
        <a-col :xs="24" :md="12">
          <SpaceSizeAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </a-col>
        <!-- 用户上传行为分析 -->
        <a-col :xs="24" :md="12">
          <SpaceUserAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
        </a-col>
        <!-- 空间使用排行分析 -->
        <a-col :xs="24" :md="12">
          <SpaceRankAnalyze
            v-if="isAdmin"
            :spaceId="spaceId"
            :queryAll="queryAll"
            :queryPublic="queryPublic"
          />
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
import SpaceUserAnalyze from '@/components/analyze/SpaceUserAnalyze.vue'
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { postSpaceAnalyzeUsage } from '@/api/analyze'
import { message } from 'ant-design-vue'

const route = useRoute()

// 空间 id
const spaceId = computed(() => {
  const id = Number(route.query?.spaceId)
  return Number.isNaN(id) ? undefined : id
})

// 是否查询所有空间
const queryAll = computed(() => {
  return !!route.query?.queryAll
})

// 是否查询公共空间
const queryPublic = computed(() => {
  return !!route.query?.queryPublic
})

// 判断用户是否为管理员
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
const isAdmin = computed(() => {
  return loginUser.userRole === 'admin'
})

const checkingPermission = ref(false)
const analyzeAccessState = ref<'ok' | 'forbidden' | 'not_found'>('ok')
const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))
const getHttpStatus = (error: unknown) => {
  const maybeResponse = (error as { response?: { status?: number } })?.response
  return maybeResponse?.status
}
const getApiCode = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { code?: number } } })?.response
  return maybeResponse?.data?.code
}

const checkAnalyzePermission = async () => {
  checkingPermission.value = true
  try {
    const res = await postSpaceAnalyzeUsage({
      queryAll: queryAll.value,
      queryPublic: queryPublic.value,
      spaceId: spaceId.value,
    })
    if (res.data.code === 403 || res.data.code === 40300) {
      analyzeAccessState.value = 'forbidden'
      return
    }
    if (res.data.code === 404 || res.data.code === 40400) {
      analyzeAccessState.value = 'not_found'
      return
    }
    if (res.data.code === 0) {
      analyzeAccessState.value = 'ok'
    } else {
      analyzeAccessState.value = 'ok'
      message.error(`加载空间分析失败，${res.data.message ?? '请稍后重试'}`)
    }
  } catch (error) {
    const status = getHttpStatus(error)
    const apiCode = getApiCode(error)
    if (status === 403 || apiCode === 40300) {
      analyzeAccessState.value = 'forbidden'
    } else if (status === 404 || apiCode === 40400) {
      analyzeAccessState.value = 'not_found'
    } else {
      analyzeAccessState.value = 'ok'
      message.error(`加载空间分析失败，${getErrorMessage(error)}`)
    }
  } finally {
    checkingPermission.value = false
  }
}

watch([spaceId, queryAll, queryPublic], checkAnalyzePermission, {
  immediate: true,
})
</script>

<style scoped>
#spaceAnalyzePage {
  margin-bottom: 16px;
}
</style>

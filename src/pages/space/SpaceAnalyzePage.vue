<template>
  <div id="spaceAnalyzePage" class="page-shell">
    <section class="page-toolbar space-analyze-toolbar">
      <div class="page-toolbar-main space-analyze-toolbar-main">
        <div class="space-analyze-title">
          <p class="analyze-kicker">Space Analyze</p>
          <h2 class="page-title">空间图库分析</h2>
          <p class="page-subtitle">{{ scopeSubtitle }}</p>
        </div>
        <a-space class="page-toolbar-actions space-analyze-actions">
          <a-button class="scope-btn" :class="{ 'is-active': isCurrentScope }" @click="switchScope('current')">
            当前范围
          </a-button>
          <a-button class="scope-btn" :class="{ 'is-active': queryPublic }" @click="switchScope('public')">
            公共图库
          </a-button>
          <a-button class="scope-btn" :class="{ 'is-active': queryAll }" @click="switchScope('all')">
            全部空间
          </a-button>
          <a-button
            v-if="spaceId"
            class="scope-btn scope-btn--ghost"
            type="primary"
            ghost
            :href="`/space/${spaceId}`"
            target="_blank"
          >
            查看空间
          </a-button>
        </a-space>
      </div>
      <div class="mini-kpi-row space-analyze-kpi">
        <span class="mini-kpi">
          <strong>{{ scopeLabel }}</strong>
          <span>分析范围</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ visibleModuleCount }}/{{ analyzeModuleCount }}</strong>
          <span>显示模块</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ accessStateText }}</strong>
          <span>权限状态</span>
        </span>
      </div>
    </section>

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
      <section
        v-else-if="!checkingPermission"
        :class="['content-slab', 'analyze-content', `analyze-content--${cardDensity}`]"
      >
        <div class="analyze-stage-head">
          <div class="table-meta-bar">
            <span class="table-meta-main">分析模块</span>
            <span class="table-meta-sub">{{ analysisMetaText }}</span>
          </div>
          <div class="analyze-controls">
            <a-segmented v-model:value="activeModuleKey" class="module-segment" :options="moduleFilterOptions" />
            <div class="density-switch" role="group" aria-label="图表密度">
              <button
                type="button"
                class="density-btn"
                :class="{ 'is-active': cardDensity === 'comfortable' }"
                :aria-pressed="cardDensity === 'comfortable'"
                @click="setCardDensity('comfortable')"
              >
                舒适
              </button>
              <button
                type="button"
                class="density-btn"
                :class="{ 'is-active': cardDensity === 'compact' }"
                :aria-pressed="cardDensity === 'compact'"
                @click="setCardDensity('compact')"
              >
                紧凑
              </button>
            </div>
          </div>
          <p v-if="analysisHint" class="analysis-hint">{{ analysisHint }}</p>
        </div>

        <a-row :gutter="analysisRowGutter">
          <a-col v-if="shouldShowModule('usage')" :xs="24" :md="analysisColSpan" class="analyze-module-col">
            <SpaceUsageAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
          </a-col>
          <a-col v-if="shouldShowModule('category')" :xs="24" :md="analysisColSpan" class="analyze-module-col">
            <SpaceCategoryAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
          </a-col>
          <a-col v-if="shouldShowModule('tag')" :xs="24" :md="analysisColSpan" class="analyze-module-col">
            <SpaceTagAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
          </a-col>
          <a-col v-if="shouldShowModule('size')" :xs="24" :md="analysisColSpan" class="analyze-module-col">
            <SpaceSizeAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
          </a-col>
          <a-col v-if="shouldShowModule('user')" :xs="24" :md="analysisColSpan" class="analyze-module-col">
            <SpaceUserAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
          </a-col>
          <a-col
            v-if="isAdmin && shouldShowModule('rank')"
            :xs="24"
            :md="analysisColSpan"
            class="analyze-module-col"
          >
            <SpaceRankAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
          </a-col>
        </a-row>
      </section>
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
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { postSpaceAnalyzeUsage } from '@/api/analyze'
import { message } from 'ant-design-vue'

type ScopeMode = 'current' | 'public' | 'all'
type CardDensity = 'comfortable' | 'compact'
const moduleMeta = [
  { key: 'usage', label: '使用分析' },
  { key: 'category', label: '分类分析' },
  { key: 'tag', label: '标签分析' },
  { key: 'size', label: '大小分析' },
  { key: 'user', label: '用户行为' },
  { key: 'rank', label: '排行分析', adminOnly: true },
] as const
type AnalyzeModuleKey = (typeof moduleMeta)[number]['key']
type ModuleFilterKey = 'all' | AnalyzeModuleKey

const route = useRoute()
const router = useRouter()

// 空间 id
const spaceId = computed(() => {
  const id = Number(route.query?.spaceId)
  return Number.isNaN(id) ? undefined : id
})

const resolveQueryBoolean = (value: unknown) => {
  if (Array.isArray(value)) {
    return resolveQueryBoolean(value[0])
  }
  return value === '1' || value === 'true' || value === 1 || value === true
}

const queryAll = computed(() => resolveQueryBoolean(route.query?.queryAll))
const queryPublic = computed(() => resolveQueryBoolean(route.query?.queryPublic))
const isCurrentScope = computed(() => !queryAll.value && !queryPublic.value)

const switchScope = (mode: ScopeMode) => {
  const nextQuery: Record<string, string> = {}
  if (mode === 'all') {
    nextQuery.queryAll = '1'
  } else if (mode === 'public') {
    nextQuery.queryPublic = '1'
  } else if (spaceId.value) {
    nextQuery.spaceId = String(spaceId.value)
  }
  router.replace({
    path: '/space_analyze',
    query: nextQuery,
  })
}

// 判断用户是否为管理员
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
const isAdmin = computed(() => {
  return loginUser.userRole === 'admin'
})

const availableModules = computed(() => {
  return moduleMeta.filter((item) => {
    const adminOnly = 'adminOnly' in item && item.adminOnly
    return !adminOnly || isAdmin.value
  })
})
const analyzeModuleCount = computed(() => availableModules.value.length)
const moduleFilterOptions = computed(() => {
  return [
    { label: '全部模块', value: 'all' },
    ...availableModules.value.map((item) => ({
      label: item.label,
      value: item.key,
    })),
  ]
})
const activeModuleKey = ref<ModuleFilterKey>('all')
const cardDensity = ref<CardDensity>('comfortable')

const visibleModuleCount = computed(() => {
  if (activeModuleKey.value === 'all') {
    return analyzeModuleCount.value
  }
  return 1
})
const activeModuleLabel = computed(() => {
  if (activeModuleKey.value === 'all') {
    return '全部模块'
  }
  return moduleMeta.find((item) => item.key === activeModuleKey.value)?.label ?? '模块'
})
const analysisColSpan = computed(() => (activeModuleKey.value === 'all' ? 12 : 24))
const analysisRowGutter = computed<[number, number]>(() => {
  return cardDensity.value === 'compact' ? [10, 10] : [12, 12]
})
const analysisMetaText = computed(() => {
  if (activeModuleKey.value === 'all') {
    return `当前展示 ${visibleModuleCount.value} 个分析模块`
  }
  return `当前聚焦：${activeModuleLabel.value}`
})
const analysisHint = computed(() => {
  if (activeModuleKey.value === 'all') {
    return `可切换到单模块聚焦视图，当前密度：${cardDensity.value === 'compact' ? '紧凑' : '舒适'}。`
  }
  return `${activeModuleLabel.value}已进入聚焦展示。`
})

const setCardDensity = (mode: CardDensity) => {
  cardDensity.value = mode
}
const shouldShowModule = (moduleKey: AnalyzeModuleKey) => {
  if (activeModuleKey.value === 'all') {
    return true
  }
  return activeModuleKey.value === moduleKey
}

watch(
  availableModules,
  (modules) => {
    if (activeModuleKey.value === 'all') {
      return
    }
    if (!modules.some((item) => item.key === activeModuleKey.value)) {
      activeModuleKey.value = 'all'
    }
  },
  { immediate: true },
)

const scopeLabel = computed(() => {
  if (queryAll.value) {
    return '全部空间'
  }
  if (queryPublic.value) {
    return '公共图库'
  }
  if (spaceId.value) {
    return `空间 #${spaceId.value}`
  }
  return '当前上下文'
})
const scopeSubtitle = computed(() => {
  if (queryAll.value) {
    return '当前范围：全部空间'
  }
  if (queryPublic.value) {
    return '当前范围：公共图库'
  }
  if (spaceId.value) {
    return `当前范围：空间 id：${spaceId.value}`
  }
  return '当前范围：未指定空间，默认按当前上下文'
})
const accessStateText = computed(() => {
  if (checkingPermission.value) {
    return '校验中'
  }
  if (analyzeAccessState.value === 'forbidden') {
    return '无权限'
  }
  if (analyzeAccessState.value === 'not_found') {
    return '不存在'
  }
  return '可访问'
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

#spaceAnalyzePage .space-analyze-toolbar {
  position: relative;
  overflow: hidden;
  border-color: #c8d7e7;
  background:
    radial-gradient(130% 100% at 0% -10%, rgb(166 193 220 / 24%) 0%, transparent 56%),
    radial-gradient(120% 92% at 100% -8%, rgb(205 222 240 / 22%) 0%, transparent 54%),
    linear-gradient(180deg, rgb(255 255 255 / 95%) 0%, rgb(242 248 255 / 94%) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    0 10px 22px rgb(31 50 72 / 8%);
}

#spaceAnalyzePage .space-analyze-toolbar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(132deg, rgb(255 255 255 / 20%) 0%, rgb(255 255 255 / 0%) 46%),
    repeating-linear-gradient(122deg, rgb(255 255 255 / 14%) 0 2px, rgb(255 255 255 / 0%) 2px 11px);
  opacity: 0.72;
  pointer-events: none;
}

#spaceAnalyzePage .space-analyze-toolbar-main {
  position: relative;
  z-index: 1;
}

#spaceAnalyzePage .space-analyze-title {
  display: grid;
  gap: 4px;
}

#spaceAnalyzePage .analyze-kicker {
  margin: 0;
  width: fit-content;
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #ccdaea;
  background: linear-gradient(180deg, #ffffff 0%, #edf5fd 100%);
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  color: #3d5b7b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

#spaceAnalyzePage .space-analyze-actions {
  position: relative;
  z-index: 1;
}

#spaceAnalyzePage .scope-btn {
  min-height: 30px;
  border-radius: 999px;
  border-color: #c8d8e9;
  background: linear-gradient(180deg, #fafdff 0%, #eef5fc 100%);
  color: #2f4b69;
  font-size: 12px;
}

#spaceAnalyzePage .scope-btn:hover,
#spaceAnalyzePage .scope-btn:focus {
  border-color: #abc0d7;
  background: #e4eef8;
  color: #1f3852;
}

#spaceAnalyzePage .scope-btn.is-active {
  border-color: #91abca;
  background: #dce9f7;
  color: #1f3b56;
  font-weight: 600;
}

#spaceAnalyzePage .scope-btn--ghost {
  border-color: #d1deea;
  background: rgb(255 255 255 / 82%);
  color: #516983;
}

#spaceAnalyzePage .space-analyze-kpi {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  gap: 8px;
}

#spaceAnalyzePage .analyze-content {
  display: grid;
  gap: 10px;
  border-color: #cad9e8;
  background:
    radial-gradient(120% 98% at 0% 0%, rgb(203 221 241 / 14%) 0%, transparent 56%),
    linear-gradient(180deg, #fbfdff 0%, #f3f8fe 100%);
}

#spaceAnalyzePage .analyze-content--compact {
  gap: 8px;
}

#spaceAnalyzePage .analyze-stage-head {
  display: grid;
  gap: 6px;
}

#spaceAnalyzePage .analyze-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

#spaceAnalyzePage .module-segment {
  max-width: 100%;
}

#spaceAnalyzePage .density-switch {
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid #d3dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

#spaceAnalyzePage .density-btn {
  min-height: 24px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #5c748f;
  padding: 0 10px;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

#spaceAnalyzePage .density-btn:hover {
  color: #2f4d6c;
  background: #e6f0fa;
}

#spaceAnalyzePage .density-btn.is-active {
  color: #203b56;
  background: #dfeaf6;
  font-weight: 600;
}

#spaceAnalyzePage .density-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

#spaceAnalyzePage .analysis-hint {
  margin: 0;
  font-size: 12px;
  color: #5a728d;
}

#spaceAnalyzePage .analyze-module-col :deep(.analyze-card),
#spaceAnalyzePage .analyze-module-col :deep(.usage-card) {
  border-color: #d1deeb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
}

#spaceAnalyzePage .analyze-content--compact .analyze-module-col :deep(.analyze-card .ant-card-head),
#spaceAnalyzePage .analyze-content--compact .analyze-module-col :deep(.usage-card .ant-card-head) {
  min-height: 46px;
  padding-inline: 12px;
}

#spaceAnalyzePage .analyze-content--compact .analyze-module-col :deep(.analyze-card .ant-card-body),
#spaceAnalyzePage .analyze-content--compact .analyze-module-col :deep(.usage-card .ant-card-body) {
  padding: 10px 12px 12px;
}

@media (max-width: 1140px) {
  #spaceAnalyzePage .space-analyze-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  #spaceAnalyzePage .analyze-controls {
    align-items: stretch;
  }

  #spaceAnalyzePage .module-segment {
    width: 100%;
  }
}

@media (max-width: 768px) {
  #spaceAnalyzePage .space-analyze-toolbar {
    padding: 10px;
  }

  #spaceAnalyzePage .scope-btn {
    min-height: 28px;
    font-size: 11px;
  }

  #spaceAnalyzePage .density-switch {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  #spaceAnalyzePage .density-btn,
  #spaceAnalyzePage .scope-btn {
    transition: none !important;
  }
}
</style>

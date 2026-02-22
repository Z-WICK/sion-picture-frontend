<template>
  <div id="adminSpaceManagePage" class="page-shell">
    <section class="page-toolbar admin-space-toolbar">
      <div class="page-toolbar-main admin-space-toolbar-main">
        <div class="admin-space-title">
          <p class="admin-space-kicker">Admin Space Manager</p>
          <h2 class="page-title">空间管理</h2>
          <p class="page-subtitle">{{ toolbarSubtitle }}</p>
        </div>
        <a-space class="page-toolbar-actions admin-space-actions">
          <a-button class="admin-action-btn" type="primary" href="/add_space" target="_blank">
            + 创建空间
          </a-button>
          <a-button
            class="admin-action-btn admin-action-btn--ghost"
            type="primary"
            ghost
            href="/space_analyze?queryPublic=1"
            target="_blank"
          >
            分析公共图库
          </a-button>
          <a-button
            class="admin-action-btn admin-action-btn--ghost"
            type="primary"
            ghost
            href="/space_analyze?queryAll=1"
            target="_blank"
          >
            分析全部空间
          </a-button>
        </a-space>
      </div>

      <div class="mini-kpi-row admin-space-kpi-row" aria-label="空间列表概览">
        <span class="mini-kpi">
          <strong>{{ total }}</strong>
          <span>空间总量</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ dataList.length }}</strong>
          <span>当前页</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ teamSpaceCount }}</strong>
          <span>团队空间</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ privateSpaceCount }}</strong>
          <span>私有空间</span>
        </span>
      </div>
    </section>

    <section class="filter-toolbar compact-filter-toolbar admin-space-filter-toolbar">
      <a-form
        layout="vertical"
        size="small"
        :model="searchParams"
        class="compact-filter-form"
        @finish="doSearch"
      >
        <div class="compact-filter-primary">
          <a-form-item class="compact-filter-search" name="spaceName">
            <a-input-search
              v-model:value="searchParams.spaceName"
              placeholder="搜索空间名称"
              allow-clear
              :enter-button="false"
              @search="doSearch"
            />
          </a-form-item>
          <div class="compact-filter-actions">
            <a-segmented
              v-model:value="quickSpaceTypeValue"
              class="space-type-segment"
              :options="spaceTypeQuickOptions"
            />
            <a-form-item name="spaceLevel">
              <a-select
                v-model:value="searchParams.spaceLevel"
                class="compact-filter-select"
                placeholder="空间级别"
                :options="SPACE_LEVEL_OPTIONS"
                allow-clear
              />
            </a-form-item>

            <div class="density-switch" role="group" aria-label="表格密度">
              <button
                type="button"
                class="density-btn"
                :class="{ 'is-active': tableDensity === 'comfortable' }"
                :aria-pressed="tableDensity === 'comfortable'"
                @click="setTableDensity('comfortable')"
              >
                舒适
              </button>
              <button
                type="button"
                class="density-btn"
                :class="{ 'is-active': tableDensity === 'compact' }"
                :aria-pressed="tableDensity === 'compact'"
                @click="setTableDensity('compact')"
              >
                紧凑
              </button>
            </div>

            <a-button class="toolbar-toggle-btn" @click="showAdvancedFilters = !showAdvancedFilters">
              {{ showAdvancedFilters ? '收起' : '筛选' }}
              <span v-if="activeFilterCount" class="toolbar-count-pill">{{ activeFilterCount }}</span>
            </a-button>
            <a-button type="primary" html-type="submit">应用</a-button>
            <a-button @click="resetSearch">重置</a-button>
          </div>
        </div>

        <div v-if="activeFilterCount > 0" class="active-filter-strip" aria-label="当前筛选条件">
          <span class="active-filter-label">筛选</span>
          <a-tag v-for="item in visibleFilterHints" :key="item">{{ item }}</a-tag>
          <a-tag v-if="hiddenFilterHintCount > 0">+{{ hiddenFilterHintCount }}</a-tag>
        </div>

        <transition name="toolbar-fold">
          <div v-if="showAdvancedFilters" class="advanced-filter-panel">
            <div class="advanced-filter-grid">
              <a-form-item class="advanced-col-4" name="userId">
                <a-input
                  v-model:value.number="searchParams.userId"
                  placeholder="用户 id"
                  allow-clear
                />
              </a-form-item>
            </div>
          </div>
        </transition>
      </a-form>
    </section>

    <section class="content-slab admin-space-table-stage">
      <div class="admin-space-table-head">
        <div class="table-meta-bar">
          <span class="table-meta-main">空间列表</span>
          <span class="table-meta-sub">
            <template v-if="activeFilterCount > 0">
              筛选中 · 共 {{ total }} 条 · 当前页 {{ dataList.length }} 条
            </template>
            <template v-else>
              共 {{ total }} 条记录 · 当前页 {{ dataList.length }} 条
            </template>
          </span>
        </div>
        <p v-if="resultHint" class="result-tip">{{ resultHint }}</p>
      </div>

      <div class="table-wrap">
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          :size="tableSize"
          :scroll="{ x: 1220 }"
          @change="doTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'spaceLevel'">
              <div>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</div>
            </template>
            <template v-if="column.dataIndex === 'spaceType'">
              <a-tag>{{ SPACE_TYPE_MAP[record.spaceType] }}</a-tag>
            </template>
            <template v-if="column.dataIndex === 'spaceUseInfo'">
              <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
              <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
              <p class="usage-ratio">
                占用：大小 {{ formatUsageRatio(record.totalSize, record.maxSize) }} · 数量
                {{ formatUsageRatio(record.totalCount, record.maxCount) }}
              </p>
            </template>
            <template v-if="column.dataIndex === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-if="column.dataIndex === 'editTime'">
              {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space wrap>
                <a-button type="link" :href="`/space_analyze?spaceId=${record.id}`" target="_blank">
                  分析
                </a-button>
                <a-button type="link" :href="`/add_space?id=${record.id}`" target="_blank">
                  编辑
                </a-button>
                <a-button danger @click="doDelete(record.id)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { postSpaceOpenApiDelete, postSpaceListPage } from '@/api/space'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  SPACE_TYPE_ENUM,
  SPACE_LEVEL_MAP,
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_MAP,
} from '@/constants/space.ts'
import { formatSize } from '@/utils'

type Density = 'comfortable' | 'compact'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '空间类别',
    dataIndex: 'spaceType',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 90,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
    width: 210,
  },
]

const dataList = ref<API.Space[]>([])
const total = ref(0)
const showAdvancedFilters = ref(false)
const tableDensity = ref<Density>('comfortable')

const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const spaceTypeQuickOptions = [
  { label: '全部', value: 'all' },
  { label: '私有', value: SPACE_TYPE_ENUM.PRIVATE },
  { label: '团队', value: SPACE_TYPE_ENUM.TEAM },
]
const quickSpaceTypeValue = computed<'all' | number>({
  get: () => {
    if (searchParams.spaceType === undefined || searchParams.spaceType === null) {
      return 'all'
    }
    return Number(searchParams.spaceType)
  },
  set: (value) => {
    searchParams.spaceType = value === 'all' ? undefined : Number(value)
    doSearch()
  },
})

const activeFilterCount = computed(() => {
  let count = 0
  if (searchParams.spaceName?.trim()) {
    count += 1
  }
  if (searchParams.spaceLevel !== undefined) {
    count += 1
  }
  if (searchParams.spaceType !== undefined) {
    count += 1
  }
  if (searchParams.userId !== undefined && searchParams.userId !== null) {
    count += 1
  }
  return count
})
const teamSpaceCount = computed(() => {
  return dataList.value.filter((item) => item.spaceType === SPACE_TYPE_ENUM.TEAM).length
})
const privateSpaceCount = computed(() => {
  return dataList.value.filter((item) => item.spaceType === SPACE_TYPE_ENUM.PRIVATE).length
})
const toolbarSubtitle = computed(() => {
  if (activeFilterCount.value > 0) {
    return `当前已启用 ${activeFilterCount.value} 项筛选条件`
  }
  return '集中管理各类空间，快速切换分析视角'
})
const resultHint = computed(() => {
  if (total.value === 0) {
    return '暂无匹配空间，可尝试放宽筛选条件。'
  }
  if (activeFilterCount.value > 0) {
    return `当前筛选命中 ${total.value} 条空间记录。`
  }
  return ''
})
const tableSize = computed(() => (tableDensity.value === 'compact' ? 'small' : 'middle'))
const filterHints = computed(() => {
  const hints: string[] = []
  const name = searchParams.spaceName?.trim()
  if (name) {
    hints.push(`名称：${name}`)
  }
  if (searchParams.spaceType !== undefined) {
    hints.push(`类别：${SPACE_TYPE_MAP[Number(searchParams.spaceType)]}`)
  }
  if (searchParams.spaceLevel !== undefined) {
    hints.push(`级别：${SPACE_LEVEL_MAP[Number(searchParams.spaceLevel)]}`)
  }
  if (searchParams.userId !== undefined && searchParams.userId !== null) {
    hints.push(`用户：${searchParams.userId}`)
  }
  return hints
})
const visibleFilterHints = computed(() => filterHints.value.slice(0, 3))
const hiddenFilterHintCount = computed(() =>
  Math.max(0, filterHints.value.length - visibleFilterHints.value.length),
)

const setTableDensity = (mode: Density) => {
  tableDensity.value = mode
}
const formatUsageRatio = (used?: number, max?: number) => {
  if (!max || max <= 0) {
    return '无限制'
  }
  const normalizedUsed = Number(used ?? 0)
  return `${Math.min(100, Math.round((normalizedUsed / max) * 100))}%`
}

const fetchData = async () => {
  try {
    const res = await postSpaceListPage({
      ...searchParams,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
    const errorMessage =
      maybeResponse?.data?.message ?? (error instanceof Error ? error.message : String(error))
    message.error('获取数据失败，' + errorMessage)
  }
}

onMounted(() => {
  fetchData()
})

const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (count: number) => `共 ${count} 条`,
  }
})

const doTableChange = (page: TablePaginationConfig) => {
  searchParams.current = page.current ?? 1
  searchParams.pageSize = page.pageSize ?? searchParams.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const resetSearch = () => {
  searchParams.spaceName = undefined
  searchParams.spaceLevel = undefined
  searchParams.spaceType = undefined
  searchParams.userId = undefined
  showAdvancedFilters.value = false
  doSearch()
}

const doDelete = async (id?: number) => {
  if (!id) {
    return
  }
  try {
    const res = await postSpaceOpenApiDelete({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error('删除失败，' + res.data.message)
    }
  } catch (error) {
    const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
    const errorMessage =
      maybeResponse?.data?.message ?? (error instanceof Error ? error.message : String(error))
    message.error('删除失败，' + errorMessage)
  }
}
</script>

<style scoped>
#adminSpaceManagePage {
  margin-bottom: 16px;
}

#adminSpaceManagePage .admin-space-toolbar {
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

#adminSpaceManagePage .admin-space-toolbar::after {
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

#adminSpaceManagePage .admin-space-toolbar-main {
  position: relative;
  z-index: 1;
}

#adminSpaceManagePage .admin-space-title {
  display: grid;
  gap: 4px;
}

#adminSpaceManagePage .admin-space-kicker {
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

#adminSpaceManagePage .admin-space-actions {
  position: relative;
  z-index: 1;
}

#adminSpaceManagePage .admin-action-btn {
  min-height: 30px;
  border-radius: 999px;
  border-color: #c8d8e9;
  background: linear-gradient(180deg, #fafdff 0%, #eef5fc 100%);
  color: #2f4b69;
  font-size: 12px;
}

#adminSpaceManagePage .admin-action-btn:hover,
#adminSpaceManagePage .admin-action-btn:focus {
  border-color: #abc0d7;
  background: #e4eef8;
  color: #1f3852;
}

#adminSpaceManagePage .admin-action-btn--ghost {
  border-color: #d1deea;
  background: rgb(255 255 255 / 78%);
  color: #526a84;
}

#adminSpaceManagePage .admin-space-kpi-row {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  gap: 8px;
}

#adminSpaceManagePage .admin-space-filter-toolbar {
  border-color: #ccdbea;
  background:
    radial-gradient(120% 96% at 100% 0%, rgb(201 219 238 / 14%) 0%, transparent 56%),
    linear-gradient(180deg, #fbfdff 0%, #f2f7fd 100%);
}

#adminSpaceManagePage .space-type-segment {
  background: rgb(236 243 251 / 80%);
  border-radius: 999px;
}

#adminSpaceManagePage .density-switch {
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid #d3dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

#adminSpaceManagePage .density-btn {
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

#adminSpaceManagePage .density-btn:hover {
  color: #2f4d6c;
  background: #e6f0fa;
}

#adminSpaceManagePage .density-btn.is-active {
  color: #203b56;
  background: #dfeaf6;
  font-weight: 600;
}

#adminSpaceManagePage .density-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

#adminSpaceManagePage .active-filter-strip {
  min-height: 34px;
  border: 1px solid #d2dfec;
  border-radius: 10px;
  background: linear-gradient(180deg, #f8fbff 0%, #edf5fc 100%);
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
}

#adminSpaceManagePage .active-filter-strip::-webkit-scrollbar {
  display: none;
}

#adminSpaceManagePage .active-filter-label {
  font-size: 11px;
  color: #60758d;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

#adminSpaceManagePage .admin-space-table-stage {
  display: grid;
  gap: 8px;
  border-color: #cad9e8;
  background:
    radial-gradient(120% 94% at 100% 0%, rgb(201 219 237 / 15%) 0%, transparent 56%),
    linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
}

#adminSpaceManagePage .admin-space-table-head {
  display: grid;
  gap: 4px;
}

#adminSpaceManagePage .result-tip {
  margin: 0;
  font-size: 12px;
  color: #5a728d;
}

#adminSpaceManagePage .usage-ratio {
  margin: 2px 0 0;
  color: #60768e;
  font-size: 12px;
}

@media (max-width: 1140px) {
  #adminSpaceManagePage .admin-space-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  #adminSpaceManagePage .compact-filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  #adminSpaceManagePage .admin-space-toolbar {
    padding: 10px;
  }

  #adminSpaceManagePage .admin-action-btn {
    min-height: 28px;
    font-size: 11px;
  }

  #adminSpaceManagePage .admin-space-kpi-row .mini-kpi {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
  }

  #adminSpaceManagePage .density-switch {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  #adminSpaceManagePage .density-btn,
  #adminSpaceManagePage .admin-action-btn {
    transition: none !important;
  }
}
</style>

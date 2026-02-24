<template>
  <div id="adminPictureManagePage" class="page-shell">
    <section class="page-toolbar admin-picture-toolbar">
      <div class="page-toolbar-main admin-picture-toolbar-main">
        <div class="admin-picture-title">
          <p class="admin-picture-kicker">Admin Picture Manager</p>
          <h2 class="page-title">图片管理</h2>
          <p class="page-subtitle">{{ toolbarSubtitle }}</p>
        </div>
        <a-space class="page-toolbar-actions admin-picture-actions">
          <a-button class="admin-action-btn" type="primary" href="/add_picture" target="_blank">
            + 创建图片
          </a-button>
          <a-button class="admin-action-btn admin-action-btn--ghost" type="primary" ghost href="/add_picture/batch" target="_blank">
            + 批量创建
          </a-button>
        </a-space>
      </div>

      <div class="mini-kpi-row admin-picture-kpi-row" aria-label="图片列表概览">
        <span class="mini-kpi">
          <strong>{{ total }}</strong>
          <span>图片总量</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ dataList.length }}</strong>
          <span>当前页</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ pendingReviewCount }}</strong>
          <span>待审核</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ passCount }}</strong>
          <span>已通过</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ rejectCount }}</strong>
          <span>已拒绝</span>
        </span>
      </div>
    </section>

    <section class="filter-toolbar compact-filter-toolbar admin-picture-filter-toolbar">
      <a-form
        layout="vertical"
        size="small"
        :model="searchParams"
        class="compact-filter-form"
        @finish="doSearch"
      >
        <div class="compact-filter-primary">
          <a-form-item class="compact-filter-search" name="searchText">
            <a-input-search
              v-model:value="searchParams.searchText"
              placeholder="搜索图片名称、简介"
              allow-clear
              :enter-button="false"
              @search="doSearch"
            />
          </a-form-item>
          <div class="compact-filter-actions">
            <a-segmented v-model:value="quickReviewValue" class="review-segment" :options="reviewQuickOptions" />
            <a-form-item name="reviewStatus">
              <a-select
                v-model:value="searchParams.reviewStatus"
                class="compact-filter-select"
                placeholder="审核状态"
                :options="PIC_REVIEW_STATUS_OPTIONS"
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
              <a-form-item class="advanced-col-4" name="category">
                <a-input v-model:value="searchParams.category" placeholder="类型" allow-clear />
              </a-form-item>
              <a-form-item class="advanced-col-8" name="tags">
                <a-select
                  v-model:value="searchParams.tags"
                  mode="tags"
                  placeholder="标签（可多选）"
                  allow-clear
                />
              </a-form-item>
            </div>
          </div>
        </transition>
      </a-form>
    </section>

    <section class="content-slab admin-picture-table-stage">
      <div class="admin-picture-table-head">
        <div class="table-meta-bar">
          <span class="table-meta-main">图库内容列表</span>
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
          :loading="loading"
          :size="tableSize"
          :scroll="{ x: 1360 }"
          @change="doTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'url'">
              <a-image :src="resolveImageUrl(record.url)" :width="108" />
            </template>
            <template v-if="column.dataIndex === 'tags'">
              <a-space wrap>
                <a-tag v-for="tag in getDisplayTags(record.tags)" :key="tag">
                  {{ tag }}
                </a-tag>
                <a-tag v-if="getHiddenTagCount(record.tags) > 0">+{{ getHiddenTagCount(record.tags) }}</a-tag>
                <span v-if="getDisplayTags(record.tags).length === 0" class="empty-tag-tip">无标签</span>
              </a-space>
            </template>
            <template v-if="column.dataIndex === 'picInfo'">
              <div>格式：{{ record.picFormat || '--' }}</div>
              <div>宽度：{{ record.picWidth || '--' }}</div>
              <div>高度：{{ record.picHeight || '--' }}</div>
              <div>宽高比：{{ record.picScale || '--' }}</div>
              <div>大小：{{ formatSize(record.picSize) }}</div>
            </template>
            <template v-if="column.dataIndex === 'reviewMessage'">
              <div class="review-info">
                <a-tag class="review-state-tag">{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</a-tag>
                <p class="review-item">{{ record.reviewMessage || '暂无审核信息' }}</p>
                <p class="review-item">审核人：{{ record.reviewerId ?? '--' }}</p>
                <p v-if="record.reviewTime" class="review-item">
                  审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
                </p>
              </div>
            </template>
            <template v-if="column.dataIndex === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-if="column.dataIndex === 'editTime'">
              {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space wrap>
                <a-button
                  v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                  type="link"
                  @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
                >
                  通过
                </a-button>
                <a-button
                  v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                  type="link"
                  danger
                  @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
                >
                  拒绝
                </a-button>
                <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank">
                  编辑
                </a-button>
                <a-popconfirm
                  title="确认删除这张图片吗？"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="doDelete(record.id)"
                >
                  <a-button danger :loading="deletingId === record.id" :disabled="deletingId === record.id">
                    删除
                  </a-button>
                </a-popconfirm>
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
import {
  postPictureOpenApiDelete,
  postPictureReview,
  postPictureListPage,
} from '@/api/picture'
import { message } from 'ant-design-vue'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/picture.ts'
import dayjs from 'dayjs'
import { formatSize, resolveImageUrl } from '@/utils'

type Density = 'comfortable' | 'compact'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 128,
  },
  {
    title: '名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 120,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 170,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 170,
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    width: 220,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 170,
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    width: 170,
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
  },
]

const dataList = ref<API.Picture[]>([])
const total = ref(0)
const loading = ref(false)
const deletingId = ref<number>()
const showAdvancedFilters = ref(false)
const tableDensity = ref<Density>('comfortable')

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const pendingReviewCount = computed(() => {
  return dataList.value.filter((item) => item.reviewStatus === PIC_REVIEW_STATUS_ENUM.REVIEWING).length
})
const passCount = computed(() => {
  return dataList.value.filter((item) => item.reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS).length
})
const rejectCount = computed(() => {
  return dataList.value.filter((item) => item.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT).length
})
const reviewQuickOptions = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: PIC_REVIEW_STATUS_ENUM.REVIEWING },
  { label: '已通过', value: PIC_REVIEW_STATUS_ENUM.PASS },
  { label: '已拒绝', value: PIC_REVIEW_STATUS_ENUM.REJECT },
]
const quickReviewValue = computed<'all' | number>({
  get: () => {
    if (searchParams.reviewStatus === undefined || searchParams.reviewStatus === null) {
      return 'all'
    }
    return Number(searchParams.reviewStatus)
  },
  set: (value) => {
    searchParams.reviewStatus = value === 'all' ? undefined : Number(value)
    doSearch()
  },
})
const activeFilterCount = computed(() => {
  let count = 0
  if (searchParams.searchText?.trim()) {
    count += 1
  }
  if (searchParams.reviewStatus !== undefined) {
    count += 1
  }
  if (searchParams.category?.trim()) {
    count += 1
  }
  if (Array.isArray(searchParams.tags)) {
    count += searchParams.tags.filter((tag) => String(tag).trim().length > 0).length
  }
  return count
})
const toolbarSubtitle = computed(() => {
  if (activeFilterCount.value > 0) {
    return `当前已启用 ${activeFilterCount.value} 项筛选条件`
  }
  return '审核、编辑和回收公共图库图片'
})
const resultHint = computed(() => {
  if (total.value === 0) {
    return '暂无匹配图片，可尝试放宽筛选条件。'
  }
  if (activeFilterCount.value > 0) {
    return `当前筛选命中 ${total.value} 条图片记录。`
  }
  return ''
})
const tableSize = computed(() => (tableDensity.value === 'compact' ? 'small' : 'middle'))
const filterHints = computed(() => {
  const hints: string[] = []
  const keyword = searchParams.searchText?.trim()
  if (keyword) {
    hints.push(`关键词：${keyword}`)
  }
  if (searchParams.reviewStatus !== undefined) {
    hints.push(`审核：${PIC_REVIEW_STATUS_MAP[Number(searchParams.reviewStatus)]}`)
  }
  if (searchParams.category?.trim()) {
    hints.push(`类型：${searchParams.category.trim()}`)
  }
  const tags = Array.isArray(searchParams.tags)
    ? searchParams.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : []
  tags.slice(0, 3).forEach((tag) => hints.push(`标签：${tag}`))
  return hints
})
const visibleFilterHints = computed(() => filterHints.value.slice(0, 3))
const hiddenFilterHintCount = computed(() =>
  Math.max(0, filterHints.value.length - visibleFilterHints.value.length),
)

const setTableDensity = (mode: Density) => {
  tableDensity.value = mode
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await postPictureListPage({
      ...searchParams,
      nullSpaceId: true,
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
  } finally {
    loading.value = false
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
  searchParams.searchText = undefined
  searchParams.category = undefined
  searchParams.tags = undefined
  searchParams.reviewStatus = undefined
  showAdvancedFilters.value = false
  doSearch()
}

const doDelete = async (id?: number) => {
  if (!id) {
    message.warning('图片不存在，无法删除')
    return
  }
  if (deletingId.value === id) {
    return
  }
  deletingId.value = id
  try {
    const res = await postPictureOpenApiDelete({ id })
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
  } finally {
    deletingId.value = undefined
  }
}

const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  try {
    const res = await postPictureReview({
      id: record.id,
      reviewStatus,
      reviewMessage,
    })
    if (res.data.code === 0) {
      message.success('审核操作成功')
      fetchData()
    } else {
      message.error('审核操作失败，' + res.data.message)
    }
  } catch (error) {
    const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
    const errorMessage =
      maybeResponse?.data?.message ?? (error instanceof Error ? error.message : String(error))
    message.error('审核操作失败，' + errorMessage)
  }
}

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim())
      .filter(Boolean)
  }
  if (typeof value !== 'string') {
    return []
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed
        .map((tag) => String(tag).trim())
        .filter(Boolean)
    }
  } catch {
    // 非 JSON 字符串时使用分隔规则兜底
  }
  return trimmed
    .split(/[,\uFF0C\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}
const getDisplayTags = (value: unknown) => parseTags(value).slice(0, 4)
const getHiddenTagCount = (value: unknown) => Math.max(0, parseTags(value).length - 4)
</script>

<style scoped>
#adminPictureManagePage {
  margin-bottom: 16px;
}

#adminPictureManagePage .admin-picture-toolbar {
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

#adminPictureManagePage .admin-picture-toolbar::after {
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

#adminPictureManagePage .admin-picture-toolbar-main {
  position: relative;
  z-index: 1;
}

#adminPictureManagePage .admin-picture-title {
  display: grid;
  gap: 4px;
}

#adminPictureManagePage .admin-picture-kicker {
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

#adminPictureManagePage .admin-picture-actions {
  position: relative;
  z-index: 1;
}

#adminPictureManagePage .admin-action-btn {
  min-height: 30px;
  border-radius: 999px;
  border-color: #c8d8e9;
  background: linear-gradient(180deg, #fafdff 0%, #eef5fc 100%);
  color: #2f4b69;
  font-size: 12px;
}

#adminPictureManagePage .admin-action-btn:hover,
#adminPictureManagePage .admin-action-btn:focus {
  border-color: #abc0d7;
  background: #e4eef8;
  color: #1f3852;
}

#adminPictureManagePage .admin-action-btn--ghost {
  border-color: #d1deea;
  background: rgb(255 255 255 / 78%);
  color: #526a84;
}

#adminPictureManagePage .admin-picture-kpi-row {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  gap: 8px;
}

#adminPictureManagePage .admin-picture-filter-toolbar {
  border-color: #ccdbea;
  background:
    radial-gradient(120% 96% at 100% 0%, rgb(201 219 238 / 14%) 0%, transparent 56%),
    linear-gradient(180deg, #fbfdff 0%, #f2f7fd 100%);
}

#adminPictureManagePage .review-segment {
  background: rgb(236 243 251 / 80%);
  border-radius: 999px;
}

#adminPictureManagePage .density-switch {
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid #d3dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

#adminPictureManagePage .density-btn {
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

#adminPictureManagePage .density-btn:hover {
  color: #2f4d6c;
  background: #e6f0fa;
}

#adminPictureManagePage .density-btn.is-active {
  color: #203b56;
  background: #dfeaf6;
  font-weight: 600;
}

#adminPictureManagePage .density-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

#adminPictureManagePage .active-filter-strip {
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

#adminPictureManagePage .active-filter-strip::-webkit-scrollbar {
  display: none;
}

#adminPictureManagePage .active-filter-label {
  font-size: 11px;
  color: #60758d;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

#adminPictureManagePage .admin-picture-table-stage {
  display: grid;
  gap: 8px;
  border-color: #cad9e8;
  background:
    radial-gradient(120% 94% at 100% 0%, rgb(201 219 237 / 15%) 0%, transparent 56%),
    linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
}

#adminPictureManagePage .admin-picture-table-head {
  display: grid;
  gap: 4px;
}

#adminPictureManagePage .result-tip {
  margin: 0;
  font-size: 12px;
  color: #5a728d;
}

#adminPictureManagePage .empty-tag-tip {
  color: #788ea5;
  font-size: 12px;
}

#adminPictureManagePage .review-info {
  display: grid;
  gap: 2px;
}

#adminPictureManagePage .review-state-tag {
  width: fit-content;
}

#adminPictureManagePage .review-item {
  margin: 0;
  color: #60768e;
  font-size: 12px;
  line-height: 1.45;
}

@media (max-width: 1140px) {
  #adminPictureManagePage .admin-picture-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  #adminPictureManagePage .compact-filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  #adminPictureManagePage .admin-picture-toolbar {
    padding: 10px;
  }

  #adminPictureManagePage .admin-action-btn {
    min-height: 28px;
    font-size: 11px;
  }

  #adminPictureManagePage .admin-picture-kpi-row .mini-kpi {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
  }

  #adminPictureManagePage .density-switch {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  #adminPictureManagePage .density-btn,
  #adminPictureManagePage .admin-action-btn {
    transition: none !important;
  }
}
</style>

<template>
  <div id="spaceDetailPage" class="page-shell">
    <a-result
      v-if="spaceNotFound"
      status="404"
      title="空间不存在"
      sub-title="该空间可能已被删除或不存在，请返回我的空间重新选择。"
    />
    <template v-else>
      <section class="page-toolbar space-toolbar">
        <div class="page-toolbar-main space-toolbar-main">
          <div class="space-toolbar-title">
            <p class="space-kicker">Space Workspace</p>
            <h2 class="page-title">{{ space.spaceName }}（{{ SPACE_TYPE_MAP[space.spaceType] }}）</h2>
            <p class="page-subtitle">{{ toolbarSubtitle }}</p>
          </div>
          <a-space size="small" class="page-toolbar-actions space-toolbar-actions">
            <a-button
              v-if="canUploadPicture"
              class="space-action-btn"
              type="primary"
              :href="`/add_picture?spaceId=${id}`"
              target="_blank"
            >
              + 创建图片
            </a-button>
            <a-button
              v-if="canManageSpaceUser"
              class="space-action-btn"
              type="primary"
              ghost
              :icon="h(TeamOutlined)"
              :href="`/spaceUserManage/${id}`"
              target="_blank"
            >
              成员管理
            </a-button>
            <a-button
              v-if="canManageSpaceUser"
              class="space-action-btn"
              type="primary"
              ghost
              :icon="h(BarChartOutlined)"
              :href="`/space_analyze?spaceId=${id}`"
              target="_blank"
            >
              空间分析
            </a-button>
            <a-button
              v-if="canEditPicture"
              class="space-action-btn"
              :icon="h(EditOutlined)"
              @click="doBatchEdit"
            >
              批量编辑
            </a-button>
            <a-tooltip
              :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)} · 数量 ${space.totalCount ?? 0} / ${space.maxCount ?? 0}`"
            >
              <a-progress
                class="space-usage-progress"
                type="circle"
                :size="40"
                :percent="spaceUsagePercent"
                :stroke-color="'#5e7fa2'"
              />
            </a-tooltip>
          </a-space>
        </div>
        <div class="kpi-strip space-kpi-strip">
          <article class="kpi-pill">
            <span class="kpi-label">已加载图片</span>
            <strong class="kpi-value">{{ total }}</strong>
          </article>
          <article class="kpi-pill">
            <span class="kpi-label">当前页展示</span>
            <strong class="kpi-value">{{ dataList.length }}</strong>
          </article>
          <article class="kpi-pill">
            <span class="kpi-label">空间占用</span>
            <strong class="kpi-value">{{ spaceUsagePercent }}%</strong>
          </article>
          <article class="kpi-pill">
            <span class="kpi-label">数量占比</span>
            <strong class="kpi-value">{{ countUsagePercent }}%</strong>
          </article>
          <article class="kpi-pill kpi-pill--ghost">
            <span class="kpi-label">{{ activeColor ? '颜色筛选' : '浏览密度' }}</span>
            <strong class="kpi-value">{{ activeColor || viewModeLabel }}</strong>
          </article>
        </div>
      </section>
      <section class="space-discover-slab">
        <PictureSearchForm :onSearch="onSearch" />
        <section class="filter-toolbar compact-filter-toolbar color-filter">
          <div :class="['color-filter-head', { 'color-filter-head--open': showColorPanel }]">
            <div class="color-head-main">
              <span class="color-label">色彩聚焦</span>
              <span class="color-head-note">{{ colorFilterSummary }}</span>
            </div>
            <div class="color-filter-actions">
              <span v-if="activeColor" class="color-value">{{ activeColor }}</span>
              <div class="display-switch" role="group" aria-label="结果视图密度">
                <button
                  type="button"
                  class="display-switch-btn"
                  :class="{ 'is-active': viewMode === 'comfortable' }"
                  :aria-pressed="viewMode === 'comfortable'"
                  @click="setViewMode('comfortable')"
                >
                  舒适
                </button>
                <button
                  type="button"
                  class="display-switch-btn"
                  :class="{ 'is-active': viewMode === 'compact' }"
                  :aria-pressed="viewMode === 'compact'"
                  @click="setViewMode('compact')"
                >
                  紧凑
                </button>
              </div>
              <a-button size="small" class="toolbar-toggle-btn" @click="showColorPanel = !showColorPanel">
                {{ showColorPanel ? '收起' : '色板' }}
              </a-button>
              <a-button type="link" size="small" :disabled="!activeColor" @click="clearColorFilter">
                清除
              </a-button>
            </div>
          </div>
          <transition name="toolbar-fold">
            <div v-if="showColorPanel" class="color-picker-wrap">
              <color-picker format="hex" @pureColorChange="onColorChange" />
            </div>
          </transition>
        </section>
      </section>
      <section class="content-slab picture-stage">
        <div class="picture-stage-head">
          <div class="table-meta-bar">
            <span class="table-meta-main">空间图片</span>
            <span class="table-meta-sub">
              <template v-if="activeColor">
                色彩筛选 {{ activeColor }} · 共 {{ total }} 张
              </template>
              <template v-else>
                共 {{ total }} 张 · 当前页 {{ dataList.length }} 张
              </template>
            </span>
          </div>
          <p v-if="resultHint" class="result-tip">{{ resultHint }}</p>
        </div>
        <PictureList
          :dataList="dataList"
          :loading="loading"
          :showOp="true"
          :canEdit="canEditPicture"
          :canDelete="canDeletePicture"
          :onReload="reloadPictureList"
          :viewMode="viewMode"
          :spotlight="shouldSpotlight"
        />
        <div v-if="!activeColor" class="pagination-shell">
          <a-pagination
            v-model:current="searchParams.current"
            v-model:pageSize="searchParams.pageSize"
            :total="total"
            @change="onPageChange"
          />
        </div>
      </section>
      <BatchEditPictureModal
        ref="batchEditPictureModalRef"
        :spaceId="spaceId"
        :pictureList="dataList"
        :onSuccess="onBatchEditPictureSuccess"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import { getSpaceGetVo } from '@/api/space'
import { message } from 'ant-design-vue'
import {
  postPictureListPageVo,
  postPictureSearchColor,
} from '@/api/picture'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { BarChartOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_MAP } from '@/constants/space.ts'

interface Props {
  id: string | number
}
type ViewMode = 'comfortable' | 'compact'

const props = defineProps<Props>()
const spaceId = computed(() => {
  const id = Number(props.id)
  return Number.isNaN(id) ? undefined : id
})
const space = ref<API.SpaceVO>({})
const spaceNotFound = ref(false)

const getApiMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const isNotFoundError = (error: unknown) => {
  const maybeResponse = (error as { response?: { status?: number; data?: { code?: number } } })?.response
  return maybeResponse?.status === 404 || maybeResponse?.data?.code === 40400
}
const getErrorMessage = (error: unknown) => {
  return getApiMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)
const spaceUsagePercent = computed(() => {
  const totalSize = Number(space.value.totalSize ?? 0)
  const maxSize = Number(space.value.maxSize ?? 0)
  if (!Number.isFinite(totalSize) || !Number.isFinite(maxSize) || maxSize <= 0) {
    return 0
  }
  const ratio = (totalSize * 100) / maxSize
  return Number(Math.min(100, Math.max(0, ratio)).toFixed(1))
})
const countUsagePercent = computed(() => {
  const totalCount = Number(space.value.totalCount ?? 0)
  const maxCount = Number(space.value.maxCount ?? 0)
  if (!Number.isFinite(totalCount) || !Number.isFinite(maxCount) || maxCount <= 0) {
    return 0
  }
  const ratio = (totalCount * 100) / maxCount
  return Number(Math.min(100, Math.max(0, ratio)).toFixed(1))
})

// -------- 获取空间详情 --------
const fetchSpaceDetail = async () => {
  try {
    if (!spaceId.value) {
      spaceNotFound.value = false
      return
    }
    const res = await getSpaceGetVo({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      spaceNotFound.value = false
      space.value = res.data.data
    } else if (res.data.code === 404 || res.data.code === 40400) {
      spaceNotFound.value = true
      space.value = {}
      message.error(res.data.message ?? '空间不存在')
    } else {
      spaceNotFound.value = false
      space.value = {}
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      spaceNotFound.value = true
      space.value = {}
      message.error(getApiMessage(error) ?? '空间不存在')
      return
    }
    spaceNotFound.value = false
    space.value = {}
    message.error('获取空间详情失败：' + getErrorMessage(error))
  }
}

const initPageData = async () => {
  await fetchSpaceDetail()
  await fetchData()
}

onMounted(() => {
  initPageData()
})

// --------- 获取图片列表 --------

// 定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)
const showColorPanel = ref(false)
const activeColor = ref<string>()
const viewMode = ref<ViewMode>('comfortable')
const viewModeLabel = computed(() => (viewMode.value === 'compact' ? '紧凑' : '舒适'))
const colorFilterSummary = computed(() => {
  if (activeColor.value) {
    return `已启用 ${activeColor.value} 颜色聚焦`
  }
  return '未启用颜色筛选'
})
const toolbarSubtitle = computed(() => {
  if (activeColor.value) {
    return `当前按色彩 ${activeColor.value} 聚焦空间素材`
  }
  return `按条件检索并维护当前空间素材 · 已收录 ${total.value} 张`
})
const shouldSpotlight = computed(
  () => !loading.value && dataList.value.length > 0 && dataList.value.length <= 2,
)
const resultHint = computed(() => {
  if (loading.value) {
    return ''
  }
  if (total.value === 0) {
    return '暂无匹配素材，可尝试调整关键词或清除颜色筛选。'
  }
  if (activeColor.value) {
    return `当前为颜色聚焦结果（${activeColor.value}）。`
  }
  if (dataList.value.length <= 2) {
    return '结果较少，已自动进入聚焦展示。'
  }
  return ''
})

// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  if (!spaceId.value || spaceNotFound.value) {
    loading.value = false
    return
  }
  try {
    // 转换搜索参数
    const params = {
      spaceId: spaceId.value,
      ...searchParams.value,
    }
    const res = await postPictureListPageVo(params)
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else if (res.data.code === 404 || res.data.code === 40400) {
      spaceNotFound.value = true
      dataList.value = []
      total.value = 0
      message.error(res.data.message ?? '空间不存在')
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      spaceNotFound.value = true
      dataList.value = []
      total.value = 0
      message.error(getApiMessage(error) ?? '空间不存在')
    } else {
      message.error('获取数据失败，' + getErrorMessage(error))
    }
  }
  loading.value = false
}

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  activeColor.value = undefined
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

// 搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  activeColor.value = undefined
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

// 按照颜色搜索
const onColorChange = async (color: string) => {
  loading.value = true
  activeColor.value = color
  if (!spaceId.value || spaceNotFound.value) {
    loading.value = false
    return
  }
  try {
    const res = await postPictureSearchColor({
      picColor: color,
      spaceId: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data ?? []
      dataList.value = data
      total.value = data.length
    } else if (res.data.code === 404 || res.data.code === 40400) {
      spaceNotFound.value = true
      dataList.value = []
      total.value = 0
      message.error(res.data.message ?? '空间不存在')
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      spaceNotFound.value = true
      dataList.value = []
      total.value = 0
      message.error(getApiMessage(error) ?? '空间不存在')
    } else {
      message.error('获取数据失败，' + getErrorMessage(error))
    }
  }
  loading.value = false
}

const reloadPictureList = () => {
  if (activeColor.value) {
    onColorChange(activeColor.value)
    return
  }
  fetchData()
}

const clearColorFilter = () => {
  activeColor.value = undefined
  fetchData()
}

const setViewMode = (mode: ViewMode) => {
  viewMode.value = mode
}

// ---- 批量编辑图片 -----
const batchEditPictureModalRef = ref<{ openModal: () => void } | null>(null)

// 批量编辑图片成功
const onBatchEditPictureSuccess = () => {
  reloadPictureList()
}

// 打开批量编辑图片弹窗
const doBatchEdit = () => {
  batchEditPictureModalRef.value?.openModal()
}

// 空间 id 改变时，必须重新获取数据
watch(
  () => props.id,
  async () => {
    activeColor.value = undefined
    showColorPanel.value = false
    viewMode.value = 'comfortable'
    await initPageData()
  },
)
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 16px;
}

#spaceDetailPage .space-toolbar {
  position: relative;
  overflow: hidden;
  border-color: #c8d7e7;
  background:
    radial-gradient(128% 98% at 0% -12%, rgb(166 193 220 / 25%) 0%, transparent 56%),
    radial-gradient(120% 92% at 100% -8%, rgb(205 222 240 / 22%) 0%, transparent 54%),
    linear-gradient(180deg, rgb(255 255 255 / 95%) 0%, rgb(242 248 255 / 94%) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    0 10px 22px rgb(31 50 72 / 8%);
}

#spaceDetailPage .space-toolbar::after {
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

#spaceDetailPage .space-toolbar-main {
  position: relative;
  z-index: 1;
}

#spaceDetailPage .space-toolbar-title {
  display: grid;
  gap: 4px;
}

#spaceDetailPage .space-kicker {
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

#spaceDetailPage .space-toolbar-actions {
  position: relative;
  z-index: 1;
  align-items: center;
}

#spaceDetailPage .space-action-btn {
  min-height: 30px;
  border-radius: 999px;
  border-color: #c8d8e9;
  background: linear-gradient(180deg, #fafdff 0%, #eef5fc 100%);
  color: #2f4b69;
  font-size: 12px;
}

#spaceDetailPage .space-action-btn:hover,
#spaceDetailPage .space-action-btn:focus {
  border-color: #abc0d7;
  background: #e4eef8;
  color: #1f3852;
}

#spaceDetailPage .space-usage-progress {
  filter: drop-shadow(0 6px 12px rgb(35 56 78 / 12%));
}

#spaceDetailPage .space-usage-progress :deep(.ant-progress-text) {
  color: #2b4562;
  font-size: 11px;
}

#spaceDetailPage .space-kpi-strip {
  margin-top: 10px;
  position: relative;
  z-index: 1;
  gap: 8px;
}

#spaceDetailPage .space-kpi-strip .kpi-pill {
  min-width: 108px;
  border-radius: 11px;
  border-color: #cfdeec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 64%);
  padding: 7px 10px;
}

#spaceDetailPage .space-kpi-strip .kpi-pill--ghost {
  border-style: dashed;
  background: rgb(255 255 255 / 48%);
}

#spaceDetailPage .space-kpi-strip .kpi-label {
  font-size: 11px;
  color: #637992;
}

#spaceDetailPage .space-kpi-strip .kpi-value {
  font-size: 15px;
  line-height: 1.15;
  color: #24415e;
}

#spaceDetailPage .space-discover-slab {
  display: grid;
  gap: 8px;
}

#spaceDetailPage .color-filter {
  margin-bottom: 0;
  padding: 7px 9px;
  border-color: #cddceb;
  background:
    radial-gradient(120% 90% at 100% 0%, rgb(196 216 236 / 16%) 0%, transparent 58%),
    linear-gradient(180deg, #fafdff 0%, #f1f7fd 100%);
}

#spaceDetailPage .color-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0;
  flex-wrap: wrap;
}

#spaceDetailPage .color-filter-head--open {
  margin-bottom: 7px;
}

#spaceDetailPage .color-head-main {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

#spaceDetailPage .color-label {
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid #d2dfec;
  background: #edf4fc;
  font-size: 10px;
  color: #3f5770;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

#spaceDetailPage .color-head-note {
  font-size: 11px;
  color: #60758d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(60vw, 320px);
}

#spaceDetailPage .color-filter-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: wrap;
}

#spaceDetailPage .color-value {
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid #c9d7e6;
  background: #ecf3fb;
  color: #355273;
  font-size: 10px;
  font-weight: 600;
}

#spaceDetailPage .display-switch {
  min-height: 26px;
  border-radius: 999px;
  border: 1px solid #d3dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

#spaceDetailPage .display-switch-btn {
  min-height: 20px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #5c748f;
  padding: 0 9px;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

#spaceDetailPage .display-switch-btn:hover {
  color: #2f4d6c;
  background: #e6f0fa;
}

#spaceDetailPage .display-switch-btn.is-active {
  color: #203b56;
  background: #dfeaf6;
  font-weight: 600;
}

#spaceDetailPage .display-switch-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

#spaceDetailPage .color-picker-wrap {
  padding-top: 7px;
  border-top: 1px dashed #cfdcec;
}

#spaceDetailPage .picture-stage {
  display: grid;
  gap: 10px;
  border-color: #cad9e8;
  background:
    radial-gradient(120% 94% at 100% 0%, rgb(201 219 237 / 15%) 0%, transparent 56%),
    linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
}

#spaceDetailPage .picture-stage-head {
  display: grid;
  gap: 4px;
}

#spaceDetailPage .result-tip {
  margin: 0;
  font-size: 12px;
  color: #5a728d;
}

#spaceDetailPage .pagination-shell {
  display: flex;
  justify-content: flex-end;
}

#spaceDetailPage :deep(.vc-color-wrap) {
  border-radius: 10px;
  border: 1px solid #c7d5e4;
}

@media (max-width: 1140px) {
  #spaceDetailPage .space-toolbar-actions {
    justify-content: flex-start;
  }

  #spaceDetailPage .space-kpi-strip .kpi-pill {
    flex: 1 1 140px;
    min-width: 0;
  }
}

@media (max-width: 992px) {
  #spaceDetailPage .color-filter-actions {
    justify-content: flex-start;
    width: 100%;
  }

  #spaceDetailPage .color-head-note {
    max-width: 100%;
  }

  #spaceDetailPage .display-switch {
    order: -1;
  }
}

@media (max-width: 768px) {
  #spaceDetailPage .space-toolbar {
    padding: 10px;
  }

  #spaceDetailPage .space-kpi-strip .kpi-pill {
    flex: 1 1 calc(50% - 4px);
  }

  #spaceDetailPage .space-kpi-strip .kpi-pill--ghost {
    flex-basis: 100%;
  }

  #spaceDetailPage .space-action-btn {
    min-height: 28px;
    font-size: 11px;
  }

  #spaceDetailPage .color-filter {
    padding: 8px;
  }

  #spaceDetailPage .display-switch {
    width: 100%;
    justify-content: center;
  }

  #spaceDetailPage .pagination-shell {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  #spaceDetailPage .display-switch-btn,
  #spaceDetailPage .space-action-btn {
    transition: none !important;
  }
}
</style>

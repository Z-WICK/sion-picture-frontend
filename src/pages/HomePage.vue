<template>
  <div id="homePage">
    <section :class="['workspace-topbar', { 'workspace-topbar--compact': isSpotlightResult }]">
      <div class="topbar-brief-row">
        <div class="topbar-brief-main">
          <p class="workspace-subtitle">
            <span class="workspace-kicker">Public Gallery</span>
            <span>{{ hasActiveFilters ? '筛选浏览' : '内容发现首页' }}</span>
          </p>
          <h1 class="workspace-title">{{ hasActiveFilters ? '按你的条件探索图片' : '发现值得收藏的公开图片' }}</h1>
        </div>
        <div class="topbar-kpi-strip" aria-label="图库概览">
          <span class="topbar-kpi">
            <strong>{{ total }}</strong>
            <span>公开图片</span>
          </span>
          <span class="topbar-kpi">
            <strong>{{ visibleResultCount }}</strong>
            <span>当前结果</span>
          </span>
          <span class="topbar-kpi topbar-kpi--ghost">
            <strong>{{ hasActiveFilters ? activeFilterCount : categoryList.length }}</strong>
            <span>{{ hasActiveFilters ? '筛选条件' : '可选分类' }}</span>
          </span>
        </div>
      </div>

      <div :class="['topbar-control-row', { 'topbar-control-row--quiet': isSpotlightResult }]">
        <div class="topbar-search-shell">
          <div class="topbar-search">
            <a-input-search
              ref="searchInputRef"
              v-model:value="searchParams.searchText"
              placeholder="搜索关键词"
              :enter-button="false"
              allow-clear
              @search="doSearch"
            />
          </div>
          <a-button class="filter-toggle-btn filter-toggle-btn--inline" @click="toggleFilterPanel">
            筛选
            <span v-if="activeFilterCount" class="filter-count-badge">{{ activeFilterCount }}</span>
          </a-button>
        </div>

        <div :class="['topbar-actions', { 'topbar-actions--quiet': isSpotlightResult }]">
          <a-popover v-model:open="showDisplayPanel" trigger="click" placement="bottomRight">
            <template #content>
              <section class="display-panel" aria-label="显示设置">
                <div class="display-group">
                  <span class="display-group-title">排序方式</span>
                  <div class="display-options" role="group" aria-label="结果排序方式">
                    <button
                      type="button"
                      class="display-option-btn"
                      :class="{ 'is-active': sortKey === 'latest' }"
                      :aria-pressed="sortKey === 'latest'"
                      @click="applyDisplaySort('latest')"
                    >
                      最新优先
                    </button>
                    <button
                      type="button"
                      class="display-option-btn"
                      :class="{ 'is-active': sortKey === 'earliest' }"
                      :aria-pressed="sortKey === 'earliest'"
                      @click="applyDisplaySort('earliest')"
                    >
                      最早优先
                    </button>
                  </div>
                </div>
                <div class="display-group">
                  <span class="display-group-title">视图密度</span>
                  <div class="display-options" role="group" aria-label="结果视图密度">
                    <button
                      type="button"
                      class="display-option-btn"
                      :class="{ 'is-active': viewMode === 'comfortable' }"
                      :aria-pressed="viewMode === 'comfortable'"
                      @click="applyDisplayViewMode('comfortable')"
                    >
                      舒适视图
                    </button>
                    <button
                      type="button"
                      class="display-option-btn"
                      :class="{ 'is-active': viewMode === 'compact' }"
                      :aria-pressed="viewMode === 'compact'"
                      @click="applyDisplayViewMode('compact')"
                    >
                      紧凑视图
                    </button>
                  </div>
                </div>
              </section>
            </template>
            <a-button class="display-action-btn">
              显示
              <span class="display-action-caption">{{ displayModeCaption }}</span>
              <DownOutlined />
            </a-button>
          </a-popover>

          <a-dropdown>
            <a-button class="more-action-btn">
              更多
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="upload" @click="goTo('/add_picture')">上传</a-menu-item>
                <a-menu-item key="space" @click="goTo('/my_space')">空间</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>

      <div v-if="visibleHotCategoryChips.length || hasActiveFilters" class="topbar-context-row">
        <div v-if="visibleHotCategoryChips.length" class="trend-strip" aria-label="当前页热点分类">
          <span class="trend-label">热点</span>
          <button
            v-for="item in visibleHotCategoryChips"
            :key="item.name"
            type="button"
            class="trend-chip"
            :class="{ 'is-active': selectedCategory === item.name }"
            @click="changeCategory(item.name)"
          >
            <span>{{ item.name }}</span>
            <strong>{{ item.count }}</strong>
          </button>
        </div>

        <div v-if="hasActiveFilters" class="active-filter-strip" aria-label="当前筛选条件">
          <span class="active-filter-label">筛选</span>
          <a-tag v-if="searchParams.searchText?.trim()">关键词：{{ searchParams.searchText }}</a-tag>
          <a-tag v-if="selectedCategory !== 'all'">分类：{{ selectedCategory }}</a-tag>
          <a-tag v-for="tag in visibleSelectedTagNames" :key="`selected-${tag}`">{{ tag }}</a-tag>
          <a-tag v-if="hiddenSelectedTagCount > 0">+{{ hiddenSelectedTagCount }} 标签</a-tag>
          <a-button type="link" @click="clearFilters">重置</a-button>
        </div>
      </div>
    </section>

    <section
      :class="[
        'list-panel',
        { 'list-panel--sparse': isSparseResult, 'list-panel--spotlight': isSpotlightResult },
      ]"
    >
      <div :class="['stage-story', { 'stage-story--spotlight': isSpotlightResult }]">
        <span class="stage-story-light" aria-hidden="true" />
        <div class="stage-story-main">
          <span class="stage-story-kicker">{{ hasActiveFilters ? '筛选聚焦' : '公开图库' }}</span>
          <h2 class="stage-story-title">{{ stageTitle }}</h2>
          <p class="stage-story-subtitle">{{ stageSubtitle }}</p>
          <div class="stage-story-metrics" aria-label="当前浏览状态">
            <span class="story-metric">
              <strong>{{ visibleResultCount }}</strong>
              <span>当前结果</span>
            </span>
            <span class="story-metric">
              <strong>{{ hasActiveFilters ? activeFilterCount : categoryList.length }}</strong>
              <span>{{ hasActiveFilters ? '筛选条件' : '可用分类' }}</span>
            </span>
          </div>
        </div>

        <article v-if="primaryPicture && !isSpotlightResult" class="stage-feature-card">
          <div class="stage-feature-media-wrap">
            <img
              :src="resolveImageUrl(primaryPicture.thumbnailUrl ?? primaryPicture.url)"
              :alt="primaryPicture.name || '图片预览'"
              class="stage-feature-media"
            />
            <div class="stage-feature-overlay">
              <span class="stage-feature-badge">{{ primaryPictureCategory }}</span>
              <span class="stage-feature-badge stage-feature-badge--dark">{{ primaryPictureUpdatedAt }}</span>
            </div>
          </div>
          <div class="stage-feature-body">
            <span class="stage-feature-kicker">焦点图片</span>
            <h3 class="stage-feature-title">{{ primaryPicture.name || '未命名图片' }}</h3>
            <p class="stage-feature-subtitle">{{ primaryPictureCaption }}</p>
            <div class="stage-feature-meta" aria-label="焦点图片信息">
              <span class="stage-feature-meta-item">{{ primaryPictureResolution }}</span>
              <span class="stage-feature-meta-item">{{ primaryPictureFormatLabel }}</span>
            </div>
            <a-button
              class="stage-feature-btn"
              type="primary"
              size="small"
              @click="goToPicture(primaryPicture.id)"
            >
              查看详情
            </a-button>
          </div>
        </article>
      </div>

      <div :class="['list-head', { 'list-head--spotlight': isSpotlightResult }]">
        <div :class="['list-focus', { 'list-focus--spotlight': isSpotlightResult }]" aria-label="当前结果焦点">
          <span class="list-focus-kicker">{{ hasActiveFilters ? '筛选焦点' : '推荐内容' }}</span>
          <strong class="list-focus-title">{{ focusTitle }}</strong>
          <p :class="['list-focus-subtitle', { 'list-focus-subtitle--compact': isSpotlightResult }]">
            {{ isSpotlightResult ? compactFocusHint : focusSummary }}
          </p>
        </div>
        <div class="list-tools list-tools--leading">
          <span class="list-pill list-pill--strong list-pill--label">图片结果</span>
          <span class="list-pill list-pill--primary">共 {{ total }} 张</span>
          <span class="list-pill list-pill--meta">{{ sortCaption }}</span>
          <span v-if="hasActiveFilters" class="list-pill list-pill--meta">筛选 {{ activeFilterCount }} 项</span>
        </div>
        <a-button v-if="hasActiveFilters" size="small" @click="clearFilters">清空筛选</a-button>
      </div>

      <div
        :class="[
          'gallery-stage',
          {
            'gallery-stage--has-items': visibleResultCount > 0,
            'gallery-stage--sparse': isSparseResult,
            'gallery-stage--spotlight': isSpotlightResult,
          },
        ]"
        :style="galleryStageStyle"
        @mousemove="onGalleryStageMove"
        @mouseleave="resetGalleryStageSpotlight"
      >
        <PictureList
          :dataList="dataList"
          :loading="loading"
          :viewMode="viewMode"
          :spotlight="isSpotlightResult"
        />
      </div>

      <p v-if="!loading && total === 0" class="result-tip result-tip--empty">
        暂无匹配内容，试试更宽泛的关键词或清空筛选。
      </p>
      <p v-else-if="total > 0 && total < 6" class="result-tip">
        当前结果较少，可尝试展开筛选或调整关键词组合。
      </p>

      <div class="pagination-wrap">
        <a-pagination
          v-model:current="searchParams.current"
          v-model:pageSize="searchParams.pageSize"
          :total="total"
          @change="onPageChange"
        />
      </div>
    </section>

    <a-drawer
      v-model:open="showFilters"
      class="workspace-filter-drawer"
      title="筛选条件"
      placement="right"
      :width="'min(360px, calc(100vw - 16px))'"
    >
      <section id="discoverPanel" class="filter-panel">
        <div class="filter-head">
          <span class="filter-title">筛选条件</span>
          <a-space :size="4">
            <span class="filter-meta">已选 {{ activeFilterCount }}</span>
            <a-button type="link" @click="clearFilters">清空筛选</a-button>
          </a-space>
        </div>

        <div class="filter-group fold-group">
          <button
            type="button"
            class="fold-trigger"
            :aria-expanded="filterSectionOpen.category"
            @click="toggleFilterSection('category')"
          >
            <span class="group-title">分类</span>
            <span class="fold-meta">
              {{ selectedCategory === 'all' ? '全部' : selectedCategory }}
              {{ filterSectionOpen.category ? '收起' : '展开' }}
            </span>
          </button>
          <div v-show="filterSectionOpen.category" class="fold-body">
            <a-space :size="[0, 8]" wrap>
              <a-checkable-tag :checked="selectedCategory === 'all'" @change="changeCategory('all')">
                全部
              </a-checkable-tag>
              <a-checkable-tag
                v-for="category in categoryList"
                :key="category"
                :checked="selectedCategory === category"
                @change="changeCategory(category)"
              >
                {{ category }}
              </a-checkable-tag>
            </a-space>
          </div>
        </div>

        <div class="filter-group fold-group">
          <div class="tag-head">
            <button
              type="button"
              class="fold-trigger"
              :aria-expanded="filterSectionOpen.tag"
              @click="toggleFilterSection('tag')"
            >
              <span class="group-title">标签</span>
              <span class="fold-meta">已选 {{ activeTagCount }} {{ filterSectionOpen.tag ? '收起' : '展开' }}</span>
            </button>
          </div>
          <div v-show="filterSectionOpen.tag" class="fold-body">
            <div class="tag-filter-bar">
              <a-input
                v-model:value="tagSearchText"
                allow-clear
                placeholder="筛选标签"
              />
              <span class="tag-filter-meta">{{ filteredOrderedTagEntries.length }}/{{ tagList.length }}</span>
            </div>
            <a-space :size="[0, 8]" wrap>
              <a-checkable-tag
                v-for="tagEntry in filteredOrderedTagEntries"
                :key="tagEntry.tag"
                v-model:checked="selectedTagList[tagEntry.index]"
                @change="doSearch"
              >
                {{ tagEntry.tag }}
              </a-checkable-tag>
            </a-space>
            <p v-if="filteredOrderedTagEntries.length === 0" class="tag-empty">
              没有匹配的标签
            </p>
          </div>
        </div>
      </section>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import {
  type LocationQuery,
  type LocationQueryRaw,
  useRoute,
  useRouter,
} from 'vue-router'
import { message } from 'ant-design-vue'
import { getPictureTagCategory, postPictureListPageVo } from '@/api/picture'
import PictureList from '@/components/PictureList.vue'
import { resolveImageUrl } from '@/utils'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 15
const DEFAULT_SORT_KEY = 'latest'

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)
const router = useRouter()
const route = useRoute()
const searchInputRef = ref<{ focus?: () => void } | null>(null)
const viewMode = ref<'comfortable' | 'compact'>('comfortable')
const sortKey = ref<'latest' | 'earliest'>(DEFAULT_SORT_KEY)
const isSyncingRouteQuery = ref(false)
const pendingRouteTags = ref<string[]>([])
const tagSearchText = ref('')
const showFilters = ref(false)
const showDisplayPanel = ref(false)
const gallerySpotlightX = ref(50)
const gallerySpotlightY = ref(12)

const searchParams = reactive<API.PictureQueryRequest>({
  current: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
})

const visibleResultCount = computed(() => dataList.value.length)
const isSparseResult = computed(
  () => !loading.value && visibleResultCount.value > 0 && visibleResultCount.value <= 3,
)
const isSpotlightResult = computed(
  () => !loading.value && visibleResultCount.value > 0 && visibleResultCount.value <= 2,
)

const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])
const filterSectionOpen = reactive({
  category: true,
  tag: false,
})
const activeTagCount = computed(() => selectedTagList.value.filter(Boolean).length)
const selectedTagNames = computed(() =>
  tagList.value.filter((_, index) => selectedTagList.value[index]),
)
const visibleSelectedTagNames = computed(() => selectedTagNames.value.slice(0, 3))
const hiddenSelectedTagCount = computed(() =>
  Math.max(0, selectedTagNames.value.length - visibleSelectedTagNames.value.length),
)
const activeFilterCount = computed(() => {
  const categoryCount = selectedCategory.value === 'all' ? 0 : 1
  return categoryCount + selectedTagNames.value.length
})
const orderedTagEntries = computed(() =>
  tagList.value
    .map((tag, index) => ({
      tag,
      index,
      checked: Boolean(selectedTagList.value[index]),
    }))
    .sort((a, b) => {
      if (a.checked === b.checked) {
        return a.index - b.index
      }
      return a.checked ? -1 : 1
    }),
)
const filteredOrderedTagEntries = computed(() => {
  const keyword = tagSearchText.value.trim().toLocaleLowerCase()
  if (!keyword) {
    return orderedTagEntries.value
  }
  return orderedTagEntries.value.filter(({ tag }) => tag.toLocaleLowerCase().includes(keyword))
})
const hasActiveFilters = computed(
  () =>
    Boolean(searchParams.searchText?.trim()) ||
    selectedCategory.value !== 'all' ||
    selectedTagNames.value.length > 0,
)
const sortCaption = computed(() =>
  sortKey.value === 'earliest'
    ? '按时间：从早到晚'
    : '按时间：从晚到早',
)
const viewModeLabel = computed(() => (viewMode.value === 'compact' ? '紧凑' : '舒适'))
const displayModeCaption = computed(() =>
  `${sortKey.value === 'earliest' ? '最早' : '最新'} · ${viewModeLabel.value}`,
)
const focusTitle = computed(() => {
  const keyword = searchParams.searchText?.trim()
  if (keyword) {
    return `关键词：${keyword}`
  }
  if (selectedCategory.value !== 'all') {
    return `分类：${selectedCategory.value}`
  }
  if (selectedTagNames.value.length > 0) {
    const [first, second] = selectedTagNames.value
    return second ? `标签：${first} · ${second}` : `标签：${first}`
  }
  return '全部公开图片'
})
const focusSummary = computed(() => {
  if (total.value === 0) {
    return '暂无匹配结果，建议尝试更宽泛的关键词。'
  }
  if (isSpotlightResult.value) {
    return '结果较少，首页优先突出核心图片。'
  }
  if (hasActiveFilters.value) {
    return `当前按筛选条件展示 ${total.value} 张公开图片。`
  }
  return '浏览全部公开图库，按需筛选并打开详情。'
})
const compactFocusHint = computed(() => {
  if (total.value === 0) {
    return '暂无匹配结果，可尝试清空筛选。'
  }
  if (hasActiveFilters.value) {
    return `已聚焦：${focusTitle.value}`
  }
  return '结果较少，已切换聚焦浏览。'
})
const stageTitle = computed(() => {
  if (loading.value) {
    return '正在加载公开图库内容'
  }
  if (total.value === 0) {
    return '当前没有匹配内容'
  }
  if (isSpotlightResult.value) {
    return `聚焦展示 ${visibleResultCount.value} 张核心图片`
  }
  return `共收录 ${total.value} 张公开图片`
})
const stageSubtitle = computed(() => {
  if (total.value === 0) {
    return '尝试清空筛选或调整关键词，快速回到推荐内容。'
  }
  if (isSpotlightResult.value) {
    return '当前为聚焦展示，先查看核心图片，再决定是否继续扩展筛选。'
  }
  if (hasActiveFilters.value) {
    return `当前焦点：${focusTitle.value} · ${sortCaption.value}`
  }
  return `当前按 ${sortCaption.value} 排序，滚动浏览最新公开内容。`
})

const formatDateLabel = (rawTime: unknown) => {
  if (!rawTime) {
    return '最近更新'
  }
  const parsed = new Date(String(rawTime))
  if (Number.isNaN(parsed.getTime())) {
    return '最近更新'
  }
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${month}.${day}`
}

const primaryPicture = computed(() => dataList.value[0] ?? null)
const primaryPictureCaption = computed(() => {
  if (!primaryPicture.value) {
    return '公开图库焦点内容'
  }
  const picture = primaryPicture.value
  const category = picture.category?.trim() || '默认分类'
  const author = picture.user?.userName?.trim() || 'Sion Picture'
  return `${category} · ${author}`
})
const primaryPictureCategory = computed(
  () => primaryPicture.value?.category?.trim() || '默认分类',
)
const primaryPictureUpdatedAt = computed(() =>
  formatDateLabel(primaryPicture.value?.editTime ?? primaryPicture.value?.createTime),
)
const primaryPictureResolution = computed(() => {
  if (!primaryPicture.value) {
    return '分辨率未知'
  }
  const width = Number(primaryPicture.value.picWidth)
  const height = Number(primaryPicture.value.picHeight)
  if (width > 0 && height > 0) {
    return `${width} × ${height}`
  }
  return '分辨率未知'
})
const primaryPictureFormatLabel = computed(() => {
  const format = primaryPicture.value?.picFormat?.toString().trim().toUpperCase()
  return format || 'IMAGE'
})
const hotCategoryChips = computed(() => {
  const categoryMap = new Map<string, number>()
  dataList.value.forEach((item) => {
    const category = item.category?.trim()
    if (!category) {
      return
    }
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1)
  })
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})
const visibleHotCategoryChips = computed(() =>
  hotCategoryChips.value.length <= 1 ? [] : hotCategoryChips.value,
)
const galleryStageStyle = computed(() => ({
  '--spotlight-x': `${gallerySpotlightX.value}%`,
  '--spotlight-y': `${gallerySpotlightY.value}%`,
}))

const applySortKey = (key: 'latest' | 'earliest') => {
  sortKey.value = key
  searchParams.sortField = 'createTime'
  searchParams.sortOrder = key === 'earliest' ? 'ascend' : 'descend'
}

const getQueryFirst = (value: LocationQuery[keyof LocationQuery]): string | undefined => {
  if (Array.isArray(value)) {
    const first = value.find((item) => item != null)
    return first ?? undefined
  }
  if (value == null) {
    return undefined
  }
  return value
}

const toPositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

const applyPendingRouteTags = () => {
  if (!tagList.value.length) {
    return
  }
  const tagSet = new Set(pendingRouteTags.value)
  selectedTagList.value = tagList.value.map((tag) => tagSet.has(tag))
}

const applyQueryToState = (query: LocationQuery) => {
  searchParams.searchText = getQueryFirst(query.q)?.trim() ?? ''
  searchParams.current = toPositiveInt(getQueryFirst(query.page), DEFAULT_PAGE)
  searchParams.pageSize = toPositiveInt(getQueryFirst(query.pageSize), DEFAULT_PAGE_SIZE)

  const routeCategory = getQueryFirst(query.category)?.trim()
  if (
    routeCategory &&
    (categoryList.value.length === 0 || categoryList.value.includes(routeCategory))
  ) {
    selectedCategory.value = routeCategory
  } else {
    selectedCategory.value = 'all'
  }

  pendingRouteTags.value = (getQueryFirst(query.tags) ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  applyPendingRouteTags()

  const routeView = getQueryFirst(query.view)
  viewMode.value = routeView === 'compact' ? 'compact' : 'comfortable'

  const routeSort = getQueryFirst(query.sort)
  applySortKey(routeSort === 'earliest' ? 'earliest' : DEFAULT_SORT_KEY)
}

const buildQueryFromState = (): LocationQueryRaw => {
  const query: LocationQueryRaw = {}
  const keyword = searchParams.searchText?.trim()
  if (keyword) {
    query.q = keyword
  }
  if (selectedCategory.value !== 'all') {
    query.category = selectedCategory.value
  }
  if (selectedTagNames.value.length > 0) {
    query.tags = selectedTagNames.value.join(',')
  }
  if (searchParams.current && searchParams.current !== DEFAULT_PAGE) {
    query.page = String(searchParams.current)
  }
  if (searchParams.pageSize && searchParams.pageSize !== DEFAULT_PAGE_SIZE) {
    query.pageSize = String(searchParams.pageSize)
  }
  if (viewMode.value === 'compact') {
    query.view = 'compact'
  }
  if (sortKey.value !== DEFAULT_SORT_KEY) {
    query.sort = sortKey.value
  }
  return query
}

const normalizeQueryObject = (query: LocationQuery | LocationQueryRaw) => {
  const normalized: Record<string, string> = {}
  Object.entries(query).forEach(([key, rawValue]) => {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
    if (value == null) {
      return
    }
    const stringValue = String(value).trim()
    if (!stringValue) {
      return
    }
    normalized[key] = stringValue
  })
  return normalized
}

const isSameQuery = (left: Record<string, string>, right: Record<string, string>) => {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) {
    return false
  }
  return leftKeys.every((key) => left[key] === right[key])
}

const syncRouteQuery = async () => {
  const nextQuery = buildQueryFromState()
  const currentQuery = normalizeQueryObject(route.query)
  const normalizedNextQuery = normalizeQueryObject(nextQuery)
  if (isSameQuery(currentQuery, normalizedNextQuery)) {
    return
  }
  isSyncingRouteQuery.value = true
  try {
    await router.replace({
      path: route.path,
      query: nextQuery,
    })
  } finally {
    isSyncingRouteQuery.value = false
  }
}

const fetchData = async (options: { syncQuery?: boolean } = {}) => {
  const { syncQuery = true } = options
  if (syncQuery) {
    await syncRouteQuery()
  }
  loading.value = true
  const params = {
    ...searchParams,
    nullSpaceId: true,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  tagList.value.forEach((tag, index) => {
    if (selectedTagList.value[index]) {
      params.tags.push(tag)
    }
  })
  const res = await postPictureListPageVo(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error(`获取数据失败，${res.data.message}`)
  }
  loading.value = false
}

const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const changeCategory = (category: string) => {
  if (selectedCategory.value === category) {
    return
  }
  selectedCategory.value = category
  doSearch()
}

const setViewMode = (mode: 'comfortable' | 'compact') => {
  if (viewMode.value === mode) {
    return
  }
  viewMode.value = mode
  syncRouteQuery()
}

const applyDisplayViewMode = (mode: 'comfortable' | 'compact') => {
  setViewMode(mode)
  showDisplayPanel.value = false
}

const setSortKey = (key: 'latest' | 'earliest') => {
  if (sortKey.value === key) {
    return
  }
  applySortKey(key)
  searchParams.current = 1
  fetchData()
}

const applyDisplaySort = (key: 'latest' | 'earliest') => {
  setSortKey(key)
  showDisplayPanel.value = false
}

const toggleFilterSection = (section: keyof typeof filterSectionOpen) => {
  filterSectionOpen[section] = !filterSectionOpen[section]
}

const clearFilters = () => {
  searchParams.searchText = ''
  selectedCategory.value = 'all'
  selectedTagList.value = tagList.value.map(() => false)
  tagSearchText.value = ''
  showFilters.value = false
  doSearch()
  searchInputRef.value?.focus?.()
}

const toggleFilterPanel = () => {
  showFilters.value = !showFilters.value
}

const onGalleryStageMove = (event: MouseEvent) => {
  const stage = event.currentTarget as HTMLElement | null
  if (!stage) {
    return
  }
  const rect = stage.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return
  }
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  gallerySpotlightX.value = Math.min(100, Math.max(0, x))
  gallerySpotlightY.value = Math.min(100, Math.max(0, y))
}

const resetGalleryStageSpotlight = () => {
  gallerySpotlightX.value = 50
  gallerySpotlightY.value = 12
}

const goTo = (path: string) => {
  router.push(path)
}

const goToPicture = (id: number | string | undefined) => {
  if (!id) {
    return
  }
  router.push(`/picture/${id}`)
}

const getTagCategoryOptions = async () => {
  const res = await getPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList ?? []
    categoryList.value = res.data.data.categoryList ?? []
    selectedTagList.value = tagList.value.map(() => false)
    applyPendingRouteTags()
    if (
      selectedCategory.value !== 'all' &&
      !categoryList.value.includes(selectedCategory.value)
    ) {
      selectedCategory.value = 'all'
    }
  } else {
    message.error(`获取标签分类列表失败，${res.data?.message ?? '请稍后重试'}`)
  }
}

const buildDataQuerySignature = (query: LocationQuery) => {
  return [
    getQueryFirst(query.q) ?? '',
    getQueryFirst(query.category) ?? '',
    getQueryFirst(query.tags) ?? '',
    getQueryFirst(query.sort) ?? '',
    getQueryFirst(query.page) ?? '',
    getQueryFirst(query.pageSize) ?? '',
  ].join('|')
}

watch(
  () => route.query,
  async (nextQuery, previousQuery) => {
    if (isSyncingRouteQuery.value) {
      return
    }
    const previousDataSignature = previousQuery
      ? buildDataQuerySignature(previousQuery)
      : ''
    const nextDataSignature = buildDataQuerySignature(nextQuery)
    applyQueryToState(nextQuery)
    if (previousDataSignature !== nextDataSignature) {
      await fetchData()
    }
  },
)

onMounted(async () => {
  applyQueryToState(route.query)
  await getTagCategoryOptions()
  await fetchData()
})
</script>

<style scoped>
#homePage {
  --page-bg-top: #f8fafd;
  --page-bg-bottom: #edf2f8;
  --surface: #ffffff;
  --surface-soft: #f4f8fc;
  --line: #d5dfeb;
  --line-strong: #b7c7d9;
  --text-main: #1f2d3d;
  --text-subtle: #5c6f85;
  --brand: #355273;
  --brand-hover: #294565;

  margin-bottom: 14px;
  padding: 8px 6px 20px;
  border-radius: 22px;
  background:
    radial-gradient(120% 100% at 100% -10%, rgb(193 212 233 / 35%) 0%, transparent 58%),
    radial-gradient(130% 110% at 0% 0%, rgb(255 255 255 / 90%) 0%, transparent 55%),
    linear-gradient(180deg, var(--page-bg-top) 0%, var(--page-bg-bottom) 100%);
  display: grid;
  gap: 10px;
}

.workspace-topbar,
.list-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
}

.workspace-topbar {
  position: relative;
  overflow: hidden;
  padding: 12px;
  box-shadow: 0 8px 20px rgb(32 49 71 / 6%);
  background:
    radial-gradient(130% 110% at 6% -20%, rgb(150 181 212 / 28%) 0%, transparent 56%),
    radial-gradient(120% 110% at 100% 0%, rgb(205 222 240 / 24%) 0%, transparent 58%),
    linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, rgb(244 248 253 / 92%) 100%),
    var(--surface);
  display: grid;
  gap: 10px;
}

.workspace-topbar--compact {
  padding: 10px;
  gap: 8px;
}

.workspace-topbar::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(130deg, rgb(117 146 177 / 12%) 0%, rgb(117 146 177 / 0%) 50%);
  pointer-events: none;
}

.workspace-topbar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(rgb(139 166 195 / 14%) 0.5px, transparent 0.5px),
    linear-gradient(180deg, rgb(255 255 255 / 0%) 0%, rgb(255 255 255 / 52%) 100%);
  background-size:
    10px 10px,
    100% 100%;
  mask-image: linear-gradient(180deg, rgb(0 0 0 / 45%) 0%, rgb(0 0 0 / 0%) 74%);
  pointer-events: none;
}

.topbar-brief-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.topbar-brief-main {
  display: grid;
  gap: 4px;
  min-width: min(100%, 280px);
}

.workspace-subtitle {
  margin: 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--text-subtle);
}

.workspace-kicker {
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #cfdeed;
  background: linear-gradient(180deg, #ffffff 0%, #eff5fc 100%);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  color: #3d5d7e;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workspace-title {
  margin: 0;
  color: #1f354c;
  font-size: clamp(19px, 2.2vw, 28px);
  line-height: 1.16;
  letter-spacing: -0.01em;
  font-weight: 700;
  max-width: 20ch;
}

.topbar-kpi-strip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.topbar-kpi {
  min-height: 24px;
  border-radius: 999px;
  border: 1px solid #d6e3f0;
  background: linear-gradient(180deg, #ffffff 0%, #f2f7fd 100%);
  padding: 2px 8px;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.topbar-kpi strong {
  font-size: 13px;
  line-height: 1.1;
  color: #203950;
}

.topbar-kpi span {
  font-size: 10px;
  color: var(--text-subtle);
}

.topbar-kpi--ghost {
  border-style: dashed;
  background: rgb(255 255 255 / 48%);
}

.topbar-control-row {
  display: grid;
  grid-template-columns: minmax(220px, 460px) minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  padding: 3px;
  border: 1px solid #dbe6f1;
  border-radius: 11px;
  background: linear-gradient(180deg, rgb(255 255 255 / 76%) 0%, rgb(246 250 255 / 78%) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 68%),
    0 2px 8px rgb(39 61 86 / 4%);
  position: relative;
  z-index: 1;
}

.topbar-control-row--quiet {
  border-color: #dde7f2;
  background: linear-gradient(180deg, rgb(255 255 255 / 82%) 0%, rgb(245 249 254 / 80%) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 68%);
}

.workspace-topbar--compact .topbar-kpi-strip,
.workspace-topbar--compact .topbar-context-row {
  opacity: 0.9;
}

.topbar-control-row::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid rgb(255 255 255 / 38%);
  pointer-events: none;
}

.topbar-search-shell {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 5px;
}

.topbar-search {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
}

.topbar-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  flex-wrap: wrap;
  min-height: 28px;
}

.topbar-actions :deep(.ant-btn) {
  min-height: 22px;
  border-radius: 999px;
  padding-inline: 8px;
  font-size: 10px;
}

.topbar-actions--quiet {
  opacity: 0.84;
}

.topbar-actions--quiet .display-action-btn {
  border-color: #d9e4f0;
  background: #f2f7fc;
}

.display-action-btn {
  min-height: 22px;
  border-radius: 999px;
  border-color: #d2dfec;
  background: linear-gradient(180deg, #fbfeff 0%, #f1f7fd 100%);
  color: #3f5c7b;
  padding-inline: 8px;
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.display-action-btn:hover,
.display-action-btn:focus {
  border-color: #aec3d8;
  color: #26435f;
  background: #e8f0f9;
}

.display-action-caption {
  font-size: 9px;
  color: #6a8199;
}

.display-panel {
  min-width: 208px;
  display: grid;
  gap: 8px;
}

.display-group {
  display: grid;
  gap: 4px;
}

.display-group + .display-group {
  padding-top: 8px;
  border-top: 1px solid #e3ebf4;
}

.display-group-title {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f7690;
}

.display-options {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.display-option-btn {
  min-height: 24px;
  border: 1px solid #d2deea;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff 0%, #f1f7fd 100%);
  color: #5e7690;
  padding: 0 8px;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.display-option-btn:hover {
  border-color: #aec3d8;
  color: #2e4b67;
}

.display-option-btn.is-active {
  border-color: #9db6ce;
  background: #e5eef8;
  color: #213b56;
  font-weight: 600;
}

.display-option-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

.filter-toggle-btn {
  min-height: 24px;
  border-radius: 999px;
  padding-inline: 9px;
  font-size: 10px;
  border-color: #c9d9ea;
  background: linear-gradient(180deg, #f9fcff 0%, #eef5fc 100%);
  color: #355272;
}

.filter-toggle-btn:hover,
.filter-toggle-btn:focus {
  border-color: #abc1d8;
  color: #213a55;
  background: #e8f0f9;
}

.filter-toggle-btn--inline {
  flex-shrink: 0;
}

.filter-count-badge {
  display: inline-grid;
  place-items: center;
  margin-left: 2px;
  min-width: 16px;
  height: 16px;
  padding-inline: 4px;
  border-radius: 999px;
  background: #355273;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

.more-action-btn {
  border-color: #d1dfec;
  background: linear-gradient(180deg, #fafdff 0%, #f1f7fd 100%);
  color: #4a627d;
}

.more-action-btn:hover,
.more-action-btn:focus {
  border-color: #aec4da;
  color: #2c4561;
  background: #e6f0fb;
}

.topbar-context-row {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 6px;
}

.active-filter-strip {
  min-height: 32px;
  border-radius: 10px;
  border: 1px solid #d2deea;
  background: linear-gradient(180deg, #f6faff 0%, #edf4fb 100%);
  padding: 5px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
  position: relative;
  z-index: 1;
}

.active-filter-label {
  font-size: 11px;
  color: var(--text-subtle);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.trend-strip {
  min-height: 32px;
  border-radius: 10px;
  border: 1px solid #d2deea;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  padding: 5px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
  position: relative;
  z-index: 1;
}

.trend-label {
  font-size: 11px;
  color: var(--text-subtle);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.trend-chip {
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #cfdceb;
  background: linear-gradient(180deg, #ffffff 0%, #eef5fc 100%);
  padding: 1px 8px;
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  color: #32506f;
  font-size: 11px;
  flex-shrink: 0;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.trend-chip strong {
  color: #5a7490;
  font-size: 11px;
}

.trend-chip:hover {
  border-color: #a8bfd6;
  background: #e7f1fb;
}

.trend-chip.is-active {
  border-color: #8fa9c5;
  background: #dfeaf6;
  color: #233c57;
}

.active-filter-strip::-webkit-scrollbar,
.trend-strip::-webkit-scrollbar {
  display: none;
}

.list-panel {
  padding: 12px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-color: #cedceb;
  box-shadow: 0 12px 26px rgb(35 54 78 / 8%);
  background:
    radial-gradient(74% 90% at 100% 0%, rgb(197 214 234 / 17%) 0%, transparent 58%),
    radial-gradient(84% 92% at 0% 100%, rgb(217 231 246 / 20%) 0%, transparent 64%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.list-panel--spotlight {
  padding-top: 14px;
  border-color: #c6d8ea;
  box-shadow: 0 16px 34px rgb(35 54 78 / 10%);
}

.list-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(145deg, rgb(255 255 255 / 65%) 0%, rgb(255 255 255 / 0%) 62%);
  pointer-events: none;
  z-index: 0;
}

.stage-story {
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
  border-radius: 14px;
  border: 1px solid #d5e2ef;
  background:
    radial-gradient(132% 110% at 0% -8%, rgb(178 203 228 / 27%) 0%, transparent 58%),
    radial-gradient(120% 100% at 100% 110%, rgb(219 232 246 / 22%) 0%, transparent 64%),
    linear-gradient(180deg, rgb(255 255 255 / 90%) 0%, rgb(242 248 254 / 88%) 100%),
    #f7fbff;
  padding: 12px 14px;
  display: grid;
  gap: 10px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 80%),
    0 10px 20px rgb(37 57 80 / 7%);
}

.stage-story-light {
  position: absolute;
  inset: -42% -14% auto;
  height: 58%;
  background: radial-gradient(circle at 56% 36%, rgb(138 169 201 / 28%) 0%, rgb(138 169 201 / 0%) 62%);
  pointer-events: none;
  z-index: 0;
}

.stage-story::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(130deg, rgb(162 189 217 / 24%) 0%, rgb(162 189 217 / 0%) 44%),
    repeating-linear-gradient(124deg, rgb(255 255 255 / 16%) 0 2px, rgb(255 255 255 / 0%) 2px 9px);
  opacity: 0.6;
  pointer-events: none;
}

.stage-story-main {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 6px;
}

.stage-story--spotlight {
  border-color: #c8d8e9;
  background:
    radial-gradient(140% 110% at 50% -16%, rgb(161 190 219 / 30%) 0%, transparent 58%),
    linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, rgb(241 247 253 / 90%) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 82%);
}

.stage-story-kicker {
  width: fit-content;
  min-height: 20px;
  border-radius: 999px;
  border: 1px solid #c9d9ea;
  background: #ecf4fd;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #56708c;
  font-weight: 700;
}

.stage-story-title {
  margin: 0;
  color: #1f354b;
  font-size: clamp(20px, 2.1vw, 26px);
  line-height: 1.2;
  font-weight: 700;
}

.stage-story-subtitle {
  margin: 0;
  color: #5a718a;
  font-size: 12px;
  line-height: 1.55;
  max-width: 64ch;
}

.stage-story-metrics {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.story-metric {
  min-height: 24px;
  border-radius: 999px;
  border: 1px solid #cad9e8;
  background: linear-gradient(180deg, #ffffff 0%, #ecf4fc 100%);
  padding: 2px 10px;
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  color: #546e88;
  font-size: 10px;
}

.story-metric strong {
  color: #203950;
  font-size: 13px;
  line-height: 1;
}

.stage-feature-card {
  position: relative;
  z-index: 1;
  border-radius: 12px;
  border: 1px solid #c7d8ea;
  background:
    radial-gradient(122% 100% at 50% -14%, rgb(164 190 216 / 34%) 0%, transparent 58%),
    linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, rgb(238 246 254 / 92%) 100%);
  display: grid;
  gap: 9px;
  padding: 10px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 78%);
}

.stage-feature-media-wrap {
  position: relative;
}

.stage-feature-media {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #cfdeec;
  height: 132px;
  object-fit: cover;
  object-position: center;
  display: block;
}

.stage-feature-overlay {
  position: absolute;
  inset: 7px 7px auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  pointer-events: none;
}

.stage-feature-badge {
  min-height: 20px;
  max-width: 58%;
  border-radius: 999px;
  border: 1px solid rgb(213 226 240 / 90%);
  background: rgb(255 255 255 / 84%);
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  color: #334f6d;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  backdrop-filter: blur(4px);
}

.stage-feature-badge--dark {
  border-color: rgb(64 92 123 / 36%);
  background: rgb(40 62 85 / 72%);
  color: #ecf3fb;
}

.stage-feature-body {
  display: grid;
  gap: 5px;
}

.stage-feature-kicker {
  width: fit-content;
  min-height: 18px;
  border-radius: 999px;
  border: 1px solid #c7d9ea;
  background: #edf4fc;
  color: #5c7590;
  padding: 0 7px;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}

.stage-feature-title {
  margin: 0;
  color: #233d58;
  font-size: 15px;
  line-height: 1.3;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-feature-subtitle {
  margin: 0;
  color: #5c7390;
  font-size: 12px;
  line-height: 1.5;
}

.stage-feature-meta {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.stage-feature-meta-item {
  min-height: 20px;
  border-radius: 999px;
  border: 1px solid #d2e0ee;
  background: #eef5fc;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  color: #506b87;
  font-size: 10px;
}

.stage-feature-btn {
  width: fit-content;
}

@media (min-width: 1080px) {
  .stage-story {
    grid-template-columns: minmax(0, 1fr) minmax(250px, 332px);
    align-items: stretch;
  }

  .stage-feature-card {
    height: 100%;
  }

  .stage-feature-media {
    height: 148px;
  }
}

.list-head {
  position: relative;
  z-index: 1;
  margin-bottom: 7px;
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.list-focus {
  position: relative;
  min-height: 30px;
  border-radius: 12px;
  border: 1px solid #ccdceb;
  background:
    linear-gradient(180deg, #fcfeff 0%, #eef5fc 100%),
    linear-gradient(120deg, rgb(157 186 215 / 10%) 0%, rgb(157 186 215 / 0%) 46%);
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 1 1 240px;
  min-width: min(100%, 220px);
  max-width: min(100%, 360px);
  flex-wrap: wrap;
  overflow: hidden;
}

.list-focus::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #7ea1c5 0%, #b8cde3 100%);
  opacity: 0.76;
}

.list-focus-kicker {
  border-radius: 999px;
  border: 1px solid #ccdaea;
  background: #f0f6fd;
  color: #5e7590;
  padding: 0 7px;
  min-height: 18px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.list-focus-title {
  color: #29445f;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-focus-subtitle {
  margin: 0;
  width: 100%;
  color: #667d95;
  font-size: 10.5px;
  line-height: 1.45;
}

.list-focus-subtitle--compact {
  color: #5e7690;
}

.list-head--spotlight {
  margin-bottom: 8px;
}

.list-focus--spotlight {
  border-color: #c8d9ea;
  background: linear-gradient(180deg, #fcfeff 0%, #eff6fd 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 78%),
    0 8px 20px rgb(38 58 80 / 9%);
}

.list-tools {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  flex-wrap: wrap;
}

.list-tools--leading {
  min-height: 26px;
  padding: 0;
  flex: 1 1 300px;
  min-width: min(100%, 230px);
}

.list-pill {
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #d7e3ef;
  background: linear-gradient(180deg, #fcfeff 0%, #f1f7fd 100%);
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  color: #5a728b;
  font-size: 9.5px;
  line-height: 1;
}

.list-pill--strong {
  color: #1f344a;
  border-color: #ccdced;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fb 100%);
  font-weight: 600;
}

.list-pill--primary {
  border-color: #cedeed;
  color: #2f4b67;
  font-weight: 600;
}

.list-pill--meta {
  color: #617891;
}

.gallery-stage {
  --spotlight-x: 50%;
  --spotlight-y: 12%;

  position: relative;
  border-radius: 14px;
  border: 1px solid #d4e2f1;
  padding: 10px;
  background:
    radial-gradient(140% 110% at 0% -12%, rgb(176 202 229 / 26%) 0%, transparent 56%),
    radial-gradient(130% 120% at 100% 0%, rgb(206 222 239 / 26%) 0%, transparent 62%),
    linear-gradient(180deg, rgb(255 255 255 / 86%) 0%, rgb(246 251 255 / 88%) 100%),
    var(--surface);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 86%),
    0 12px 26px rgb(36 56 79 / 9%);
  z-index: 1;
  overflow: hidden;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.gallery-stage--has-items {
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 84%),
    0 16px 32px rgb(36 56 79 / 12%);
}

.gallery-stage--has-items:hover {
  border-color: #bfd3e8;
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 86%),
    0 20px 36px rgb(36 56 79 / 14%);
}

.gallery-stage::before {
  content: '';
  position: absolute;
  inset: -14% -8% auto;
  height: 220px;
  border-radius: inherit;
  background: radial-gradient(
    circle at var(--spotlight-x) var(--spotlight-y),
    rgb(132 163 194 / 46%) 0%,
    rgb(139 169 199 / 0%) 64%
  );
  opacity: 1;
  pointer-events: none;
  animation: stageAuraShift 12s ease-in-out infinite;
}

.gallery-stage::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(rgb(113 141 172 / 12%) 0.55px, transparent 0.55px),
    linear-gradient(180deg, rgb(255 255 255 / 0%) 0%, rgb(255 255 255 / 50%) 100%);
  background-size:
    11px 11px,
    100% 100%;
  mask-image: linear-gradient(180deg, rgb(0 0 0 / 48%) 0%, rgb(0 0 0 / 0%) 82%);
  pointer-events: none;
}

.gallery-stage > * {
  position: relative;
  z-index: 1;
}

.gallery-stage--sparse {
  background:
    radial-gradient(120% 90% at 50% -8%, rgb(176 202 228 / 23%) 0%, transparent 58%),
    linear-gradient(180deg, rgb(255 255 255 / 90%) 0%, rgb(247 251 255 / 92%) 100%);
  max-width: min(100%, 960px);
  margin-inline: auto;
}

.gallery-stage--spotlight {
  padding: 14px;
  border-color: #c8d9ea;
  background:
    radial-gradient(120% 90% at 50% -10%, rgb(170 195 221 / 40%) 0%, transparent 58%),
    linear-gradient(120deg, rgb(150 182 214 / 9%) 0%, rgb(150 182 214 / 0%) 48%),
    linear-gradient(180deg, rgb(255 255 255 / 92%) 0%, rgb(246 251 255 / 94%) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 86%),
    0 18px 34px rgb(35 55 78 / 13%);
}

.gallery-stage--spotlight::before {
  inset: -10% -6% auto;
  height: 280px;
  opacity: 1;
}

@keyframes stageAuraShift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, 6px, 0) scale(1.05);
  }
}

.list-panel--sparse .result-tip,
.list-panel--sparse .pagination-wrap {
  max-width: min(100%, 960px);
  margin-inline: auto;
}

.result-tip {
  margin: 8px 2px 0;
  color: var(--text-subtle);
  font-size: 12px;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}

.result-tip--empty {
  color: #516982;
}

.filter-panel {
  display: grid;
  gap: 10px;
}

.filter-head,
.tag-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-head {
  margin-bottom: 2px;
}

.filter-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
  color: var(--text-main);
}

.filter-meta {
  font-size: 12px;
  color: var(--text-subtle);
}

.filter-group + .filter-group {
  margin-top: 2px;
}

.fold-group {
  border: 1px solid #e1ebf6;
  border-radius: 10px;
  padding: 8px;
  background: #fbfdff;
}

.fold-trigger {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  cursor: pointer;
}

.fold-trigger:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
  border-radius: 8px;
}

.group-title {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-main);
  font-weight: 600;
}

.fold-meta {
  font-size: 11px;
  color: var(--text-subtle);
  max-width: 58%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fold-body {
  margin-top: 8px;
}

.tag-filter-bar {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-filter-meta {
  font-size: 12px;
  color: var(--text-subtle);
  white-space: nowrap;
}

.tag-empty {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--text-subtle);
}

.tag-meta,
.list-meta {
  font-size: 11px;
  line-height: 1;
  color: var(--text-subtle);
}

.pagination-wrap {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 40px;
  position: relative;
  z-index: 1;
}

.workspace-filter-drawer :deep(.ant-drawer-content) {
  background:
    radial-gradient(120% 120% at 100% 0%, rgb(193 212 233 / 20%) 0%, transparent 60%),
    linear-gradient(180deg, #f8fbff 0%, #f2f7fd 100%);
}

.workspace-filter-drawer :deep(.ant-drawer-header) {
  padding: 12px 14px;
  border-bottom: 1px solid #dce7f3;
  background: linear-gradient(180deg, #ffffff 0%, #f5f9fe 100%);
}

.workspace-filter-drawer :deep(.ant-drawer-title) {
  color: var(--text-main);
  font-weight: 600;
}

.workspace-filter-drawer :deep(.ant-drawer-body) {
  padding: 12px;
}

#homePage :deep(.ant-input-search .ant-input),
#homePage :deep(.ant-input-search-button) {
  height: 28px;
}

#homePage :deep(.ant-input-search .ant-input) {
  border-color: #cddded;
  border-radius: 999px;
  background: rgb(249 252 255 / 90%);
  padding-inline: 11px;
  font-size: 11.5px;
}

#homePage :deep(.ant-input-search-without-button .ant-input) {
  border-radius: 999px;
}

#homePage :deep(.topbar-search .ant-input-search .ant-input::placeholder) {
  color: #7a91a9;
  font-size: 11px;
}

#homePage :deep(.ant-input-search .ant-input:focus),
#homePage :deep(.ant-input-search .ant-input-focused) {
  border-color: #97b1cb;
  box-shadow: 0 0 0 2px rgb(113 147 180 / 14%);
}

#homePage :deep(.ant-input-search-button) {
  border-color: var(--brand);
  background: var(--brand);
  border-radius: 0 10px 10px 0;
}

#homePage :deep(.ant-input-search-button:hover),
#homePage :deep(.ant-input-search-button:focus) {
  border-color: var(--brand-hover);
  background: var(--brand-hover);
}

#homePage :deep(.ant-btn-primary) {
  border-color: var(--brand);
  background: var(--brand);
}

#homePage :deep(.ant-btn-primary:hover),
#homePage :deep(.ant-btn-primary:focus) {
  border-color: var(--brand-hover);
  background: var(--brand-hover);
}

#homePage :deep(.ant-tag-checkable) {
  margin-top: 0;
  margin-right: 0;
  padding: 4px 9px;
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface-soft);
  color: var(--text-subtle);
  line-height: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

#homePage :deep(.ant-tag-checkable:hover) {
  border-color: #9fb4cc;
  color: #2f4f71;
}

#homePage :deep(.ant-tag-checkable-checked) {
  color: #20344d;
  border-color: #9eb3ca;
  background: #e1ebf6;
}

#homePage :deep(.tag-filter-bar .ant-input-affix-wrapper) {
  border-radius: 10px;
  border-color: var(--line);
}

#homePage :deep(.tag-filter-bar .ant-input-affix-wrapper:focus),
#homePage :deep(.tag-filter-bar .ant-input-affix-wrapper-focused) {
  border-color: var(--brand);
  box-shadow: 0 0 0 2px rgb(53 82 115 / 10%);
}

#homePage :deep(.active-filter-strip .ant-tag) {
  margin-inline-end: 0;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid #d0dce8;
  background: #edf4fb;
  color: #2f4e6e;
}

#homePage :deep(.picture-list .ant-card) {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--line);
  box-shadow: 0 8px 20px rgb(31 45 61 / 6%);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

#homePage :deep(.picture-list .ant-card:hover) {
  border-color: #aabed4;
  box-shadow: 0 14px 28px rgb(31 45 61 / 12%);
  transform: translateY(-2px);
}

#homePage :deep(.picture-list .ant-card-meta-title) {
  color: var(--text-main);
}

#homePage :deep(.picture-list .ant-tag) {
  border-radius: 999px;
  border-color: #d0dbe8;
  background: #eff4fa;
  color: #4d637a;
}

#homePage :deep(.ant-pagination-item),
#homePage :deep(.ant-pagination-prev .ant-pagination-item-link),
#homePage :deep(.ant-pagination-next .ant-pagination-item-link) {
  border-color: var(--line);
  border-radius: 10px;
}

#homePage :deep(.ant-pagination-item-active) {
  border-color: #9fb5cd;
  background: #e6eef7;
}

#homePage :deep(.ant-pagination-item-active a) {
  color: #20344d;
}

@media (max-width: 1140px) {
  .topbar-brief-row {
    align-items: flex-start;
  }

  .topbar-brief-main {
    width: 100%;
  }

  .topbar-control-row {
    grid-template-columns: 1fr;
  }

  .topbar-search-shell {
    width: 100%;
  }

  .topbar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  .workspace-subtitle {
    width: 100%;
  }

  .workspace-title {
    max-width: none;
  }

  .topbar-kpi-strip {
    width: 100%;
    justify-content: flex-start;
  }

  .list-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .list-focus {
    flex: 1 1 auto;
    max-width: none;
    width: 100%;
  }

  .list-tools {
    justify-content: flex-start;
  }

  .list-tools--leading {
    flex: 1 1 auto;
  }

  .stage-story-subtitle {
    max-width: none;
  }

  .stage-feature-media {
    height: 138px;
  }
}

@media (max-width: 768px) {
  #homePage {
    padding: 0;
    border-radius: 0;
  }

  .workspace-topbar,
  .list-panel {
    border-radius: 12px;
    padding: 11px;
  }

  .topbar-brief-row {
    gap: 8px;
  }

  .topbar-kpi-strip {
    width: 100%;
  }

  .topbar-control-row {
    padding: 4px;
  }

  .topbar-search-shell {
    width: 100%;
    gap: 4px;
  }

  .topbar-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 1px;
  }

  .display-action-caption {
    display: none;
  }

  .topbar-actions::-webkit-scrollbar {
    display: none;
  }

  .workspace-title {
    font-size: clamp(18px, 7vw, 23px);
  }

  .stage-story {
    padding: 10px 11px;
    border-radius: 12px;
    gap: 8px;
  }

  .stage-story-title {
    font-size: 18px;
  }

  .stage-story-metrics {
    gap: 5px;
  }

  .story-metric {
    min-height: 22px;
    padding-inline: 8px;
  }

  .story-metric strong {
    font-size: 12px;
  }

  .workspace-kicker {
    letter-spacing: 0.08em;
  }

  .list-tools--leading {
    width: 100%;
    justify-content: flex-start;
    overflow: visible;
    flex-wrap: wrap;
    row-gap: 4px;
  }

  .list-focus-title {
    max-width: min(100%, 200px);
  }

  .list-focus-subtitle {
    font-size: 9.5px;
  }

  .list-pill {
    min-height: 20px;
    font-size: 9px;
    padding-inline: 6px;
  }

  .list-pill--label {
    display: none;
  }

  .list-divider {
    display: none;
  }

  .gallery-stage {
    border-radius: 12px;
    padding: 8px;
  }

  .pagination-wrap {
    justify-content: center;
  }

  .active-filter-strip {
    padding: 6px 8px;
  }
}

@media (max-width: 480px) {
  .topbar-kpi {
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  #homePage :deep(*) {
    transition: none !important;
    animation: none !important;
  }

  .gallery-stage,
  .gallery-stage::before {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
</style>

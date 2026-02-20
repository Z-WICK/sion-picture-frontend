<template>
  <div id="homePage">
    <section class="workspace-topbar">
      <div class="topbar-title-block">
        <h1 class="workspace-title">图片工作台</h1>
        <p class="workspace-subtitle">
          公开图库 {{ total }} 张 · 聚焦检索与浏览
        </p>
      </div>

      <div class="topbar-search">
        <a-input-search
          ref="searchInputRef"
          v-model:value="searchParams.searchText"
          placeholder="搜索图片关键词"
          enter-button="搜索"
          @search="doSearch"
        />
      </div>

      <div class="topbar-actions">
        <a-dropdown>
          <a-button>
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
    </section>

    <section class="workspace-grid">
      <aside id="discoverPanel" class="filter-panel">
        <div class="filter-head">
          <span class="filter-title">筛选条件</span>
          <a-button type="link" @click="clearFilters">清空筛选</a-button>
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
      </aside>

      <section class="list-panel">
        <div class="list-head">
          <div class="list-title-block">
            <h2 class="list-title">图片结果</h2>
            <p class="list-caption">{{ sortCaption }}</p>
          </div>
          <div class="list-tools">
            <span class="list-meta">共 {{ total }} 张</span>
            <div class="sort-switch" role="group" aria-label="结果排序方式">
              <button
                type="button"
                class="sort-switch-btn"
                :class="{ 'is-active': sortKey === 'latest' }"
                :aria-pressed="sortKey === 'latest'"
                @click="setSortKey('latest')"
              >
                最新
              </button>
              <button
                type="button"
                class="sort-switch-btn"
                :class="{ 'is-active': sortKey === 'earliest' }"
                :aria-pressed="sortKey === 'earliest'"
                @click="setSortKey('earliest')"
              >
                最早
              </button>
            </div>
            <div class="view-switch" role="group" aria-label="结果视图密度">
              <button
                type="button"
                class="view-switch-btn"
                :class="{ 'is-active': viewMode === 'comfortable' }"
                :aria-pressed="viewMode === 'comfortable'"
                @click="setViewMode('comfortable')"
              >
                舒适
              </button>
              <button
                type="button"
                class="view-switch-btn"
                :class="{ 'is-active': viewMode === 'compact' }"
                :aria-pressed="viewMode === 'compact'"
                @click="setViewMode('compact')"
              >
                紧凑
              </button>
            </div>
          </div>
        </div>

        <div v-if="hasActiveFilters" class="active-filter-strip" aria-label="当前筛选条件">
          <span class="active-filter-label">当前筛选</span>
          <a-tag v-if="searchParams.searchText?.trim()">关键词：{{ searchParams.searchText }}</a-tag>
          <a-tag v-if="selectedCategory !== 'all'">分类：{{ selectedCategory }}</a-tag>
          <a-tag v-for="tag in selectedTagNames" :key="`selected-${tag}`">{{ tag }}</a-tag>
          <a-button type="link" @click="clearFilters">重置</a-button>
        </div>

        <PictureList :dataList="dataList" :loading="loading" :viewMode="viewMode" />
        <div class="pagination-wrap">
          <a-pagination
            v-model:current="searchParams.current"
            v-model:pageSize="searchParams.pageSize"
            :total="total"
            @change="onPageChange"
          />
        </div>
      </section>
    </section>
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

const searchParams = reactive<API.PictureQueryRequest>({
  current: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
})

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
    ? '按时间正序展示公开图库内容'
    : '按时间倒序展示公开图库内容',
)

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

const setSortKey = (key: 'latest' | 'earliest') => {
  if (sortKey.value === key) {
    return
  }
  applySortKey(key)
  searchParams.current = 1
  fetchData()
}

const toggleFilterSection = (section: keyof typeof filterSectionOpen) => {
  filterSectionOpen[section] = !filterSectionOpen[section]
}

const clearFilters = () => {
  searchParams.searchText = ''
  selectedCategory.value = 'all'
  selectedTagList.value = tagList.value.map(() => false)
  tagSearchText.value = ''
  doSearch()
  searchInputRef.value?.focus?.()
}

const goTo = (path: string) => {
  router.push(path)
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

  margin-bottom: 16px;
  padding: 8px 6px 24px;
  border-radius: 20px;
  background:
    radial-gradient(130% 110% at 0% 0%, rgb(255 255 255 / 92%) 0%, transparent 55%),
    linear-gradient(180deg, var(--page-bg-top) 0%, var(--page-bg-bottom) 100%);
  display: grid;
  gap: 12px;
}

.workspace-topbar {
  min-height: 74px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 92%) 0%, rgb(245 249 254 / 92%) 100%),
    var(--surface);
  box-shadow: 0 8px 20px rgb(32 49 71 / 6%);
  display: grid;
  grid-template-columns: auto minmax(260px, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.topbar-title-block {
  min-width: 0;
}

.workspace-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--text-main);
}

.workspace-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-subtle);
}

.topbar-search {
  min-width: 0;
}

.topbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.topbar-actions :deep(.ant-btn) {
  min-height: 36px;
  border-radius: 999px;
  padding-inline: 14px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(220px, 248px) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.filter-panel,
.list-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px;
}

.filter-panel {
  position: sticky;
  top: 12px;
  max-height: calc(100vh - 84px);
  overflow: auto;
}

.filter-group + .filter-group {
  margin-top: 10px;
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

.group-title {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-main);
  font-weight: 600;
}

.list-panel {
  padding: 14px;
}

.active-filter-strip {
  margin-bottom: 12px;
  min-height: 40px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-soft);
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.active-filter-label {
  font-size: 12px;
  color: var(--text-subtle);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.list-title-block {
  display: grid;
  gap: 4px;
}

.filter-head,
.list-head,
.tag-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-head,
.list-head {
  margin-bottom: 12px;
}

.tag-head {
  margin-bottom: 0;
}

.filter-title,
.list-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
  color: var(--text-main);
}

.list-caption {
  margin: 0;
  font-size: 13px;
  color: var(--text-subtle);
}

.list-tools {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.sort-switch,
.view-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 3px;
  background: #f4f8fc;
}

.sort-switch-btn,
.view-switch-btn {
  min-height: 34px;
  border: 0;
  border-radius: 999px;
  padding: 0 14px;
  background: transparent;
  color: var(--text-subtle);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.sort-switch-btn.is-active,
.view-switch-btn.is-active {
  color: #22384f;
  background: #e2ebf6;
}

.sort-switch-btn:focus-visible,
.view-switch-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

.tag-meta,
.list-meta {
  font-size: 12px;
  color: var(--text-subtle);
}

.pagination-wrap {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 40px;
}

#homePage :deep(.ant-input-search .ant-input),
#homePage :deep(.ant-input-search-button) {
  height: 40px;
}

#homePage :deep(.ant-input-search .ant-input) {
  border-color: var(--line-strong);
  border-radius: 12px 0 0 12px;
}

#homePage :deep(.ant-input-search .ant-input:focus),
#homePage :deep(.ant-input-search .ant-input-focused) {
  border-color: var(--brand);
  box-shadow: 0 0 0 2px rgb(53 82 115 / 12%);
}

#homePage :deep(.ant-input-search-button) {
  border-color: var(--brand);
  background: var(--brand);
  border-radius: 0 12px 12px 0;
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
  padding: 5px 10px;
  min-height: 34px;
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
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .filter-panel {
    position: static;
  }
}

@media (max-width: 992px) {
  .workspace-topbar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .topbar-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  #homePage {
    padding: 0;
    border-radius: 0;
  }

  .workspace-topbar,
  .filter-panel,
  .list-panel {
    border-radius: 14px;
    padding: 12px;
  }

  .filter-title,
  .list-title {
    font-size: 17px;
  }

  .list-tools {
    width: 100%;
    justify-content: space-between;
  }

  .topbar-actions {
    width: auto;
    justify-content: flex-end;
  }

  .sort-switch-btn,
  .view-switch-btn {
    padding: 0 12px;
  }

  .pagination-wrap {
    justify-content: center;
  }

  .active-filter-strip {
    padding: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  #homePage :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

<template>
  <div id="searchPicturePage" class="page-shell">
    <section class="page-toolbar search-toolbar">
      <div class="search-toolbar-main">
        <div class="search-toolbar-title">
          <p class="search-kicker">Visual Search</p>
          <h2 class="page-title">{{ heroTitle }}</h2>
          <p class="page-subtitle">{{ heroSubtitle }}</p>
        </div>
        <a-space size="small" class="search-toolbar-actions">
          <a-button class="toolbar-btn" size="small" :loading="loading" @click="fetchResultData">
            刷新结果
          </a-button>
          <a-button
            v-if="picture.id"
            class="toolbar-btn toolbar-btn--ghost"
            size="small"
            :href="`/picture/${picture.id}`"
            target="_blank"
          >
            原图详情
          </a-button>
        </a-space>
      </div>

      <div class="search-kpi-strip" aria-label="识图概览">
        <article class="search-kpi">
          <span class="search-kpi-label">识图结果</span>
          <strong class="search-kpi-value">{{ resultCount }}</strong>
        </article>
        <article class="search-kpi">
          <span class="search-kpi-label">来源站点</span>
          <strong class="search-kpi-value">{{ domainCount }}</strong>
        </article>
        <article class="search-kpi">
          <span class="search-kpi-label">主来源覆盖</span>
          <strong class="search-kpi-value">{{ topDomainCoverageText }}</strong>
        </article>
        <article class="search-kpi search-kpi--wide">
          <span class="search-kpi-label">主来源</span>
          <strong class="search-kpi-value">{{ dominantDomain }}</strong>
        </article>
      </div>
    </section>

    <section class="search-layout">
      <aside class="source-column">
        <article class="panel-card source-panel">
          <div class="source-head">
            <h3 class="section-title">查询源图</h3>
            <span class="source-state">{{ sourceStateLabel }}</span>
          </div>
          <div class="source-preview">
            <img
              v-if="sourceImageUrl"
              :alt="picture.name || '源图预览'"
              :src="sourceImageUrl"
              class="source-image"
            />
            <div v-else class="source-empty">等待加载源图</div>
            <div v-if="sourceImageUrl" class="source-overlay">
              <span class="source-overlay-chip">{{ sourceResolutionText }}</span>
              <span class="source-overlay-chip source-overlay-chip--dark">{{ sourceFormatText }}</span>
            </div>
          </div>
          <div class="source-brief">
            <p class="source-name">{{ picture.name?.trim() || '未命名图片' }}</p>
            <p class="source-meta">
              <span>ID {{ picture.id ?? '--' }}</span>
              <span>·</span>
              <span>{{ formatPictureTime(picture.editTime ?? picture.createTime) }}</span>
            </p>
          </div>
          <div class="source-fact-strip">
            <span class="source-fact">
              <strong>{{ resultCount }}</strong>
              <span>近似结果</span>
            </span>
            <span class="source-fact">
              <strong>{{ domainCount }}</strong>
              <span>来源站点</span>
            </span>
          </div>
        </article>
      </aside>

      <section class="panel-card result-panel">
        <div class="result-head">
          <div class="result-head-title">
            <h3 class="section-title">识图结果</h3>
            <p class="result-head-subtitle">{{ resultPanelSubtitle }}</p>
          </div>
          <div class="result-controls" role="group" aria-label="结果视图密度">
            <button
              type="button"
              class="density-btn"
              :class="{ 'is-active': viewMode === 'comfortable' }"
              :aria-pressed="viewMode === 'comfortable'"
              @click="setViewMode('comfortable')"
            >
              舒适
            </button>
            <button
              type="button"
              class="density-btn"
              :class="{ 'is-active': viewMode === 'compact' }"
              :aria-pressed="viewMode === 'compact'"
              @click="setViewMode('compact')"
            >
              紧凑
            </button>
          </div>
        </div>

        <div v-if="resultCount > 0" class="result-summary-bar">
          <span class="result-summary-main">{{ resultSummaryMain }}</span>
          <span class="result-summary-sub">{{ resultSummarySub }}</span>
        </div>
        <div v-if="topDomainStats.length" class="domain-chip-row" aria-label="来源分布">
          <span v-for="item in topDomainStats" :key="item.domain" class="domain-chip">
            <strong>{{ item.domain }}</strong>
            <span>{{ item.count }} 项</span>
          </span>
        </div>
        <a-empty
          v-if="!loading && resultCount === 0"
          description="暂未找到相似结果，可稍后刷新重试"
        />

        <a-list
          :grid="resultGrid"
          :data-source="dataList"
          :loading="loading"
          :class="['result-list', `result-list--${viewMode}`]"
        >
          <template #renderItem="{ item: result, index }">
            <a-list-item class="list-item-reset">
              <a-card hoverable class="result-card">
                <template #cover>
                  <div class="result-cover">
                    <img
                      :alt="result.name ?? '相似结果'"
                      :src="getResultImageUrl(result)"
                      class="result-image"
                    />
                    <span class="result-rank">#{{ index + 1 }}</span>
                    <span class="result-domain-pill">{{ getDomainFromUrl(result.fromUrl) }}</span>
                  </div>
                </template>
                <div class="result-card-body">
                  <p class="result-card-title">{{ result.name?.trim() || '未命名结果' }}</p>
                  <p class="result-card-domain">{{ getDomainFromUrl(result.fromUrl) }}</p>
                  <a
                    v-if="result.fromUrl"
                    class="result-link"
                    :href="result.fromUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    打开来源页面
                  </a>
                  <span v-else class="result-link result-link--disabled">来源链接缺失</span>
                </div>
              </a-card>
            </a-list-item>
          </template>
        </a-list>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getPictureGetVo, postPictureSearchPicture } from '@/api/picture'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { resolveImageUrl } from '@/utils'

const route = useRoute()
type ViewMode = 'comfortable' | 'compact'

const pictureId = computed(() => {
  const id = Number(route.query?.pictureId)
  return Number.isNaN(id) ? undefined : id
})
const picture = ref<API.PictureVO>({})
const sourceImageUrl = computed(() => {
  const imageUrl = picture.value.thumbnailUrl ?? picture.value.url
  return imageUrl ? resolveImageUrl(imageUrl) : ''
})

const sourceResolutionText = computed(() => {
  const width = Number(picture.value.picWidth)
  const height = Number(picture.value.picHeight)
  if (width > 0 && height > 0) {
    return `${width} × ${height}`
  }
  return '分辨率未知'
})
const sourceFormatText = computed(() => {
  const format = picture.value.picFormat?.toString().trim().toUpperCase()
  return format || 'IMG'
})
const sourceStateLabel = computed(() => {
  if (!pictureId.value) {
    return '未选择'
  }
  if (sourceImageUrl.value) {
    return '已加载'
  }
  return loading.value ? '加载中' : '待更新'
})

// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    if (!pictureId.value) {
      picture.value = {}
      return
    }
    const res = await getPictureGetVo({
      id: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    message.error('获取图片详情失败：' + errorMessage)
  }
}

// 以图搜图结果
const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref<boolean>(true)
const viewMode = ref<ViewMode>('comfortable')

const resultCount = computed(() => dataList.value.length)
const parseDomain = (rawUrl?: string) => {
  if (!rawUrl) {
    return undefined
  }
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}
const domainCount = computed(() => {
  const domainSet = new Set<string>()
  dataList.value.forEach((result) => {
    const domain = parseDomain(result.fromUrl)
    if (domain) {
      domainSet.add(domain)
    }
  })
  return domainSet.size
})
const domainStats = computed(() => {
  const domainMap = new Map<string, number>()
  dataList.value.forEach((result) => {
    const domain = parseDomain(result.fromUrl)
    if (!domain) {
      return
    }
    domainMap.set(domain, (domainMap.get(domain) ?? 0) + 1)
  })
  return Array.from(domainMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
})
const topDomainStats = computed(() => domainStats.value.slice(0, 4))
const topDomainCoverageText = computed(() => {
  if (resultCount.value === 0) {
    return '0%'
  }
  const topCount = topDomainStats.value.reduce((sum, item) => sum + item.count, 0)
  return `${Math.round((topCount / resultCount.value) * 100)}%`
})
const averageResultPerDomain = computed(() => {
  if (domainCount.value === 0) {
    return '--'
  }
  return (resultCount.value / domainCount.value).toFixed(1)
})
const dominantDomain = computed(() => {
  const first = topDomainStats.value[0]?.domain
  return first || '暂无主来源'
})
const heroTitle = computed(() => {
  if (!pictureId.value) {
    return '以图搜图'
  }
  if (resultCount.value === 0) {
    return '已载入源图，等待识别结果'
  }
  return `识别到 ${resultCount.value} 张相似图片`
})
const heroSubtitle = computed(() => {
  if (!pictureId.value) {
    return '请从图库选择图片后进入此页，系统会自动识别近似来源'
  }
  if (resultCount.value === 0) {
    return '当前无可用结果，可刷新后重试或切换源图'
  }
  return `已覆盖 ${domainCount.value} 个来源站点，优先展示高相关结果`
})
const resultPanelSubtitle = computed(() => {
  if (resultCount.value === 0) {
    return '暂无可展示结果'
  }
  return `共 ${resultCount.value} 项 · 平均每站点 ${averageResultPerDomain.value} 项`
})
const resultSummaryMain = computed(() => {
  if (topDomainStats.value.length === 0) {
    return '暂无可识别来源站点，结果按相似度展示'
  }
  return `前 ${topDomainStats.value.length} 个来源覆盖 ${topDomainCoverageText.value} 结果`
})
const resultSummarySub = computed(() => {
  if (domainCount.value === 0) {
    return '来源链接待补充'
  }
  return `主来源：${dominantDomain.value}`
})
const resultGrid = computed(() => {
  const isSparse = resultCount.value > 0 && resultCount.value <= 2
  if (viewMode.value === 'compact') {
    if (isSparse) {
      return { gutter: 12, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }
    }
    return { gutter: 12, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }
  }
  if (isSparse) {
    return { gutter: 14, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }
  }
  return { gutter: 14, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 5 }
})

const setViewMode = (mode: ViewMode) => {
  viewMode.value = mode
}

const formatPictureTime = (rawTime?: string) => {
  if (!rawTime) {
    return '最近更新'
  }
  const date = new Date(rawTime)
  if (Number.isNaN(date.getTime())) {
    return '最近更新'
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

const getDomainFromUrl = (rawUrl?: string) => parseDomain(rawUrl) ?? '来源链接'
const getResultImageUrl = (result: API.ImageSearchResult) => {
  const imageUrl = result.thumbUrl ?? result.thumbnailUrl ?? result.url
  return imageUrl ? resolveImageUrl(imageUrl) : ''
}

// 获取搜图结果
const fetchResultData = async () => {
  loading.value = true
  try {
    if (!pictureId.value) {
      dataList.value = []
      return
    }
    const res = await postPictureSearchPicture({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    message.error('获取数据失败，' + errorMessage)
  } finally {
    loading.value = false
  }
}

watch(
  pictureId,
  async () => {
    await fetchPictureDetail()
    await fetchResultData()
  },
  {
    immediate: true,
  },
)
</script>

<style scoped>
#searchPicturePage {
  margin-bottom: 18px;
}

.search-toolbar {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 10px;
  border-color: #cad8e7;
  background:
    radial-gradient(132% 104% at 0% 0%, rgb(169 195 221 / 24%) 0%, transparent 56%),
    radial-gradient(120% 96% at 100% 0%, rgb(206 224 242 / 18%) 0%, transparent 54%),
    linear-gradient(180deg, rgb(255 255 255 / 96%) 0%, rgb(244 249 255 / 94%) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 70%),
    0 8px 20px rgb(30 49 71 / 8%);
}

.search-toolbar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    repeating-linear-gradient(126deg, rgb(255 255 255 / 18%) 0 2px, rgb(255 255 255 / 0%) 2px 10px),
    linear-gradient(180deg, rgb(255 255 255 / 0%) 0%, rgb(255 255 255 / 42%) 100%);
  opacity: 0.7;
  pointer-events: none;
}

.search-toolbar-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.search-toolbar-title {
  display: grid;
  gap: 4px;
}

.search-kicker {
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

.search-toolbar-actions {
  position: relative;
  z-index: 1;
}

.toolbar-btn {
  min-height: 26px;
  border-radius: 999px;
  border-color: #c8d8e9;
  background: linear-gradient(180deg, #fafdff 0%, #eef5fc 100%);
  color: #2f4b69;
  font-size: 11px;
}

.toolbar-btn:hover,
.toolbar-btn:focus {
  border-color: #abc0d7;
  background: #e4eef8;
  color: #1f3852;
}

.toolbar-btn--ghost {
  border-color: #d2deea;
  background: rgb(255 255 255 / 82%);
  color: #526a84;
}

.search-kpi-strip {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.search-kpi {
  min-width: 96px;
  border-radius: 11px;
  border: 1px solid #d1deec;
  background: linear-gradient(180deg, #ffffff 0%, #ecf3fb 100%);
  padding: 6px 10px;
  display: grid;
  gap: 3px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 64%);
}

.search-kpi--wide {
  min-width: 164px;
}

.search-kpi-label {
  font-size: 10px;
  color: #647a91;
}

.search-kpi-value {
  font-size: 15px;
  line-height: 1.2;
  color: #26425f;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.search-layout {
  display: grid;
  grid-template-columns: minmax(228px, 272px) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.source-column {
  position: sticky;
  top: 12px;
}

.source-panel {
  display: grid;
  gap: 10px;
  border-color: #ccdaea;
  background:
    radial-gradient(120% 90% at 100% 0%, rgb(196 215 235 / 18%) 0%, transparent 58%),
    linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
}

.source-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.source-state {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid #d1deeb;
  background: #edf4fc;
  font-size: 11px;
  color: #4f6983;
}

.section-title {
  margin: 0;
  font-size: 17px;
  color: #29445f;
}

.source-preview {
  position: relative;
  border-radius: 12px;
  border: 1px solid #d4e2f0;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  overflow: hidden;
  min-height: 212px;
  display: grid;
}

.source-image {
  width: 100%;
  height: 212px;
  object-fit: cover;
  display: block;
}

.source-empty {
  min-height: 212px;
  display: grid;
  place-items: center;
  color: #6a7f95;
  font-size: 13px;
}

.source-overlay {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  pointer-events: none;
}

.source-overlay-chip {
  min-height: 22px;
  max-width: 60%;
  border-radius: 999px;
  border: 1px solid rgb(207 221 236 / 90%);
  background: rgb(255 255 255 / 84%);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  color: #2c4b69;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.source-overlay-chip--dark {
  border-color: rgb(52 80 112 / 35%);
  background: rgb(37 58 82 / 74%);
  color: #ecf3fb;
}

.source-brief {
  display: grid;
  gap: 4px;
}

.source-name {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #27405a;
  word-break: break-all;
}

.source-meta {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #60758d;
}

.source-fact-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.source-fact {
  min-height: 54px;
  border-radius: 10px;
  border: 1px solid #d2dfed;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 8px;
  display: grid;
  align-content: center;
  gap: 2px;
}

.source-fact strong {
  color: #26415f;
  font-size: 16px;
  line-height: 1.1;
}

.source-fact span {
  color: #5d728a;
  font-size: 11px;
}

.result-panel {
  min-width: 0;
  border-color: #cbd9e8;
  background:
    radial-gradient(120% 100% at 100% 0%, rgb(199 216 235 / 16%) 0%, transparent 58%),
    linear-gradient(180deg, #ffffff 0%, #f6faff 100%);
}

.result-head {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.result-head-title {
  display: grid;
  gap: 3px;
}

.result-head-subtitle {
  margin: 0;
  font-size: 12px;
  color: #5e7590;
}

.result-controls {
  min-height: 28px;
  border-radius: 999px;
  border: 1px solid #d3dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.density-btn {
  min-height: 22px;
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

.density-btn:hover {
  color: #2f4d6c;
  background: #e6f0fa;
}

.density-btn.is-active {
  color: #203b56;
  background: #dfeaf6;
  font-weight: 600;
}

.density-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

.result-summary-bar {
  margin-bottom: 8px;
  min-height: 32px;
  border-radius: 10px;
  border: 1px solid #d2dfec;
  background: linear-gradient(180deg, #f9fcff 0%, #eef5fc 100%);
  padding: 6px 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.result-summary-main {
  font-size: 12px;
  color: #304f6f;
  font-weight: 600;
}

.result-summary-sub {
  font-size: 12px;
  color: #5e7590;
}

.domain-chip-row {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.domain-chip {
  min-height: 26px;
  border-radius: 999px;
  border: 1px solid #d0deec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 3px 9px;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.domain-chip strong {
  font-size: 12px;
  color: #2e4967;
  line-height: 1.2;
}

.domain-chip span {
  font-size: 11px;
  color: #60758d;
}

.list-item-reset {
  padding: 0;
}

.result-list :deep(.ant-list-item) {
  animation: result-card-enter 0.34s ease-out both;
}

.result-list :deep(.ant-list-item:nth-child(1)) {
  animation-delay: 0.02s;
}

.result-list :deep(.ant-list-item:nth-child(2)) {
  animation-delay: 0.04s;
}

.result-list :deep(.ant-list-item:nth-child(3)) {
  animation-delay: 0.06s;
}

.result-list :deep(.ant-list-item:nth-child(4)) {
  animation-delay: 0.08s;
}

.result-list :deep(.ant-list-item:nth-child(5)) {
  animation-delay: 0.1s;
}

.result-card {
  overflow: hidden;
  border: 1px solid #d2e1ef;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.result-card:hover {
  border-color: #afc4da;
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgb(35 56 78 / 12%);
}

.result-cover {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #dce8f4;
  background: linear-gradient(180deg, #f9fcff 0%, #edf4fb 100%);
}

.result-image {
  width: 100%;
  height: 168px;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.22s ease;
}

.result-list--compact .result-image {
  height: 142px;
}

.result-card:hover .result-image {
  transform: scale(1.02);
}

.result-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  min-width: 30px;
  height: 22px;
  border-radius: 999px;
  padding-inline: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #f4f8fe;
  background: rgb(39 64 90 / 84%);
  backdrop-filter: blur(3px);
}

.result-domain-pill {
  position: absolute;
  right: 8px;
  bottom: 8px;
  min-height: 22px;
  max-width: calc(100% - 16px);
  border-radius: 999px;
  border: 1px solid rgb(190 209 229 / 90%);
  background: rgb(237 245 252 / 90%);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  color: #456583;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.result-card-body {
  display: grid;
  gap: 4px;
}

.result-card-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #24415f;
  line-height: 1.4;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.result-card-domain {
  margin: 0;
  font-size: 12px;
  color: #60758d;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.result-link {
  font-size: 12px;
  color: #2d4f72;
}

.result-link--disabled {
  color: #7489a0;
}

@keyframes result-card-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1140px) {
  .search-kpi--wide {
    min-width: 120px;
    flex: 1 1 160px;
  }
}

@media (max-width: 992px) {
  .search-layout {
    grid-template-columns: 1fr;
  }

  .source-column {
    position: static;
  }

  .source-preview,
  .source-image,
  .source-empty {
    min-height: 180px;
    height: 180px;
  }

  .result-summary-bar {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .search-toolbar {
    padding: 10px;
  }

  .search-kpi {
    min-width: 0;
    flex: 1 1 calc(50% - 4px);
  }

  .search-kpi--wide {
    flex: 1 1 100%;
  }

  .result-controls {
    width: 100%;
    justify-content: center;
  }

  .result-head {
    align-items: stretch;
  }

  .result-head-title {
    width: 100%;
  }

  .result-image {
    height: 160px;
  }

  .result-list--compact .result-image {
    height: 136px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .result-list :deep(.ant-list-item),
  .result-card,
  .result-image,
  .toolbar-btn,
  .density-btn {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
</style>

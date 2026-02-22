<template>
  <div class="picture-search-form panel-card no-shadow">
    <a-form
      class="search-form"
      name="searchForm"
      layout="vertical"
      size="small"
      :model="searchParams"
      @finish="doSearch"
    >
      <div class="search-primary-row">
        <a-form-item class="keyword-item" name="searchText">
          <a-input-search
            v-model:value="searchParams.searchText"
            placeholder="搜索名称、简介或标签"
            allow-clear
            :enter-button="false"
            @search="doSearch"
          />
        </a-form-item>
        <div class="primary-actions">
          <a-button class="filter-toggle-btn" @click="showAdvanced = !showAdvanced">
            <template #icon>
              <FilterOutlined />
            </template>
            {{ showAdvanced ? '收起' : '筛选' }}
            <span v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</span>
          </a-button>
          <a-button class="reset-btn" html-type="reset" @click="doClear">
            <template #icon>
              <ReloadOutlined />
            </template>
            <span class="reset-text">重置</span>
          </a-button>
        </div>
      </div>

      <div v-if="activeFilterCount > 0" class="active-filter-strip" aria-label="已启用筛选">
        <span class="active-filter-label">已启用</span>
        <a-tag v-for="item in visibleFilterHints" :key="item">{{ item }}</a-tag>
        <a-tag v-if="hiddenFilterHintCount > 0">+{{ hiddenFilterHintCount }}</a-tag>
      </div>

      <transition name="advanced-fade">
        <div v-if="showAdvanced" class="advanced-panel">
          <div class="advanced-grid">
            <a-form-item class="field-item" name="category">
              <a-auto-complete
                v-model:value="searchParams.category"
                placeholder="分类"
                :options="categoryOptions"
                allow-clear
              />
            </a-form-item>
            <a-form-item class="field-item" name="tags">
              <a-select
                v-model:value="searchParams.tags"
                mode="tags"
                placeholder="标签（可多选）"
                :options="tagOptions"
                allow-clear
              />
            </a-form-item>
            <a-form-item class="field-item field-item--wide" name="dateRange">
              <a-range-picker
                v-model:value="dateRange"
                show-time
                :placeholder="['编辑开始', '编辑结束']"
                format="YYYY/MM/DD HH:mm:ss"
                :presets="rangePresets"
                @change="onRangeChange"
              />
            </a-form-item>
            <a-form-item class="field-item" name="name">
              <a-input
                v-model:value="searchParams.name"
                placeholder="精确名称"
                allow-clear
              />
            </a-form-item>
            <a-form-item class="field-item" name="introduction">
              <a-input
                v-model:value="searchParams.introduction"
                placeholder="简介关键词"
                allow-clear
              />
            </a-form-item>
            <a-form-item class="field-item" name="picFormat">
              <a-input
                v-model:value="searchParams.picFormat"
                placeholder="格式（jpg/png）"
                allow-clear
              />
            </a-form-item>
            <a-form-item class="field-item field-item--number" name="picWidth">
              <a-input-number
                v-model:value="searchParams.picWidth"
                :controls="false"
                :min="0"
                placeholder="最小宽度(px)"
              />
            </a-form-item>
            <a-form-item class="field-item field-item--number" name="picHeight">
              <a-input-number
                v-model:value="searchParams.picHeight"
                :controls="false"
                :min="0"
                placeholder="最小高度(px)"
              />
            </a-form-item>
          </div>

          <div class="advanced-actions">
            <span class="advanced-meta">已启用 {{ activeFilterCount }} 项筛选</span>
            <a-space size="small">
              <a-button type="primary" html-type="submit">应用筛选</a-button>
              <a-button @click="showAdvanced = false">完成</a-button>
            </a-space>
          </div>
        </div>
      </transition>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getPictureTagCategory } from '@/api/picture'
import { message } from 'ant-design-vue'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()
const showAdvanced = ref(false)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})
const activeFilterCount = computed(() => {
  let count = 0
  if (searchParams.category?.trim()) {
    count += 1
  }
  if (Array.isArray(searchParams.tags)) {
    count += searchParams.tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0).length
  }
  if (dateRange.value?.length === 2) {
    count += 1
  }
  if (searchParams.name?.trim()) {
    count += 1
  }
  if (searchParams.introduction?.trim()) {
    count += 1
  }
  if (searchParams.picFormat?.trim()) {
    count += 1
  }
  if (searchParams.picWidth != null) {
    count += 1
  }
  if (searchParams.picHeight != null) {
    count += 1
  }
  return count
})
const filterHints = computed(() => {
  const hints: string[] = []
  const category = searchParams.category?.trim()
  if (category) {
    hints.push(`分类：${category}`)
  }
  if (Array.isArray(searchParams.tags)) {
    searchParams.tags
      .filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
      .slice(0, 3)
      .forEach((tag) => {
        hints.push(`标签：${tag}`)
      })
  }
  if (dateRange.value?.length === 2) {
    hints.push('时间范围')
  }
  if (searchParams.name?.trim()) {
    hints.push('精确名称')
  }
  if (searchParams.introduction?.trim()) {
    hints.push('简介关键词')
  }
  if (searchParams.picFormat?.trim()) {
    hints.push(`格式：${searchParams.picFormat.trim().toUpperCase()}`)
  }
  if (searchParams.picWidth != null) {
    hints.push(`宽度≥${searchParams.picWidth}`)
  }
  if (searchParams.picHeight != null) {
    hints.push(`高度≥${searchParams.picHeight}`)
  }
  return hints
})
const visibleFilterHints = computed(() => filterHints.value.slice(0, 3))
const hiddenFilterHintCount = computed(() =>
  Math.max(0, filterHints.value.length - visibleFilterHints.value.length),
)

// 搜索数据
const doSearch = () => {
  props.onSearch?.(searchParams)
}

// 标签和分类选项
const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

/**
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await getPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error(`获取标签分类列表失败，${res.data?.message ?? '请稍后重试'}`)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const dateRange = ref<Dayjs[] | null>(null)

/**
 * 日期范围更改时触发
 * @param dates
 * @param dateStrings
 */
const onRangeChange = (dates: Dayjs[] | null) => {
  if (dates && dates.length >= 2) {
    searchParams.startEditTime = dates[0].format('YYYY-MM-DD HH:mm:ss')
    searchParams.endEditTime = dates[1].format('YYYY-MM-DD HH:mm:ss')
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}

// 时间范围预设
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

// 清理
const doClear = () => {
  // 取消所有对象的值
  ;(Object.keys(searchParams) as Array<keyof API.PictureQueryRequest>).forEach((key) => {
    searchParams[key] = undefined
  })
  // 日期筛选项单独清空，必须定义为空数组
  dateRange.value = null
  showAdvanced.value = false
  // 清空后重新搜索
  props.onSearch?.(searchParams)
}
</script>

<style scoped>
.picture-search-form {
  border-color: #cbd9e8;
  background:
    radial-gradient(120% 96% at 100% 0%, rgb(201 219 238 / 14%) 0%, transparent 56%),
    linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
  padding: 8px;
}

.search-form {
  display: grid;
  gap: 7px;
}

.search-primary-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.keyword-item {
  margin-bottom: 0;
}

.primary-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
}

.filter-toggle-btn {
  min-height: 28px;
  border-radius: 999px;
  padding-inline: 9px;
  border-color: #c4d3e4;
  background: linear-gradient(180deg, #f9fcff 0%, #ebf2fa 100%);
  color: #2a4662;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.filter-toggle-btn:hover,
.filter-toggle-btn:focus {
  border-color: #a9bfd6;
  color: #233d56;
  background: #e1ebf6;
}

.filter-count {
  display: inline-grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding-inline: 4px;
  margin-left: 2px;
  border-radius: 999px;
  background: #355273;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

.reset-btn {
  min-height: 28px;
  border-radius: 999px;
  padding-inline: 9px;
  border-color: #d0deec;
  background: linear-gradient(180deg, #fbfdff 0%, #f0f6fd 100%);
  color: #4f6883;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.reset-btn:hover,
.reset-btn:focus {
  border-color: #b5c8dc;
  color: #2d4865;
  background: #e8f1fb;
}

.active-filter-strip {
  min-height: 30px;
  border: 1px solid #d2dfec;
  border-radius: 10px;
  background: linear-gradient(180deg, #f8fbff 0%, #edf5fc 100%);
  padding: 3px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
}

.active-filter-strip::-webkit-scrollbar {
  display: none;
}

.active-filter-label {
  font-size: 11px;
  color: #60758d;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.advanced-panel {
  border: 1px solid #d7e4f1;
  border-radius: 11px;
  background: linear-gradient(180deg, #fbfdff 0%, #f1f6fc 100%);
  padding: 8px;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 7px;
}

.field-item {
  grid-column: span 3;
  margin-bottom: 0;
}

.field-item--wide {
  grid-column: span 6;
}

.field-item--number {
  grid-column: span 2;
}

.field-item :deep(.ant-picker),
.field-item :deep(.ant-input-number),
.field-item :deep(.ant-input-number-affix-wrapper),
.field-item :deep(.ant-select) {
  width: 100%;
}

.advanced-actions {
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px dashed #cad9e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.advanced-meta {
  font-size: 11px;
  color: #60758d;
}

.advanced-fade-enter-active,
.advanced-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.advanced-fade-enter-from,
.advanced-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.picture-search-form :deep(.ant-form-item) {
  margin-top: 0;
  margin-bottom: 0;
}

.picture-search-form :deep(.keyword-item .ant-input-search .ant-input),
.picture-search-form :deep(.keyword-item .ant-input-search-button) {
  min-height: 30px;
}

.picture-search-form :deep(.keyword-item .ant-input-affix-wrapper) {
  min-height: 30px;
}

@media (max-width: 1200px) {
  .field-item {
    grid-column: span 4;
  }

  .field-item--wide {
    grid-column: span 8;
  }
}

@media (max-width: 992px) {
  .search-primary-row {
    grid-template-columns: 1fr;
  }

  .primary-actions {
    justify-content: flex-start;
  }

  .field-item,
  .field-item--wide,
  .field-item--number {
    grid-column: span 6;
  }
}

@media (max-width: 768px) {
  .picture-search-form {
    padding: 8px;
  }

  .advanced-panel {
    padding: 8px;
  }

  .advanced-grid {
    grid-template-columns: 1fr;
  }

  .field-item,
  .field-item--wide,
  .field-item--number {
    grid-column: 1 / -1;
  }

  .primary-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .reset-text {
    display: none;
  }
}
</style>

<template>
  <div id="homePage">
    <section class="hero-panel">
      <p class="hero-eyebrow">Sion Picture</p>
      <h1 class="hero-title">发现清爽、自然的视觉灵感</h1>
      <p class="hero-subtitle">
        用关键词、分类和标签快速筛选海量图片，沉浸式浏览，不再被高饱和配色干扰。
      </p>
    </section>

    <section class="filter-panel">
      <div class="search-bar">
        <a-input-search
          v-model:value="searchParams.searchText"
          placeholder="从海量图片中搜索"
          enter-button="搜索"
          size="large"
          @search="doSearch"
        />
      </div>
      <div class="tabs-wrap">
        <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
          <a-tab-pane key="all" tab="全部" />
          <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
        </a-tabs>
      </div>
      <div class="tag-bar">
        <span class="tag-label">标签：</span>
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag
            v-for="(tag, index) in tagList"
            :key="tag"
            v-model:checked="selectedTagList[index]"
            @change="doSearch"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </section>

    <section class="list-panel">
      <PictureList :dataList="dataList" :loading="loading" />
    </section>

    <div class="pagination-wrap">
      <a-pagination
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getPictureTagCategory, postPictureListPageVo } from '@/api/picture'
import { message } from 'ant-design-vue'
import PictureList from '@/components/PictureList.vue' // 定义数据

// 定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 15,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    nullSpaceId: true,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  // [true, false, false] => ['java']
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await postPictureListPageVo(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 搜索
const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

// 标签和分类列表
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])

/**
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await getPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList ?? []
    categoryList.value = res.data.data.categoryList ?? []
  } else {
    message.error(`获取标签分类列表失败，${res.data?.message ?? '请稍后重试'}`)
  }
}

onMounted(() => {
  getTagCategoryOptions()
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
  padding: 12px 8px 24px;
  border-radius: 20px;
  background: linear-gradient(180deg, var(--page-bg-top) 0%, var(--page-bg-bottom) 100%);
}

.hero-panel {
  padding: 28px 28px 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: radial-gradient(130% 120% at 0% 0%, #ffffff 0%, #f1f6fb 55%, #ebf1f8 100%);
  margin-bottom: 16px;
}

.hero-eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.hero-title {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  color: var(--text-main);
}

.hero-subtitle {
  max-width: 700px;
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-subtle);
}

.filter-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
}

#homePage .search-bar {
  max-width: 580px;
  margin: 0 auto 8px;
}

#homePage .tabs-wrap {
  margin-bottom: 6px;
}

#homePage .tag-bar {
  margin-bottom: 4px;
  color: var(--text-subtle);
}

#homePage .tag-label {
  margin-right: 8px;
}

#homePage .list-panel {
  margin-bottom: 18px;
}

#homePage .pagination-wrap {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 44px;
}

#homePage :deep(.ant-input-search .ant-input),
#homePage :deep(.ant-input-search-button) {
  height: 48px;
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

#homePage :deep(.ant-tabs-nav::before) {
  border-bottom-color: var(--line);
}

#homePage :deep(.ant-tabs-tab) {
  padding: 10px 14px;
  color: var(--text-subtle);
}

#homePage :deep(.ant-tabs-tab:hover),
#homePage :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: var(--brand);
}

#homePage :deep(.ant-tabs-ink-bar) {
  background: var(--brand);
}

#homePage :deep(.ant-tag-checkable) {
  margin-top: 8px;
  margin-right: 8px;
  padding: 8px 14px;
  min-height: 44px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface-soft);
  color: var(--text-subtle);
  line-height: 24px;
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

#homePage :deep(.picture-list .ant-card-hoverable) {
  cursor: pointer;
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

@media (max-width: 992px) {
  .hero-panel {
    padding: 24px;
  }

  .hero-title {
    font-size: 30px;
  }
}

@media (max-width: 768px) {
  #homePage {
    padding: 0;
    border-radius: 0;
  }

  .hero-panel,
  .filter-panel {
    border-radius: 14px;
    padding: 16px;
  }

  .hero-title {
    font-size: 24px;
  }

  .pagination-wrap {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  #homePage :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>

<template>
  <div class="space-tag-analyze">
    <a-card title="空间图片标签分析" class="analyze-card">
      <template #extra>
        <a-space size="small" wrap>
          <span class="analyze-stat">
            <strong>{{ tagCount }}</strong>
            <span>标签数</span>
          </span>
          <span class="analyze-stat">
            <strong>{{ topTagText }}</strong>
            <span>最热标签</span>
          </span>
        </a-space>
      </template>
      <v-chart class="analyze-chart" :option="options" :loading="loading" />
      <p v-if="!loading && !hasData" class="chart-empty">暂无标签数据，添加标签后可查看词云热度。</p>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import 'echarts-wordcloud'
import { computed, ref, watchEffect } from 'vue'
import { postSpaceAnalyzeTag } from '@/api/analyze'
import { message } from 'ant-design-vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

// 图表数据
const dataList = ref<API.SpaceCategoryAnalyzeResponse>([])
// 加载状态
const loading = ref(true)
const hasData = computed(() => dataList.value.length > 0)
const tagCount = computed(() => dataList.value.length)
const topTagText = computed(() => {
  if (!hasData.value) {
    return '--'
  }
  const topItem = [...dataList.value].sort((a, b) => Number(b.count ?? 0) - Number(a.count ?? 0))[0]
  return topItem?.tag || '--'
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const res = await postSpaceAnalyzeTag({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

/**
 * 监听变量，参数改变时触发数据的重新加载
 */
watchEffect(() => {
  fetchData()
})

// 图表选项
const options = computed(() => {
  const tagData = dataList.value.map((item) => ({
    name: item.tag || '未命名标签',
    value: Number(item.count ?? 0),
  }))
  const palette = ['#5e7896', '#7f95ad', '#6e889f', '#8ea2ba', '#4e6988', '#95aac0']

  return {
    grid: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number }) => `${params.name}: ${params.value} 次`,
    },
    series: [
      {
        type: 'wordCloud',
        gridSize: 10,
        sizeRange: [12, 42], // 字体大小范围
        rotationRange: [-45, 45],
        shape: 'circle',
        textStyle: {
          fontWeight: 600,
          color: (params: { dataIndex: number }) => {
            return palette[params.dataIndex % palette.length]
          },
        },
        emphasis: {
          textStyle: {
            shadowBlur: 8,
            shadowColor: 'rgb(53 82 115 / 26%)',
          },
        },
        data: tagData,
      },
    ],
  }
})
</script>

<style scoped>
.analyze-stat {
  min-height: 24px;
  border-radius: 999px;
  border: 1px solid #d1dfed;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px 8px;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.analyze-stat strong {
  color: #2d4b69;
  font-size: 12px;
}

.analyze-stat span {
  color: #607890;
  font-size: 11px;
}

.chart-empty {
  margin: 8px 0 0;
  font-size: 12px;
  color: #657d95;
}
</style>

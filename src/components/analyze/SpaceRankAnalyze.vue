<template>
  <div class="space-rank-analyze">
    <a-card title="空间使用排行分析" class="analyze-card">
      <template #extra>
        <a-space size="small" wrap>
          <span class="analyze-stat">
            <strong>TOP {{ sortedDataList.length }}</strong>
            <span>空间</span>
          </span>
          <span class="analyze-stat">
            <strong>{{ topSpaceName }}</strong>
            <span>第一名</span>
          </span>
          <span class="analyze-stat">
            <strong>{{ totalUsageMb }} MB</strong>
            <span>总占用</span>
          </span>
        </a-space>
      </template>
      <v-chart class="analyze-chart" :option="options" :loading="loading" />
      <p v-if="!loading && !hasData" class="chart-empty">暂无空间排行数据。</p>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { postSpaceAnalyzeRank } from '@/api/analyze'
import { message } from 'ant-design-vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

// 图表数据
const dataList = ref<API.Space[]>([])
// 加载状态
const loading = ref(true)
const sortedDataList = computed(() => {
  return [...dataList.value].sort((a, b) => Number(b.totalSize ?? 0) - Number(a.totalSize ?? 0))
})
const hasData = computed(() => sortedDataList.value.length > 0)
const topSpaceName = computed(() => {
  if (!hasData.value) {
    return '--'
  }
  return sortedDataList.value[0]?.spaceName || '--'
})
const totalUsageMb = computed(() => {
  const total = sortedDataList.value.reduce((sum, item) => sum + Number(item.totalSize ?? 0), 0)
  return (total / (1024 * 1024)).toFixed(2)
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const res = await postSpaceAnalyzeRank({
    topN: 10, // 后端默认是 10
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
  const spaceNames = sortedDataList.value.map((item) => item.spaceName || '未命名空间')
  const usageData = sortedDataList.value.map((item) =>
    Number(((item.totalSize ?? 0) / (1024 * 1024)).toFixed(2)),
  ) // 转为 MB

  return {
    tooltip: { trigger: 'axis' },
    grid: { top: 16, left: 92, right: 18, bottom: 24 },
    xAxis: {
      type: 'value',
      name: '空间使用量 (MB)',
      axisLabel: {
        color: '#607890',
      },
      splitLine: {
        lineStyle: {
          color: '#dfe8f2',
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: spaceNames,
      axisLabel: {
        color: '#607890',
        width: 82,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: '空间使用量 (MB)',
        type: 'bar',
        data: usageData,
        barMaxWidth: 16,
        itemStyle: {
          color: '#5a7390',
          borderRadius: [0, 8, 8, 0],
        },
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

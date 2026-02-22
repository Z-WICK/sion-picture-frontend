<template>
  <div class="space-user-analyze">
    <a-card title="空间图片用户分析" class="analyze-card">
      <template #extra>
        <a-space size="small" wrap class="user-controls">
          <a-segmented v-model:value="timeDimension" :options="timeDimensionOptions" />
          <a-input-search
            v-model:value="userSearchText"
            class="w-180"
            placeholder="请输入用户 id"
            enter-button="搜索用户"
            @search="doSearch"
          />
          <a-button @click="resetFilter">清空</a-button>
        </a-space>
      </template>
      <div class="chart-meta-row">
        <span class="chart-meta-item">时间点 {{ pointCount }}</span>
        <span class="chart-meta-item">上传总量 {{ totalUploadCount }}</span>
        <span class="chart-meta-item">维度 {{ timeDimensionLabel }}</span>
      </div>
      <v-chart class="analyze-chart" :option="options" :loading="loading" />
      <p v-if="!loading && !hasData" class="chart-empty">暂无用户上传行为数据。</p>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { postSpaceAnalyzeUser } from '@/api/analyze'
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

// 时间维度选项
const timeDimension = ref<'day' | 'week' | 'month'>('day')
// 分段选择器组件的选项
const timeDimensionOptions = [
  {
    label: '日',
    value: 'day',
  },
  {
    label: '周',
    value: 'week',
  },
  {
    label: '月',
    value: 'month',
  },
]
// 用户选项
const userId = ref<number>()
const userSearchText = ref('')
const doSearch = (value: string) => {
  const parsed = Number(String(value).trim())
  userId.value = Number.isNaN(parsed) ? undefined : parsed
}
const resetFilter = () => {
  userId.value = undefined
  userSearchText.value = ''
}

// 图表数据
const dataList = ref<API.SpaceCategoryAnalyzeResponse>([])
// 加载状态
const loading = ref(true)
const hasData = computed(() => dataList.value.length > 0)
const pointCount = computed(() => dataList.value.length)
const totalUploadCount = computed(() => {
  return dataList.value.reduce((sum, item) => sum + Number(item.count ?? 0), 0)
})
const timeDimensionLabel = computed(() => {
  const map: Record<'day' | 'week' | 'month', string> = {
    day: '日',
    week: '周',
    month: '月',
  }
  return map[timeDimension.value]
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const res = await postSpaceAnalyzeUser({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
    timeDimension: timeDimension.value,
    userId: userId.value,
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
  const periods = dataList.value.map((item) => item.period || '--') // 时间区间
  const counts = dataList.value.map((item) => Number(item.count ?? 0)) // 上传数量

  return {
    color: ['#5c7794'],
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 42, right: 18, bottom: 38 },
    xAxis: {
      type: 'category',
      data: periods,
      name: '时间区间',
      axisLabel: {
        color: '#607890',
      },
      axisLine: {
        lineStyle: {
          color: '#c9d8e8',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '上传数量',
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
    series: [
      {
        name: '上传数量',
        type: 'line',
        data: counts,
        smooth: true, // 平滑折线
        symbolSize: 7,
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: 'rgb(92 119 148 / 14%)',
        },
        emphasis: {
          focus: 'series',
        },
      },
    ],
  }
})
</script>

<style scoped>
.user-controls {
  justify-content: flex-end;
}

.chart-meta-row {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.chart-meta-item {
  min-height: 24px;
  border-radius: 999px;
  border: 1px solid #d1dfed;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px 8px;
  display: inline-flex;
  align-items: center;
  color: #607890;
  font-size: 11px;
}

.chart-empty {
  margin: 8px 0 0;
  font-size: 12px;
  color: #657d95;
}

@media (max-width: 768px) {
  .user-controls {
    justify-content: flex-start;
  }
}
</style>

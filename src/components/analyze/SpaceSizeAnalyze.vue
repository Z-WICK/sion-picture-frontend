<template>
  <div class="space-size-analyze">
    <a-card title="空间图片大小分析" class="analyze-card">
      <template #extra>
        <a-space size="small" wrap>
          <span class="analyze-stat">
            <strong>{{ sizeRangeCount }}</strong>
            <span>区间</span>
          </span>
          <span class="analyze-stat">
            <strong>{{ topRangeText }}</strong>
            <span>占比最高</span>
          </span>
        </a-space>
      </template>
      <v-chart class="analyze-chart" :option="options" :loading="loading" />
      <p v-if="!loading && !hasData" class="chart-empty">暂无图片大小分布数据。</p>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { postSpaceAnalyzeSize } from '@/api/analyze'
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
const dataList = ref<API.SpaceSizeAnalyzeResponse>([])
// 加载状态
const loading = ref(true)
const hasData = computed(() => dataList.value.length > 0)
const sizeRangeCount = computed(() => dataList.value.length)
const topRangeText = computed(() => {
  if (!hasData.value) {
    return '--'
  }
  const topItem = [...dataList.value].sort((a, b) => Number(b.count ?? 0) - Number(a.count ?? 0))[0]
  return topItem?.sizeRange || '--'
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const res = await postSpaceAnalyzeSize({
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
  const pieData = dataList.value.map((item) => ({
    name: item.sizeRange || '未知分段',
    value: Number(item.count ?? 0),
  }))

  return {
    color: ['#5a7390', '#7691ab', '#8ea4bc', '#6a829b', '#486481'],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      top: 'bottom',
      textStyle: {
        color: '#607890',
      },
    },
    series: [
      {
        name: '图片大小',
        type: 'pie',
        radius: ['34%', '62%'],
        center: ['50%', '42%'],
        data: pieData,
        label: {
          color: '#556d86',
        },
        itemStyle: {
          borderRadius: 6,
          borderColor: '#f7fbff',
          borderWidth: 2,
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

<template>
  <div class="space-category-analyze">
    <a-card title="空间图片分类分析" class="analyze-card">
      <template #extra>
        <a-space size="small" wrap>
          <span class="analyze-stat">
            <strong>{{ categoryCount }}</strong>
            <span>分类</span>
          </span>
          <span class="analyze-stat">
            <strong>{{ totalPictureCount }}</strong>
            <span>图片</span>
          </span>
          <span class="analyze-stat">
            <strong>{{ totalSizeMb }} MB</strong>
            <span>总大小</span>
          </span>
        </a-space>
      </template>
      <v-chart class="analyze-chart" :option="options" :loading="loading" />
      <p v-if="!loading && !hasData" class="chart-empty">暂无分类数据，上传并标注分类后可查看趋势。</p>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { postSpaceAnalyzeCategory } from '@/api/analyze'
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
const categoryCount = computed(() => dataList.value.length)
const totalPictureCount = computed(() => {
  return dataList.value.reduce((sum, item) => sum + Number(item.count ?? 0), 0)
})
const totalSizeMb = computed(() => {
  const totalSize = dataList.value.reduce((sum, item) => sum + Number(item.totalSize ?? 0), 0)
  return (totalSize / (1024 * 1024)).toFixed(2)
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const res = await postSpaceAnalyzeCategory({
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
  const categories = dataList.value.map((item) => item.category || '未分类')
  const countData = dataList.value.map((item) => Number(item.count ?? 0))
  const sizeData = dataList.value.map((item) =>
    Number(((item.totalSize ?? 0) / (1024 * 1024)).toFixed(2)),
  ) // 转为 MB

  return {
    color: ['#5a7390', '#90a4bc'],
    tooltip: { trigger: 'axis' },
    grid: { top: 24, left: 42, right: 40, bottom: 62 },
    legend: {
      data: ['图片数量', '图片总大小'],
      top: 'bottom',
      textStyle: {
        color: '#5f758d',
      },
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        color: '#60758d',
        rotate: categories.length > 6 ? 20 : 0,
      },
      axisLine: {
        lineStyle: {
          color: '#c9d8e8',
        },
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '图片数量',
        nameTextStyle: { color: '#5a7390' },
        axisLine: { show: true, lineStyle: { color: '#5a7390' } },
        splitLine: {
          lineStyle: {
            color: '#e0e9f3',
            type: 'dashed',
          },
        },
      },
      {
        type: 'value',
        name: '图片总大小 (MB)',
        position: 'right',
        nameTextStyle: { color: '#90a4bc' },
        axisLine: { show: true, lineStyle: { color: '#90a4bc' } },
        splitLine: {
          lineStyle: {
            color: '#dbe5f0',
            type: 'dashed',
          },
        },
      },
    ],
    series: [
      {
        name: '图片数量',
        type: 'bar',
        data: countData,
        yAxisIndex: 0,
        barMaxWidth: 28,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: '图片总大小',
        type: 'bar',
        data: sizeData,
        yAxisIndex: 1,
        barMaxWidth: 28,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
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

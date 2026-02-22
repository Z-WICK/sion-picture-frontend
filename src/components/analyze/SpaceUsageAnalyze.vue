<template>
  <div class="space-usage-analyze">
    <div class="analyze-card-grid">
      <a-card title="存储空间" class="usage-card">
        <template #extra>
          <span class="usage-extra">{{ sizeUsagePercent }}%</span>
        </template>
        <div class="analyze-center">
          <div>
            <h3 class="usage-value">{{ sizeDisplayText }}</h3>
            <a-progress type="dashboard" :percent="sizeUsagePercent" :stroke-color="'#5c7794'" />
            <p class="usage-caption">已使用 {{ formatSize(data.usedSize ?? 0) }}</p>
          </div>
        </div>
      </a-card>
      <a-card title="图片数量" class="usage-card">
        <template #extra>
          <span class="usage-extra">{{ countUsagePercent }}%</span>
        </template>
        <div class="analyze-center">
          <div>
            <h3 class="usage-value">{{ countDisplayText }}</h3>
            <a-progress type="dashboard" :percent="countUsagePercent" :stroke-color="'#7f96af'" />
            <p class="usage-caption">已上传 {{ data.usedCount ?? 0 }} 张</p>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { postSpaceAnalyzeUsage } from '@/api/analyze'
import { message } from 'ant-design-vue'
import { formatSize } from '@/utils'

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
const data = ref<API.SpaceUsageAnalyzeResponse>({})
// 加载状态
const loading = ref(true)
const normalizePercent = (value?: number) => {
  const numericValue = Number(value ?? 0)
  if (Number.isNaN(numericValue)) {
    return 0
  }
  return Math.max(0, Math.min(100, Math.round(numericValue)))
}
const sizeUsagePercent = computed(() => normalizePercent(data.value.sizeUsageRatio))
const countUsagePercent = computed(() => normalizePercent(data.value.countUsageRatio))
const sizeDisplayText = computed(() => {
  return `${formatSize(data.value.usedSize ?? 0)} / ${data.value.maxSize ? formatSize(data.value.maxSize) : '无限制'}`
})
const countDisplayText = computed(() => {
  return `${data.value.usedCount ?? 0} / ${data.value.maxCount ?? '无限制'}`
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 转换搜索参数
    const res = await postSpaceAnalyzeUsage({
      queryAll: props.queryAll,
      queryPublic: props.queryPublic,
      spaceId: props.spaceId,
    })
    if (res.data.code === 0 && res.data.data) {
      data.value = res.data.data
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
    const errorMessage =
      maybeResponse?.data?.message ?? (error instanceof Error ? error.message : String(error))
    message.error('获取数据失败，' + errorMessage)
  } finally {
    loading.value = false
  }
}

/**
 * 监听变量，参数改变时触发数据的重新加载
 */
watchEffect(() => {
  fetchData()
})
</script>

<style scoped>
.usage-card :deep(.ant-card-head-title) {
  font-size: 14px;
}

.usage-extra {
  font-size: 12px;
  color: #60768e;
  font-weight: 600;
}

.usage-value {
  margin: 0 0 8px;
  color: #2a3f58;
  font-size: 18px;
  line-height: 1.3;
}

.usage-caption {
  margin: 8px 0 0;
  color: #637992;
  font-size: 12px;
}
</style>

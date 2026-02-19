<template>
  <div class="space-user-analyze">
    <div class="analyze-card-grid">
      <a-card title="存储空间">
        <div class="analyze-center">
          <div>
            <h3 class="usage-value">
              {{ formatSize(data.usedSize) }} /
              {{ data.maxSize ? formatSize(data.maxSize) : '无限制' }}
            </h3>
            <a-progress type="dashboard" :percent="data.sizeUsageRatio ?? 0" />
          </div>
        </div>
      </a-card>
      <a-card title="图片数量">
        <div class="analyze-center">
          <div>
            <h3 class="usage-value">{{ data.usedCount }} / {{ data.maxCount ?? '无限制' }}</h3>
            <a-progress type="dashboard" :percent="data.countUsageRatio ?? 0" />
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
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

// 获取数据
const fetchData = async () => {
  loading.value = true
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
  loading.value = false
}

/**
 * 监听变量，参数改变时触发数据的重新加载
 */
watchEffect(() => {
  fetchData()
})
</script>

<style scoped>
.usage-value {
  margin-bottom: 12px;
  color: #2a3f58;
}
</style>

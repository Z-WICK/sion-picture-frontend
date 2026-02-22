<template>
  <div id="addPictureBatchPage" class="page-shell">
    <section class="page-toolbar batch-toolbar">
      <div class="page-toolbar-main">
        <div>
          <h2 class="page-title">批量创建图片</h2>
          <p class="page-subtitle">通过关键词批量抓取并入库，适合快速搭建素材池。</p>
        </div>
        <a-space size="small" class="page-toolbar-actions">
          <a-button ghost href="/add_picture" target="_blank">单图上传</a-button>
          <a-button ghost href="/gallery" target="_blank">查看图库</a-button>
        </a-space>
      </div>
      <div class="mini-kpi-row">
        <span class="mini-kpi">
          <strong>{{ normalizedCount || '--' }}</strong>
          <span>抓取数量</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ estimatedDurationText }}</strong>
          <span>预计耗时</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ keywordLength || '--' }}</strong>
          <span>关键词长度</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ submitReady ? '可执行' : '待完善' }}</strong>
          <span>任务状态</span>
        </span>
      </div>
    </section>

    <section class="batch-create-grid">
      <section class="panel-card batch-form-panel">
        <div class="panel-head">
          <div>
            <h3 class="panel-title">任务参数</h3>
            <p class="panel-subtitle">建议先用小批量验证质量，再逐步放大规模。</p>
          </div>
          <a-tag class="panel-tip-tag">推荐 6-15 张</a-tag>
        </div>

        <a-form layout="vertical" :model="formData" @finish="handleSubmit">
          <a-form-item label="关键词" name="searchText">
            <a-input
              v-model:value="formData.searchText"
              placeholder="请输入关键词，例如：海边日落 插画"
              allow-clear
            />
          </a-form-item>

          <a-form-item label="抓取数量" name="count">
            <div class="count-control">
              <a-input-number
                v-model:value="formData.count"
                placeholder="请输入数量"
                class="w-180"
                :min="1"
                :max="30"
                allow-clear
              />
              <div class="count-preset-group" aria-label="快捷数量">
                <button
                  v-for="count in quickCountOptions"
                  :key="count"
                  type="button"
                  class="count-preset-btn"
                  :class="{ 'is-active': normalizedCount === count }"
                  :aria-pressed="normalizedCount === count"
                  @click="applyCountPreset(count)"
                >
                  {{ count }}
                </button>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="名称前缀" name="namePrefix">
            <a-input
              v-model:value="formData.namePrefix"
              placeholder="请输入名称前缀，会自动补充序号"
              allow-clear
            />
          </a-form-item>

          <a-form-item label="任务预览">
            <div class="task-preview-card">
              <span class="task-preview-label">关键词</span>
              <strong class="task-preview-value">{{ keywordPreview }}</strong>
              <span class="task-preview-meta">
                预计生成 {{ normalizedCount || 0 }} 张图片，命名前缀
                {{ formData.namePrefix?.trim() || '默认标题' }}
              </span>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" class="btn-full" :loading="loading">
              执行任务
            </a-button>
          </a-form-item>
        </a-form>
      </section>

      <aside class="batch-side-column">
        <section class="panel-card batch-tips">
          <h3 class="tips-title">执行建议</h3>
          <p class="tips-item">1. 关键词尽量具体，例如「海边日落 插画」。</p>
          <p class="tips-item">2. 建议先抓取 6-15 张，快速校验结果质量。</p>
          <p class="tips-item">3. 名称前缀可作为后续筛选与归档依据。</p>
          <div class="tips-card">
            <span class="tips-card-label">当前策略</span>
            <strong class="tips-card-value">
              {{ submitReady ? `准备抓取 ${normalizedCount} 张` : '等待填写关键词与数量' }}
            </strong>
          </div>
        </section>

        <section class="panel-card caution-card">
          <h3 class="tips-title">质量提醒</h3>
          <p class="tips-item">关键词越宽泛，结果波动越大，建议附加场景词。</p>
          <p class="tips-item">若用于空间素材库，可先在公共图库确认样本后再入库。</p>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { postPictureUploadBatch } from '@/api/picture'
import { message } from 'ant-design-vue'
import router from '@/router'

const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
})

const loading = ref(false)
const quickCountOptions = [6, 10, 15, 20]
const normalizedCount = computed(() => Number(formData.count ?? 0))
const keywordLength = computed(() => formData.searchText?.trim().length ?? 0)
const keywordPreview = computed(() => formData.searchText?.trim() || '未设置关键词')
const submitReady = computed(() => {
  return Boolean(formData.searchText?.trim()) && normalizedCount.value > 0
})
const estimatedDurationText = computed(() => {
  if (!normalizedCount.value) {
    return '--'
  }
  const min = Math.max(2, Math.round(normalizedCount.value * 1.4))
  const max = Math.max(min + 2, Math.round(normalizedCount.value * 3))
  return `${min}-${max} 秒`
})

const applyCountPreset = (count: number) => {
  formData.count = count
}

const handleSubmit = async () => {
  if (!submitReady.value) {
    message.warning('请先填写关键词和抓取数量')
    return
  }
  loading.value = true
  try {
    const res = await postPictureUploadBatch({
      ...formData,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success(`创建成功，共${res.data.data}条`)
      router.push({
        path: '/gallery',
      })
    } else {
      message.error('创建失败' + res.data.message)
    }
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (error instanceof Error ? error.message : String(error))
    message.error('创建失败，' + errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
#addPictureBatchPage {
  max-width: 1120px;
  margin: 0 auto;
}

.batch-toolbar {
  background:
    radial-gradient(120% 110% at 0% 0%, rgb(208 222 240 / 30%) 0%, transparent 56%),
    linear-gradient(180deg, #fbfdff 0%, #f0f6fd 100%);
}

.batch-create-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  align-items: start;
}

.batch-form-panel {
  background:
    radial-gradient(128% 120% at 100% 0%, rgb(199 217 237 / 17%) 0%, transparent 58%),
    linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
}

.batch-side-column {
  display: grid;
  gap: 12px;
}

.panel-head {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  color: #233f5d;
}

.panel-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #607891;
}

.panel-tip-tag {
  margin-right: 0;
  border-color: #b8cde3;
  background: #e8f1fb;
  color: #2f4b69;
}

.count-control {
  display: grid;
  gap: 8px;
}

.count-preset-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.count-preset-btn {
  min-width: 44px;
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid #c8d8e9;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fb 100%);
  color: #385674;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.count-preset-btn:hover,
.count-preset-btn:focus-visible {
  border-color: #9db5cd;
  color: #26415f;
}

.count-preset-btn.is-active {
  border-color: #9bb2ca;
  background: #dde9f5;
  color: #21405d;
  font-weight: 600;
}

.task-preview-card {
  border-radius: 12px;
  border: 1px solid #d2dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 10px;
  display: grid;
  gap: 4px;
}

.task-preview-label {
  font-size: 11px;
  color: #607890;
}

.task-preview-value {
  font-size: 14px;
  color: #284462;
  line-height: 1.4;
  word-break: break-word;
}

.task-preview-meta {
  font-size: 12px;
  color: #5f768f;
  line-height: 1.55;
}

.tips-title {
  margin: 0;
  font-size: 16px;
  color: #23374d;
}

.tips-item {
  margin: 8px 0 0;
  color: #4a627c;
  line-height: 1.6;
}

.tips-card {
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid #d2dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 10px;
  display: grid;
  gap: 4px;
}

.tips-card-label {
  font-size: 11px;
  color: #607890;
}

.tips-card-value {
  font-size: 13px;
  color: #284462;
  line-height: 1.4;
}

.caution-card {
  background: linear-gradient(180deg, #ffffff 0%, #f3f8ff 100%);
}

@media (max-width: 900px) {
  .batch-create-grid {
    grid-template-columns: 1fr;
  }
}
</style>

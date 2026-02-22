<template>
  <div id="addSpacePage" class="page-shell">
    <section class="page-toolbar space-form-toolbar">
      <div class="page-toolbar-main">
        <div class="space-form-title">
          <p class="space-form-kicker">Space Setup</p>
          <h2 class="page-title">{{ pageTitle }}</h2>
          <p class="page-subtitle">{{ toolbarSubtitle }}</p>
        </div>
        <a-space class="page-toolbar-actions">
          <a-button class="space-form-action-btn" @click="router.push('/gallery')">返回图库</a-button>
          <a-button class="space-form-action-btn" type="primary" @click="router.push('/my_space')">
            我的空间
          </a-button>
        </a-space>
      </div>
      <div class="mini-kpi-row">
        <span class="mini-kpi">
          <strong>{{ SPACE_TYPE_MAP[spaceType] }}</strong>
          <span>空间类型</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ selectedLevelLabel }}</strong>
          <span>当前级别</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ selectedLevelSizeText }}</strong>
          <span>容量上限</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ selectedLevelCountText }}</strong>
          <span>图片数量</span>
        </span>
      </div>
    </section>
    <section class="space-create-grid">
      <section class="panel-card">
        <div class="panel-head">
          <div>
            <h3 class="panel-title">空间信息</h3>
            <p class="panel-subtitle">命名并选择级别后即可立即开通</p>
          </div>
        </div>
        <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
          <a-form-item
            name="spaceName"
            label="空间名称"
            :rules="[{ required: true, message: '请输入空间名称' }]"
          >
            <a-input v-model:value="spaceForm.spaceName" placeholder="请输入空间" allow-clear />
          </a-form-item>
          <a-form-item
            name="spaceLevel"
            label="空间级别"
            :rules="[{ required: true, message: '请选择空间级别' }]"
          >
            <a-select
              v-model:value="spaceForm.spaceLevel"
              class="w-180"
              placeholder="请选择空间级别"
              :options="SPACE_LEVEL_OPTIONS"
              allow-clear
            />
            <div class="level-quick-row">
              <button
                v-for="option in SPACE_LEVEL_OPTIONS"
                :key="option.value"
                type="button"
                class="level-quick-btn"
                :class="{ 'is-active': selectedLevelValue === option.value }"
                @click="chooseLevel(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </a-form-item>
          <a-form-item class="form-submit-item">
            <a-space class="submit-actions" size="small">
              <a-button type="primary" html-type="submit" :loading="loading">
                {{ submitButtonLabel }}
              </a-button>
              <a-button @click="resetForm">{{ isEditMode ? '恢复原值' : '清空表单' }}</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </section>
      <aside class="space-side-column">
        <section class="panel-card level-panel">
          <h3 class="level-title">级别容量预览</h3>
          <p class="level-selected">{{ selectedLevelLabel }}</p>
          <div class="capacity-grid">
            <article class="capacity-item">
              <span class="capacity-label">容量上限</span>
              <strong class="capacity-value">{{ selectedLevelSizeText }}</strong>
            </article>
            <article class="capacity-item">
              <span class="capacity-label">图片数量</span>
              <strong class="capacity-value">{{ selectedLevelCountText }}</strong>
            </article>
          </div>
          <p class="level-note">
            * 目前仅支持开通普通版，如需升级空间，请联系
            <a href="" target="_blank">JohnSion</a>
          </p>
        </section>

        <section class="panel-card">
          <h3 class="level-title">空间级别介绍</h3>
          <p class="level-caption">点击下方任一等级，立即同步到左侧表单。</p>
          <div class="level-list">
            <button
              v-for="spaceLevel in spaceLevelList"
              :key="spaceLevel.id"
              type="button"
              class="level-item"
              :class="{ 'is-active': selectedLevelValue === spaceLevel.id }"
              @click="chooseLevel(spaceLevel.id)"
            >
              <span class="level-item-name">{{ resolveLevelName(spaceLevel) }}</span>
              <span class="level-item-meta">
                大小 {{ formatSize(spaceLevel.maxSize) }}，数量 {{ spaceLevel.maxCount }}
              </span>
            </button>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  postSpaceAdd,
  getSpaceGetVo,
  getSpaceListLevel,
  postSpaceUpdate,
} from '@/api/space'
import { useRoute, useRouter } from 'vue-router'
import {
  SPACE_LEVEL_MAP,
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_ENUM,
  SPACE_TYPE_MAP,
} from '@/constants/space.ts'
import { formatSize } from '@/utils'

const space = ref<API.SpaceVO>()
type SpaceFormState = API.SpaceAddRequest & API.SpaceUpdateRequest
const spaceForm = reactive<SpaceFormState>({})
const loading = ref(false)

const route = useRoute()
const routeSpaceId = computed(() => {
  const id = Number(route.query?.id)
  return Number.isNaN(id) ? undefined : id
})
const isEditMode = computed(() => routeSpaceId.value !== undefined)
const pageTitle = computed(() => `${isEditMode.value ? '修改' : '创建'} ${SPACE_TYPE_MAP[spaceType.value]}`)
const toolbarSubtitle = computed(() => {
  if (isEditMode.value) {
    return '更新空间名称与级别后，容量配置会按新级别生效'
  }
  return '先设置空间信息，再按级别规划容量与图片数量'
})
// 空间类别，默认为私有空间
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  } else {
    return SPACE_TYPE_ENUM.PRIVATE
  }
})

const spaceLevelList = ref<API.SpaceLevel[]>([])
const selectedLevelValue = computed(() => {
  const level = Number(spaceForm.spaceLevel)
  return Number.isNaN(level) ? undefined : level
})
const selectedLevelLabel = computed(() => {
  if (selectedLevelValue.value === undefined) {
    return '未选择'
  }
  return SPACE_LEVEL_MAP[selectedLevelValue.value] ?? `级别 ${selectedLevelValue.value}`
})
const selectedLevelInfo = computed(() => {
  if (selectedLevelValue.value === undefined) {
    return undefined
  }
  return spaceLevelList.value.find((item) => item.id === selectedLevelValue.value)
})
const selectedLevelSizeText = computed(() => {
  const maxSize = selectedLevelInfo.value?.maxSize
  return maxSize ? formatSize(maxSize) : '--'
})
const selectedLevelCountText = computed(() => {
  const maxCount = selectedLevelInfo.value?.maxCount
  return maxCount ? `${maxCount}` : '--'
})
const submitButtonLabel = computed(() => (isEditMode.value ? '保存并返回空间' : '创建并进入空间'))
const chooseLevel = (levelId?: number) => {
  if (levelId === undefined || levelId === null) {
    return
  }
  spaceForm.spaceLevel = levelId
}
const resolveLevelName = (spaceLevel: API.SpaceLevel) => {
  if (spaceLevel.text) {
    return spaceLevel.text
  }
  if (spaceLevel.id === undefined) {
    return '未命名级别'
  }
  return SPACE_LEVEL_MAP[spaceLevel.id] ?? `级别 ${spaceLevel.id}`
}
const getApiErrorMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const getErrorMessage = (error: unknown) => {
  return getApiErrorMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await getSpaceListLevel()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败，' + res.data.message)
  }
}

onMounted(() => {
  fetchSpaceLevelList()
})

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async () => {
  const normalizedSpaceName = spaceForm.spaceName?.trim()
  if (!normalizedSpaceName) {
    message.warning('请输入空间名称')
    return
  }
  if (spaceForm.spaceLevel === undefined || spaceForm.spaceLevel === null) {
    message.warning('请选择空间级别')
    return
  }

  const spaceId = space.value?.id
  loading.value = true
  try {
    let res
    if (spaceId) {
      // 更新
      res = await postSpaceUpdate({
        id: spaceId,
        ...spaceForm,
        spaceName: normalizedSpaceName,
      })
    } else {
      // 创建
      res = await postSpaceAdd({
        ...spaceForm,
        spaceName: normalizedSpaceName,
        spaceType: spaceType.value,
      })
    }
    // 操作成功
    if (res.data.code === 0 && res.data.data) {
      message.success('操作成功')
      // 跳转到空间详情页
      router.push({
        path: `/space/${res.data.data}`,
      })
    } else {
      message.error('操作失败，' + res.data.message)
    }
  } catch (error) {
    message.error('操作失败，' + getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  if (space.value?.id) {
    spaceForm.spaceName = space.value.spaceName
    spaceForm.spaceLevel = space.value.spaceLevel
    return
  }
  spaceForm.spaceName = undefined
  spaceForm.spaceLevel = undefined
}

// 获取老数据
const getOldSpace = async () => {
  if (routeSpaceId.value !== undefined) {
    const res = await getSpaceGetVo({
      id: routeSpaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      // 填充表单
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}

onMounted(() => {
  getOldSpace()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 1180px;
  margin: 0 auto;
}

#addSpacePage .space-form-toolbar {
  position: relative;
  overflow: hidden;
  border-color: #c8d7e7;
  background:
    radial-gradient(130% 100% at 0% -10%, rgb(166 193 220 / 24%) 0%, transparent 56%),
    radial-gradient(120% 92% at 100% -8%, rgb(205 222 240 / 22%) 0%, transparent 54%),
    linear-gradient(180deg, rgb(255 255 255 / 95%) 0%, rgb(242 248 255 / 94%) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    0 10px 22px rgb(31 50 72 / 8%);
}

#addSpacePage .space-form-toolbar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(132deg, rgb(255 255 255 / 20%) 0%, rgb(255 255 255 / 0%) 46%),
    repeating-linear-gradient(122deg, rgb(255 255 255 / 14%) 0 2px, rgb(255 255 255 / 0%) 2px 11px);
  opacity: 0.72;
  pointer-events: none;
}

#addSpacePage .space-form-title {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 4px;
}

#addSpacePage .space-form-kicker {
  margin: 0;
  width: fit-content;
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #ccdaea;
  background: linear-gradient(180deg, #ffffff 0%, #edf5fd 100%);
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  color: #3d5b7b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

#addSpacePage .space-form-action-btn {
  min-height: 30px;
  border-radius: 999px;
  border-color: #c8d8e9;
  background: linear-gradient(180deg, #fafdff 0%, #eef5fc 100%);
  color: #2f4b69;
  font-size: 12px;
}

#addSpacePage .space-form-action-btn:hover,
#addSpacePage .space-form-action-btn:focus {
  border-color: #abc0d7;
  background: #e4eef8;
  color: #1f3852;
}

.space-create-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  align-items: start;
}

.space-side-column {
  display: grid;
  gap: 12px;
  position: sticky;
  top: 12px;
}

.panel-head {
  margin-bottom: 10px;
}

.panel-title {
  margin: 0;
  color: #223f5e;
  font-size: 16px;
}

.panel-subtitle {
  margin: 2px 0 0;
  color: #637b94;
  font-size: 12px;
}

.form-submit-item {
  margin-top: 10px;
}

.submit-actions :deep(.ant-btn) {
  min-height: 34px;
  border-radius: 999px;
  padding-inline: 16px;
}

.level-quick-row {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.level-quick-btn {
  min-height: 34px;
  border-radius: 10px;
  border: 1px solid #ccdced;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  color: #34506d;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-quick-btn:hover {
  border-color: #9fb8d2;
  background: #eef5fc;
}

.level-quick-btn.is-active {
  border-color: #8ca7c4;
  background: #e2edf8;
  color: #26415e;
  font-weight: 600;
}

.level-panel {
  display: grid;
  gap: 10px;
}

.level-title {
  margin: 0;
  color: #22384f;
  font-size: 16px;
}

.level-selected {
  margin: 0;
  color: #2b4968;
  font-size: 13px;
  font-weight: 600;
}

.capacity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.capacity-item {
  border-radius: 10px;
  border: 1px solid #d0deec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 8px 10px;
  display: grid;
  gap: 4px;
}

.capacity-label {
  font-size: 11px;
  color: #667d95;
}

.capacity-value {
  font-size: 14px;
  line-height: 1.2;
  color: #2b4664;
}

.level-note {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #657d95;
}

.level-list {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.level-caption {
  margin: 4px 0 0;
  color: #637b94;
  font-size: 12px;
}

.level-item {
  border: 1px solid #d2dfec;
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 8px 10px;
  display: grid;
  gap: 3px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-item:hover {
  border-color: #a5bdd5;
  background: #eef5fc;
}

.level-item.is-active {
  border-color: #8fa9c5;
  background: #e3edf8;
}

.level-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #2a4562;
}

.level-item-meta {
  font-size: 12px;
  color: #657d95;
}

@media (max-width: 992px) {
  .space-create-grid {
    grid-template-columns: 1fr;
  }

  .space-side-column {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  #addSpacePage .space-form-toolbar {
    padding: 10px;
  }

  #addSpacePage .space-form-action-btn {
    min-height: 28px;
    font-size: 11px;
  }

  .space-side-column,
  .capacity-grid {
    grid-template-columns: 1fr;
  }

  .level-quick-row {
    grid-template-columns: 1fr;
  }
}
</style>

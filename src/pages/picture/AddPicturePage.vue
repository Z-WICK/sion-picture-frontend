<template>
  <div id="addPicturePage" class="page-shell">
    <section class="page-toolbar workbench-toolbar">
      <div class="page-toolbar-main">
        <div class="toolbar-main-copy">
          <p class="toolbar-kicker">Picture Workbench</p>
          <h2 class="page-title">{{ isEditMode ? '修改图片' : '创建图片' }}</h2>
          <p class="page-subtitle">
            按步骤完成上传、处理与信息填写，确保后续检索与协作可复用。
            <template v-if="spaceId">
              当前空间：
              <a :href="`/space/${spaceId}`" target="_blank">{{ currentSpaceLabel }}</a>
            </template>
          </p>
        </div>

        <a-space size="small" class="page-toolbar-actions">
          <a-button ghost href="/gallery" target="_blank">公开图库</a-button>
          <a-button v-if="spaceId" ghost :href="`/space/${spaceId}`" target="_blank">打开空间</a-button>
          <a-button
            v-if="currentPictureId"
            type="primary"
            ghost
            :href="`/picture/${currentPictureId}`"
            target="_blank"
          >
            预览详情
          </a-button>
        </a-space>
      </div>

      <div class="step-rail" aria-label="创建流程">
        <article
          v-for="item in flowSteps"
          :key="item.index"
          class="step-card"
          :class="{ 'is-done': item.done, 'is-active': item.active }"
        >
          <span class="step-index">{{ item.index }}</span>
          <div class="step-copy">
            <p class="step-title">{{ item.title }}</p>
            <p class="step-desc">{{ item.desc }}</p>
          </div>
          <span class="step-status">{{ item.done ? '完成' : item.active ? '进行中' : '待执行' }}</span>
        </article>
      </div>

      <div class="mini-kpi-row">
        <span class="mini-kpi">
          <strong>{{ currentPictureId ? '可编辑' : '待上传' }}</strong>
          <span>当前状态</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ uploadType === 'file' ? '文件' : 'URL' }}</strong>
          <span>上传方式</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ tagCount }}</strong>
          <span>标签数量</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ metadataCompletionRate }}%</strong>
          <span>信息完成度</span>
        </span>
      </div>
    </section>

    <section class="picture-workbench-grid">
      <section class="picture-workbench-main">
        <article class="panel-card source-panel">
          <div class="panel-head">
            <div>
              <h3 class="panel-title">步骤 1 · 上传源图</h3>
              <p class="panel-subtitle">先确定图片来源，再进行后续处理。</p>
            </div>
            <a-segmented v-model:value="uploadType" class="source-segment" :options="uploadModeOptions" />
          </div>

          <div class="source-stage">
            <PictureUpload v-if="uploadType === 'file'" :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
            <UrlPictureUpload v-else :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
          </div>
        </article>

        <article v-if="picture" class="panel-card process-panel">
          <div class="panel-head">
            <div>
              <h3 class="panel-title">步骤 2 · 图片处理</h3>
              <p class="panel-subtitle">可选裁切和 AI 扩图，原图始终可追溯。</p>
            </div>
          </div>

          <div class="process-kpi-row">
            <span class="process-kpi">
              <strong>{{ imageResolutionText }}</strong>
              <span>分辨率</span>
            </span>
            <span class="process-kpi">
              <strong>{{ imageFormatText }}</strong>
              <span>格式</span>
            </span>
            <span class="process-kpi">
              <strong>{{ imageSizeText }}</strong>
              <span>体积</span>
            </span>
          </div>

          <div class="process-actions">
            <a-button @click="doEditPicture">
              <template #icon>
                <EditOutlined />
              </template>
              编辑图片
            </a-button>
            <a-button type="primary" @click="doImagePainting">
              <template #icon>
                <FullscreenOutlined />
              </template>
              AI 扩图
            </a-button>
          </div>

          <ImageCropper
            ref="imageCropperRef"
            :imageUrl="cropperImageUrl"
            :picture="picture"
            :spaceId="spaceId"
            :space="space"
            :onSuccess="onCropSuccess"
          />
          <ImageOutPainting
            ref="imageOutPaintingRef"
            :picture="picture"
            :spaceId="spaceId"
            :onSuccess="onImageOutPaintingSuccess"
          />
        </article>

        <article v-if="picture" class="panel-card metadata-panel">
          <div class="panel-head">
            <div>
              <h3 class="panel-title">步骤 3 · 填写信息并提交</h3>
              <p class="panel-subtitle">完善标题、分类与标签，提升后续检索效率。</p>
            </div>
          </div>

          <a-form name="pictureForm" layout="vertical" :model="pictureForm" @finish="handleSubmit">
            <div class="meta-form-grid">
              <a-form-item class="meta-col-6" name="name" label="名称">
                <a-input v-model:value="pictureForm.name" placeholder="请输入名称" allow-clear />
              </a-form-item>
              <a-form-item class="meta-col-6" name="category" label="分类">
                <a-auto-complete
                  v-model:value="pictureForm.category"
                  placeholder="请输入分类"
                  :options="categoryOptions"
                  allow-clear
                />
              </a-form-item>
              <a-form-item class="meta-col-12" name="introduction" label="简介">
                <a-textarea
                  v-model:value="pictureForm.introduction"
                  placeholder="请输入简介"
                  :auto-size="{ minRows: 2, maxRows: 5 }"
                  allow-clear
                />
              </a-form-item>
              <a-form-item class="meta-col-12" name="tags" label="标签">
                <a-select
                  v-model:value="pictureForm.tags"
                  mode="tags"
                  placeholder="请输入标签"
                  :options="tagOptions"
                  allow-clear
                />
              </a-form-item>
            </div>

            <p class="form-hint">建议至少填写名称、分类和一个标签，可显著提升搜索命中率。</p>
            <a-form-item class="submit-row">
              <a-space>
                <a-button type="primary" html-type="submit">{{ submitButtonText }}</a-button>
                <a-button @click="resetPictureForm">清空信息</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </article>

        <article v-else class="panel-card waiting-panel">
          <h3 class="waiting-title">等待上传完成</h3>
          <p class="waiting-desc">先完成步骤 1，系统会自动解锁图片处理与信息编辑模块。</p>
        </article>
      </section>

      <aside class="picture-side-column">
        <article class="panel-card preview-panel">
          <div class="panel-head">
            <div>
              <h3 class="panel-title">实时预览</h3>
              <p class="panel-subtitle">上传后即时查看当前图片状态。</p>
            </div>
          </div>
          <div class="preview-frame">
            <img v-if="previewImageUrl" :src="previewImageUrl" :alt="currentPictureName" class="preview-image" />
            <div v-else class="preview-empty">上传后在此展示预览</div>
          </div>
          <p class="preview-name">{{ currentPictureName }}</p>
          <div class="preview-meta-chips">
            <span class="meta-chip">ID {{ currentPictureId ?? '--' }}</span>
            <span class="meta-chip">{{ currentSpaceLabel }}</span>
          </div>
        </article>

        <article class="panel-card flow-panel">
          <h3 class="flow-title">发布流程</h3>
          <ul class="flow-list">
            <li class="flow-item" :class="{ 'is-done': Boolean(currentPictureId) }">
              <span class="flow-index">1</span>
              <span class="flow-text">上传图片源文件</span>
            </li>
            <li class="flow-item" :class="{ 'is-done': Boolean(currentPictureId) }">
              <span class="flow-index">2</span>
              <span class="flow-text">按需编辑或扩图</span>
            </li>
            <li class="flow-item" :class="{ 'is-done': tagCount > 0 || Boolean(pictureForm.category?.trim()) }">
              <span class="flow-index">3</span>
              <span class="flow-text">添加分类与标签</span>
            </li>
            <li class="flow-item" :class="{ 'is-done': metadataReady && Boolean(currentPictureId) }">
              <span class="flow-index">4</span>
              <span class="flow-text">{{ isEditMode ? '保存并更新详情页' : '提交并进入详情页' }}</span>
            </li>
          </ul>
        </article>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getPictureGetVo, getPictureTagCategory, postPictureEdit } from '@/api/picture'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import { EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'
import { getSpaceGetVo } from '@/api/space'
import { getPictureFileUrl, resolveImageUrl } from '@/utils'

const router = useRouter()
const route = useRoute()

const picture = ref<API.PictureVO>()
const pictureForm = reactive<API.PictureEditRequest>({})
const uploadType = ref<'file' | 'url'>('file')
const uploadModeOptions = [
  { label: '文件上传', value: 'file' },
  { label: 'URL 上传', value: 'url' },
]

const isEditMode = computed(() => {
  const id = Number(route.query?.id)
  return !Number.isNaN(id)
})
const cropperImageUrl = computed(() => getPictureFileUrl(picture.value?.id) ?? resolveImageUrl(picture.value?.url))
const spaceId = computed(() => {
  const id = Number(route.query?.spaceId)
  return Number.isNaN(id) ? undefined : id
})
const currentPictureId = computed(() => picture.value?.id)
const previewImageUrl = computed(() => {
  const imageUrl = getPictureFileUrl(currentPictureId.value) ?? resolveImageUrl(picture.value?.url)
  return imageUrl ?? ''
})
const currentPictureName = computed(() => picture.value?.name?.trim() || '未命名图片')
const tagCount = computed(() => pictureForm.tags?.length ?? 0)
const filledFieldCount = computed(() => {
  const fields = [
    pictureForm.name?.trim(),
    pictureForm.introduction?.trim(),
    pictureForm.category?.trim(),
    tagCount.value > 0 ? 'tag' : '',
  ]
  return fields.filter(Boolean).length
})
const metadataCompletionRate = computed(() => Math.round((filledFieldCount.value / 4) * 100))
const metadataReady = computed(() => filledFieldCount.value >= 3)
const submitButtonText = computed(() => (isEditMode.value ? '保存修改' : '创建图片'))
const currentSpaceLabel = computed(() => {
  if (!spaceId.value) {
    return '公共图库'
  }
  const spaceName = space.value?.spaceName?.trim()
  return spaceName ? `${spaceName} · ID ${spaceId.value}` : `空间 ${spaceId.value}`
})
const imageResolutionText = computed(() => {
  const width = picture.value?.picWidth
  const height = picture.value?.picHeight
  if (width !== undefined && width !== null && height !== undefined && height !== null) {
    return `${width} × ${height}`
  }
  return '--'
})
const imageFormatText = computed(() => picture.value?.picFormat?.toUpperCase() || '--')
const imageSizeText = computed(() => {
  const size = picture.value?.picSize
  if (size === undefined || size === null || Number.isNaN(size)) {
    return '--'
  }
  const mb = size / (1024 * 1024)
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`
  }
  return `${(size / 1024).toFixed(1)} KB`
})
const flowSteps = computed(() => [
  {
    index: '1',
    title: '上传源图',
    desc: '文件上传或 URL 上传',
    done: Boolean(currentPictureId.value),
    active: !currentPictureId.value,
  },
  {
    index: '2',
    title: '可选处理',
    desc: '裁切旋转和 AI 扩图',
    done: Boolean(currentPictureId.value),
    active: false,
  },
  {
    index: '3',
    title: '填写信息',
    desc: '名称、分类与标签',
    done: metadataReady.value,
    active: Boolean(currentPictureId.value) && !metadataReady.value,
  },
])

const getApiErrorMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const getErrorMessage = (error: unknown) => {
  return getApiErrorMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

const handleSubmit = async () => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    message.warning('请先上传图片')
    return
  }
  try {
    const res = await postPictureEdit({
      id: pictureId,
      spaceId: spaceId.value,
      ...pictureForm,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success(isEditMode.value ? '保存成功' : '创建成功')
      router.push({
        path: `/picture/${pictureId}`,
      })
    } else {
      message.error(`${isEditMode.value ? '保存失败' : '创建失败'}，${res.data.message}`)
    }
  } catch (error) {
    message.error(`${isEditMode.value ? '保存失败' : '创建失败'}，${getErrorMessage(error)}`)
  }
}

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

const getTagCategoryOptions = async () => {
  try {
    const res = await getPictureTagCategory()
    if (res.data.code === 0 && res.data.data) {
      tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => ({
        value: data,
        label: data,
      }))
      categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => ({
        value: data,
        label: data,
      }))
    } else {
      message.error(`获取标签分类列表失败，${res.data?.message ?? '请稍后重试'}`)
    }
  } catch (error) {
    message.error(`获取标签分类列表失败，${getErrorMessage(error)}`)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const resetPictureForm = () => {
  pictureForm.name = undefined
  pictureForm.introduction = undefined
  pictureForm.category = undefined
  pictureForm.tags = []
}

const resetCreateState = () => {
  picture.value = undefined
  uploadType.value = 'file'
  resetPictureForm()
}

const fillPictureForm = (data: API.PictureVO) => {
  pictureForm.name = data.name
  pictureForm.introduction = data.introduction
  pictureForm.category = data.category
  pictureForm.tags = data.tags ?? []
}

const loadPictureByRoute = async () => {
  const id = Number(route.query?.id)
  if (Number.isNaN(id)) {
    resetCreateState()
    return
  }
  try {
    const res = await getPictureGetVo({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      fillPictureForm(data)
    } else {
      resetCreateState()
      message.error(`获取图片信息失败，${res.data.message}`)
    }
  } catch (error) {
    resetCreateState()
    message.error(`获取图片信息失败，${getErrorMessage(error)}`)
  }
}

watch(
  () => route.query?.id,
  () => {
    loadPictureByRoute()
  },
  {
    immediate: true,
  },
)

const imageCropperRef = ref<{ openModal: () => void } | null>(null)
const doEditPicture = () => {
  imageCropperRef.value?.openModal()
}
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

const imageOutPaintingRef = ref<{ openModal: () => void } | null>(null)
const doImagePainting = () => {
  imageOutPaintingRef.value?.openModal()
}
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

const space = ref<API.SpaceVO>()
const isNotFoundError = (error: unknown) => {
  const maybeResponse = (error as { response?: { status?: number; data?: { code?: number } } })?.response
  return maybeResponse?.status === 404 || maybeResponse?.data?.code === 40400
}

const fetchSpace = async () => {
  if (!spaceId.value) {
    space.value = undefined
    return
  }
  try {
    const res = await getSpaceGetVo({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
      return
    }
    if (res.data.code === 404 || res.data.code === 40400) {
      message.error(res.data.message ?? '空间不存在')
      space.value = undefined
      return
    }
    space.value = undefined
  } catch (error) {
    message.error(isNotFoundError(error) ? getApiErrorMessage(error) ?? '空间不存在' : '获取空间信息失败')
    space.value = undefined
  }
}

watch(spaceId, fetchSpace, {
  immediate: true,
})
</script>

<style scoped>
#addPicturePage {
  max-width: 1180px;
  margin: 0 auto;
}

.workbench-toolbar {
  background:
    radial-gradient(126% 110% at 0% 0%, rgb(209 223 240 / 28%) 0%, transparent 57%),
    linear-gradient(180deg, #fcfeff 0%, #f0f6fd 100%);
}

.toolbar-main-copy {
  min-width: 0;
}

.toolbar-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #60788f;
}

.step-rail {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.step-card {
  border-radius: 11px;
  border: 1px solid #d3e0ee;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 8px 10px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.step-card.is-done {
  border-color: #a8bfd8;
  background: linear-gradient(180deg, #f6fbff 0%, #e7f1fb 100%);
}

.step-card.is-active {
  border-color: #95b0cc;
  box-shadow: 0 0 0 2px rgb(53 82 115 / 12%);
}

.step-index {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid #bdd0e4;
  background: #e8f1fb;
  color: #31506f;
  font-size: 12px;
  font-weight: 600;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
}

.step-copy {
  min-width: 0;
}

.step-title {
  margin: 0;
  font-size: 12px;
  color: #2a4767;
  font-weight: 600;
}

.step-desc {
  margin: 2px 0 0;
  font-size: 11px;
  color: #667f98;
  line-height: 1.45;
}

.step-status {
  font-size: 11px;
  color: #5f7790;
  white-space: nowrap;
}

.picture-workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(270px, 320px);
  gap: 12px;
  align-items: start;
}

.picture-workbench-main {
  min-width: 0;
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
  color: #243f5d;
}

.panel-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #61788f;
}

.source-panel {
  background:
    radial-gradient(124% 128% at 100% 0%, rgb(199 217 237 / 15%) 0%, transparent 58%),
    linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
}

.source-segment {
  max-width: 230px;
}

.source-stage {
  border-radius: 12px;
  border: 1px solid #d5e2ef;
  background: linear-gradient(180deg, #f9fcff 0%, #eef4fb 100%);
  padding: 10px;
}

.process-panel {
  background: linear-gradient(180deg, #f8fbff 0%, #edf4fc 100%);
}

.process-kpi-row {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.process-kpi {
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid #ccdceb;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 4px 10px;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.process-kpi strong {
  font-size: 13px;
  color: #294664;
}

.process-kpi span {
  font-size: 11px;
  color: #60768e;
}

.process-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.metadata-panel {
  background:
    radial-gradient(128% 120% at 100% 0%, rgb(203 220 239 / 14%) 0%, transparent 56%),
    linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
}

.meta-form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 8px;
}

.meta-col-6 {
  grid-column: span 6;
}

.meta-col-12 {
  grid-column: span 12;
}

.form-hint {
  margin: -2px 0 12px;
  font-size: 12px;
  color: #627a93;
}

.submit-row {
  margin-bottom: 0;
}

.waiting-panel {
  display: grid;
  gap: 6px;
  background: linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%);
}

.waiting-title {
  margin: 0;
  font-size: 16px;
  color: #27415e;
}

.waiting-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #607890;
}

.picture-side-column {
  display: grid;
  gap: 12px;
  position: sticky;
  top: 12px;
}

.preview-panel {
  display: grid;
  gap: 10px;
}

.preview-frame {
  border-radius: 12px;
  border: 1px solid #d3e0ed;
  background: linear-gradient(180deg, #f8fbff 0%, #edf4fb 100%);
  min-height: 220px;
  overflow: hidden;
  display: grid;
}

.preview-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.preview-empty {
  min-height: 220px;
  display: grid;
  place-items: center;
  font-size: 13px;
  color: #627992;
}

.preview-name {
  margin: 0;
  color: #233d58;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-all;
}

.preview-meta-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-chip {
  min-height: 28px;
  border-radius: 999px;
  border: 1px solid #ccdceb;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 4px 9px;
  font-size: 11px;
  color: #58708a;
  display: inline-flex;
  align-items: center;
}

.flow-panel {
  display: grid;
  gap: 10px;
}

.flow-title {
  margin: 0;
  font-size: 15px;
  color: #253f5b;
}

.flow-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.flow-item {
  border-radius: 10px;
  border: 1px solid #d5e2ef;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4c647d;
}

.flow-index {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid #bdd0e4;
  background: #e8f1fb;
  color: #31506f;
  font-size: 12px;
  font-weight: 600;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
}

.flow-text {
  font-size: 13px;
  line-height: 1.45;
}

.flow-item.is-done {
  border-color: #a9c0d9;
  background: linear-gradient(180deg, #f5faff 0%, #e8f1fb 100%);
  color: #2a4767;
}

.flow-item.is-done .flow-index {
  border-color: #90abc8;
  background: #355273;
  color: #f4f8fd;
}

@media (max-width: 992px) {
  .step-rail {
    grid-template-columns: 1fr;
  }

  .picture-workbench-grid {
    grid-template-columns: 1fr;
  }

  .picture-side-column {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  #addPicturePage {
    max-width: 100%;
  }

  .source-segment {
    max-width: 100%;
    width: 100%;
  }

  .meta-form-grid {
    grid-template-columns: 1fr;
  }

  .meta-col-6,
  .meta-col-12 {
    grid-column: 1 / -1;
  }

  .picture-side-column {
    grid-template-columns: 1fr;
  }

  .preview-frame,
  .preview-image,
  .preview-empty {
    min-height: 180px;
    height: 180px;
  }
}
</style>

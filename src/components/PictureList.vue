<template>
  <div
    :class="[
      'picture-list',
      `picture-list--${props.viewMode}`,
      {
        'picture-list--sparse': isSparseResult,
        'picture-list--single': isSingleResult,
        'picture-list--duo': isDualResult,
        'picture-list--spotlight': props.spotlight && (isSingleResult || isDualResult),
      },
    ]"
  >
    <a-list
      :grid="listGrid"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item class="list-item-reset">
          <a-card
            class="picture-card"
            hoverable
            role="button"
            tabindex="0"
            :aria-label="`查看图片 ${picture.name ?? ''}`"
            @click="doClickPicture(picture)"
            @keydown.enter.prevent="doClickPicture(picture)"
            @keydown.space.prevent="doClickPicture(picture)"
          >
            <template #cover>
              <div class="picture-cover">
                <img
                  :alt="picture.name"
                  :src="resolveImageUrl(picture.thumbnailUrl ?? picture.url)"
                  class="image-fixed-180"
                  :class="{ 'image-fixed-180--compact': props.viewMode === 'compact' }"
                />
                <div class="cover-meta-top">
                  <span class="cover-chip">{{ getPictureCategory(picture) }}</span>
                  <span class="cover-chip cover-chip--soft">{{ getPictureRatioText(picture) }}</span>
                </div>
                <div class="cover-meta-bottom">
                  <span class="cover-chip cover-chip--dark">{{ getPictureSizeText(picture) }}</span>
                  <span class="cover-chip cover-chip--dark">{{ getPictureFormatText(picture) }}</span>
                </div>
                <span class="cover-sheen" aria-hidden="true" />
              </div>
            </template>
            <a-card-meta>
              <template #title>
                <span class="picture-title">{{ picture.name ?? '未命名图片' }}</span>
              </template>
              <template #description>
                <p class="picture-meta">
                  <span class="picture-meta-author">{{ getPictureAuthor(picture) }}</span>
                  <span class="picture-meta-dot" aria-hidden="true">·</span>
                  <span>{{ formatPictureTime(picture) }}</span>
                </p>
                <a-flex class="picture-tags" wrap="wrap" gap="small">
                  <a-tag v-for="tag in getDisplayTags(picture)" :key="tag" class="picture-tag">
                    {{ tag }}
                  </a-tag>
                  <a-tag v-if="getMoreTagCount(picture) > 0" class="picture-tag">
                    +{{ getMoreTagCount(picture) }}
                  </a-tag>
                  <span v-if="getDisplayTags(picture).length === 0" class="picture-tag-empty">未设置标签</span>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>
              <button
                type="button"
                class="action-btn"
                aria-label="分享图片"
                @click="(e) => doShare(picture, e)"
              >
                <ShareAltOutlined />
              </button>
              <button
                type="button"
                class="action-btn"
                aria-label="以图搜图"
                @click="(e) => doSearch(picture, e)"
              >
                <SearchOutlined />
              </button>
              <button
                v-if="canEdit"
                type="button"
                class="action-btn"
                aria-label="编辑图片"
                @click="(e) => doEdit(picture, e)"
              >
                <EditOutlined />
              </button>
              <button
                v-if="canDelete"
                type="button"
                class="action-btn"
                aria-label="删除图片"
                @click="(e) => doDelete(picture, e)"
              >
                <DeleteOutlined />
              </button>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { postPictureOpenApiDelete } from '@/api/picture'
import { message } from 'ant-design-vue'
import ShareModal from '@/components/ShareModal.vue'
import { computed, ref } from 'vue'
import { formatSize, resolveImageUrl } from '@/utils'

type ViewMode = 'comfortable' | 'compact'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onReload?: () => void
  viewMode?: ViewMode
  spotlight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
  viewMode: 'comfortable',
  spotlight: false,
})

const isSparseResult = computed(
  () => !props.loading && props.dataList.length > 0 && props.dataList.length <= 3,
)
const isSingleResult = computed(
  () => !props.loading && props.dataList.length === 1,
)
const isDualResult = computed(
  () => !props.loading && props.dataList.length === 2,
)

const listGrid = computed(() => {
  if (props.spotlight && isSparseResult.value) {
    if (isSingleResult.value) {
      return {
        gutter: 18,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        xxl: 1,
      }
    }
    return {
      gutter: 18,
      xs: 1,
      sm: 1,
      md: 2,
      lg: 2,
      xl: 2,
      xxl: 2,
    }
  }

  if (isSparseResult.value) {
    const count = props.dataList.length
    if (count <= 1) {
      return {
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        xxl: 1,
      }
    }
    if (count === 2) {
      return {
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        xxl: 2,
      }
    }
    return {
      gutter: 16,
      xs: 1,
      sm: 2,
      md: 2,
      lg: 3,
      xl: 3,
      xxl: 3,
    }
  }

  if (props.viewMode === 'compact') {
    return {
      gutter: 14,
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      xxl: 5,
    }
  }
  return {
    gutter: 16,
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 4,
  }
})

const getPictureAuthor = (picture: API.PictureVO) => {
  const userName = picture.user?.userName?.trim()
  if (userName) {
    return userName
  }
  return 'Sion Picture'
}

const formatPictureTime = (picture: API.PictureVO) => {
  const rawTime = picture.editTime ?? picture.createTime
  if (!rawTime) {
    return '最近更新'
  }
  const date = new Date(rawTime)
  if (Number.isNaN(date.getTime())) {
    return '最近更新'
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}
const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim())
      .filter(Boolean)
  }
  if (typeof value !== 'string') {
    return []
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed
        .map((tag) => String(tag).trim())
        .filter(Boolean)
    }
  } catch {
    // 非 JSON 字符串时使用分隔规则兜底
  }
  return trimmed
    .split(/[,\uFF0C\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}
const getDisplayTags = (picture: API.PictureVO) => normalizeTags(picture.tags).slice(0, 3)
const getMoreTagCount = (picture: API.PictureVO) => Math.max(0, normalizeTags(picture.tags).length - 3)
const getPictureCategory = (picture: API.PictureVO) => {
  return picture.category?.trim() || '默认分类'
}
const getPictureRatioText = (picture: API.PictureVO) => {
  const ratio = picture.picScale
  if (ratio && String(ratio).trim()) {
    return String(ratio)
  }
  const width = Number(picture.picWidth)
  const height = Number(picture.picHeight)
  if (width > 0 && height > 0) {
    return `${width}:${height}`
  }
  return '比例--'
}
const getPictureSizeText = (picture: API.PictureVO) => {
  const size = Number(picture.picSize)
  if (!Number.isFinite(size) || size <= 0) {
    return '大小--'
  }
  return formatSize(size)
}
const getPictureFormatText = (picture: API.PictureVO) => {
  return picture.picFormat?.toString().trim().toUpperCase() || 'IMG'
}

const router = useRouter()
// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 搜索
const doSearch = (picture: API.PictureVO, e: MouseEvent) => {
  // 阻止冒泡
  e.stopPropagation()
  // 打开新的页面
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// 编辑
const doEdit = (picture: API.PictureVO, e: MouseEvent) => {
  // 阻止冒泡
  e.stopPropagation()
  // 跳转时一定要携带 spaceId
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除数据
const doDelete = async (picture: API.PictureVO, e: MouseEvent) => {
  // 阻止冒泡
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await postPictureOpenApiDelete({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}

// ----- 分享操作 ----
const shareModalRef = ref<{ openModal: () => void } | null>(null)
// 分享链接
const shareLink = ref<string>()
// 分享
const doShare = (picture: API.PictureVO, e: MouseEvent) => {
  // 阻止冒泡
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  shareModalRef.value?.openModal()
}
</script>

<style scoped>
.picture-list .list-item-reset {
  padding: 0;
}

.picture-list :deep(.ant-list-item) {
  animation: picture-card-enter 0.36s ease-out both;
}

.picture-list :deep(.ant-list-item:nth-child(1)) {
  animation-delay: 0.02s;
}

.picture-list :deep(.ant-list-item:nth-child(2)) {
  animation-delay: 0.04s;
}

.picture-list :deep(.ant-list-item:nth-child(3)) {
  animation-delay: 0.06s;
}

.picture-list :deep(.ant-list-item:nth-child(4)) {
  animation-delay: 0.08s;
}

.picture-list :deep(.ant-list-item:nth-child(5)) {
  animation-delay: 0.1s;
}

.picture-list :deep(.ant-list-item:nth-child(6)) {
  animation-delay: 0.12s;
}

.picture-cover {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #dfebf6;
  background: linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%);
  box-shadow: inset 0 10px 24px rgb(33 52 74 / 8%);
}

.image-fixed-180 {
  width: 100%;
  height: 172px;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.24s ease;
}

.image-fixed-180--compact {
  height: 142px;
}

.cover-sheen {
  position: absolute;
  inset: auto -28% -58% -28%;
  height: 72%;
  background: radial-gradient(
    ellipse at center,
    rgb(255 255 255 / 56%) 0%,
    rgb(255 255 255 / 0%) 62%
  );
  opacity: 0.72;
  transition: transform 0.24s ease, opacity 0.24s ease;
  pointer-events: none;
}

.cover-meta-top,
.cover-meta-bottom {
  position: absolute;
  left: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  z-index: 2;
  pointer-events: none;
}

.cover-meta-top {
  top: 8px;
}

.cover-meta-bottom {
  bottom: 8px;
}

.cover-chip {
  min-height: 22px;
  max-width: 58%;
  border-radius: 999px;
  border: 1px solid rgb(208 223 239 / 92%);
  background: rgb(255 255 255 / 84%);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  color: #274866;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.cover-chip--soft {
  border-color: rgb(189 208 228 / 90%);
  background: rgb(237 245 252 / 84%);
  color: #456583;
}

.cover-chip--dark {
  border-color: rgb(53 82 115 / 35%);
  background: rgb(36 57 80 / 72%);
  color: #edf3fb;
}

.picture-list--compact :deep(.ant-card-body) {
  padding: 12px;
}

.picture-list--compact .picture-title {
  font-size: 14px;
}

.picture-list--compact .picture-tags {
  min-height: 24px;
}

.picture-list--sparse :deep(.ant-row) {
  justify-content: center;
  row-gap: 12px;
}

.picture-list--sparse :deep(.ant-col) {
  max-width: 100%;
  flex: 0 1 auto;
}

.picture-list--single :deep(.ant-col) {
  flex: 0 1 620px;
  max-width: min(100%, 620px);
}

.picture-list--spotlight.picture-list--single :deep(.ant-col) {
  flex: 0 1 760px;
  max-width: min(100%, 760px);
}

.picture-list--duo :deep(.ant-col) {
  flex: 0 1 440px;
  max-width: min(100%, 440px);
}

.picture-list--spotlight.picture-list--duo :deep(.ant-col) {
  flex: 0 1 490px;
  max-width: min(100%, 490px);
}

.picture-list--single :deep(.ant-list-item),
.picture-list--duo :deep(.ant-list-item) {
  margin-inline: auto;
}

.picture-list--spotlight :deep(.ant-list-item) {
  padding: 2px 0;
}

.picture-list--spotlight .picture-card {
  border-color: #bfd1e4;
  border-radius: 20px;
  background:
    radial-gradient(120% 110% at 50% -16%, rgb(182 206 230 / 28%) 0%, transparent 52%),
    linear-gradient(180deg, #ffffff 0%, #f5faff 64%, #f1f7fd 100%);
  box-shadow: 0 18px 34px rgb(32 51 73 / 16%);
}

.picture-list--spotlight .picture-card:hover {
  border-color: #9eb8d2;
  box-shadow: 0 22px 42px rgb(32 51 73 / 20%);
}

.picture-list--spotlight.picture-list--single .image-fixed-180 {
  height: clamp(220px, 30vw, 420px);
}

.picture-list--spotlight.picture-list--duo .image-fixed-180 {
  height: clamp(188px, 22vw, 296px);
}

.picture-list--spotlight :deep(.ant-card-body) {
  padding: 14px 16px 16px;
}

.picture-list--spotlight .picture-title {
  font-size: 16px;
}

.picture-list--spotlight .picture-meta {
  font-size: 13px;
}

.picture-list--spotlight .picture-tags {
  min-height: 30px;
}

.picture-list--comfortable:not(.picture-list--sparse) :deep(.ant-list-item:first-child .picture-card) {
  border-color: #bfd2e5;
  background:
    radial-gradient(120% 100% at 50% -12%, rgb(176 201 225 / 30%) 0%, transparent 58%),
    linear-gradient(180deg, #ffffff 0%, #f3f8fe 62%, #eef4fb 100%);
  box-shadow: 0 20px 36px rgb(33 52 74 / 16%);
}

.picture-list--comfortable:not(.picture-list--sparse) :deep(.ant-list-item:first-child .image-fixed-180) {
  height: 196px;
}

.picture-card {
  position: relative;
  isolation: isolate;
  outline: none;
  border: 1px solid #d4e1ee;
  background: linear-gradient(180deg, #ffffff 0%, #f6faff 60%, #f2f7fd 100%);
  overflow: hidden;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.picture-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid rgb(255 255 255 / 58%);
  pointer-events: none;
  z-index: 2;
}

.picture-card::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 3px;
  background: linear-gradient(90deg, rgb(120 150 184 / 0%) 0%, rgb(120 150 184 / 62%) 50%, rgb(120 150 184 / 0%) 100%);
  opacity: 0;
  transition: opacity 0.24s ease;
  pointer-events: none;
  z-index: 2;
}

.picture-card:hover {
  border-color: #afc3d9;
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgb(32 51 73 / 14%);
}

.picture-card:hover::after {
  opacity: 1;
}

.picture-card:hover .image-fixed-180 {
  transform: scale(1.02);
}

.picture-card:hover .cover-sheen {
  transform: translateY(-8px);
  opacity: 0.96;
}

.picture-card:focus-visible {
  box-shadow:
    0 0 0 3px rgb(93 124 157 / 22%),
    0 10px 22px rgb(31 45 61 / 10%);
}

.picture-title {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picture-meta {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #627991;
  font-size: 12px;
  line-height: 1.4;
}

.picture-meta-author {
  max-width: 44%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #435b74;
  font-weight: 500;
}

.picture-meta-dot {
  color: #8da2b8;
}

.picture-tags {
  min-height: 28px;
}

.picture-tag {
  margin-inline-end: 0;
  margin-bottom: 0;
}

.picture-tag-empty {
  font-size: 12px;
  color: #7288a0;
}

.picture-list :deep(.ant-card-meta-description) {
  display: grid;
  gap: 8px;
}

.picture-list :deep(.ant-card-actions) {
  border-top-color: #dde7f2;
  background: linear-gradient(180deg, rgb(251 253 255 / 92%) 0%, rgb(239 246 254 / 84%) 100%);
}

.picture-list :deep(.ant-card-actions > li) {
  margin: 6px 0;
  width: auto;
}

.picture-list :deep(.ant-card-body) {
  padding: 12px 13px 14px;
}

@keyframes picture-card-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-btn {
  min-height: 42px;
  min-width: 42px;
  border: 0;
  padding: 0;
  display: inline-grid;
  place-items: center;
  background: transparent;
  cursor: pointer;
  border-radius: 10px;
  color: #5f7288;
  transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.action-btn:hover {
  color: #27486a;
  background: #e8eff8;
  transform: translateY(-1px);
}

.action-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

.action-btn :deep(.anticon) {
  font-size: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .picture-card,
  .picture-list :deep(.ant-list-item),
  .image-fixed-180,
  .cover-sheen,
  .action-btn {
    transition: none !important;
  }

  .picture-card:hover .image-fixed-180,
  .picture-card:hover .cover-sheen {
    transform: none;
  }
}

@media (max-width: 768px) {
  .cover-meta-top,
  .cover-meta-bottom {
    left: 6px;
    right: 6px;
  }

  .cover-chip {
    max-width: 60%;
    padding-inline: 7px;
    font-size: 10px;
  }

  .picture-list--comfortable:not(.picture-list--sparse) :deep(.ant-list-item:first-child .image-fixed-180) {
    height: 176px;
  }

  .picture-list--spotlight.picture-list--single .image-fixed-180 {
    height: clamp(186px, 52vw, 244px);
  }

  .picture-list--spotlight.picture-list--duo .image-fixed-180 {
    height: clamp(164px, 42vw, 216px);
  }

  .picture-list--spotlight :deep(.ant-card-body) {
    padding: 12px 13px 14px;
  }
}
</style>

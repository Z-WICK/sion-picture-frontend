<template>
  <div :class="['picture-list', `picture-list--${props.viewMode}`]">
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
              <img
                :alt="picture.name"
                :src="resolveImageUrl(picture.thumbnailUrl ?? picture.url)"
                class="image-fixed-180"
                :class="{ 'image-fixed-180--compact': props.viewMode === 'compact' }"
              />
            </template>
            <a-card-meta>
              <template #title>
                <span class="picture-title">{{ picture.name ?? '未命名图片' }}</span>
              </template>
              <template #description>
                <a-flex class="picture-tags" wrap="wrap" gap="small">
                  <a-tag class="picture-tag">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag" class="picture-tag">
                    {{ tag }}
                  </a-tag>
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
import { resolveImageUrl } from '@/utils'

type ViewMode = 'comfortable' | 'compact'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onReload?: () => void
  viewMode?: ViewMode
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
  viewMode: 'comfortable',
})

const listGrid = computed(() => {
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

.image-fixed-180 {
  width: 100%;
  height: 180px;
  object-fit: cover;
  object-position: center;
  display: block;
}

.image-fixed-180--compact {
  height: 150px;
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

.picture-card {
  outline: none;
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

.picture-tags {
  min-height: 28px;
}

.picture-tag {
  margin-inline-end: 0;
}

.picture-list :deep(.ant-card-actions) {
  border-top-color: #dde7f2;
}

.picture-list :deep(.ant-card-actions > li) {
  margin: 8px 0;
  width: auto;
}

.action-btn {
  min-height: 40px;
  min-width: 40px;
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
</style>

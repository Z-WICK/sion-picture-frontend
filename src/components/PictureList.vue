<template>
  <div class="picture-list">
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item class="list-item-reset">
          <!-- 单张图片 -->
          <a-card class="picture-card" hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="resolveImageUrl(picture.thumbnailUrl ?? picture.url)"
                class="image-fixed-180"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex wrap="wrap" gap="small">
                  <a-tag>
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>
              <ShareAltOutlined @click="(e) => doShare(picture, e)" />
              <SearchOutlined @click="(e) => doSearch(picture, e)" />
              <EditOutlined v-if="canEdit" @click="(e) => doEdit(picture, e)" />
              <DeleteOutlined v-if="canDelete" @click="(e) => doDelete(picture, e)" />
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
import { ref } from 'vue'
import { resolveImageUrl } from '@/utils'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onReload?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
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

.picture-list :deep(.ant-card-actions) {
  border-top-color: #dde7f2;
}

.picture-list :deep(.ant-card-actions > li) {
  margin: 8px 0;
}

.picture-list :deep(.ant-card-actions .anticon) {
  min-height: 40px;
  min-width: 40px;
  line-height: 40px;
  border-radius: 10px;
  color: #5f7288;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.picture-list :deep(.ant-card-actions .anticon:hover) {
  color: #27486a;
  background: #e8eff8;
}
</style>

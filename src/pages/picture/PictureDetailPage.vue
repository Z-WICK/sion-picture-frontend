<template>
  <div id="pictureDetailPage" class="page-shell">
    <section class="page-toolbar detail-toolbar">
      <div class="page-toolbar-main">
        <div class="detail-title-block">
          <p class="detail-kicker">Picture Detail</p>
          <h2 class="page-title">{{ picture.name ?? '未命名图片' }}</h2>
          <p class="page-subtitle">由 {{ authorName }} 上传 · {{ categoryLabel }} · {{ displayTime }}</p>
        </div>

        <a-space size="small" class="page-toolbar-actions detail-toolbar-actions">
          <a-button type="primary" :disabled="actionUnavailable" @click="doDownload">
            <template #icon>
              <DownloadOutlined />
            </template>
            免费下载
          </a-button>
          <a-button type="primary" ghost :disabled="actionUnavailable" @click="doShare">
            <template #icon>
              <ShareAltOutlined />
            </template>
            分享
          </a-button>
          <a-button v-if="canEdit" type="default" @click="doEdit">
            <template #icon>
              <EditOutlined />
            </template>
            编辑
          </a-button>
          <a-popconfirm
            v-if="canEdit"
            title="确认删除这张图片吗？"
            ok-text="确认"
            cancel-text="取消"
            @confirm="doDelete"
          >
            <a-button danger :loading="deleting" :disabled="actionUnavailable || deleting">
              <template #icon>
                <DeleteOutlined />
              </template>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </div>

      <div class="detail-tag-strip" aria-label="图片分类与标签">
        <a-tag class="detail-tag detail-tag--strong">分类 · {{ categoryLabel }}</a-tag>
        <a-tag v-for="tag in visiblePictureTags" :key="`top-${tag}`" class="detail-tag">
          {{ tag }}
        </a-tag>
        <a-tag v-if="hiddenTagCount > 0" class="detail-tag">+{{ hiddenTagCount }} 标签</a-tag>
      </div>

      <div class="mini-kpi-row" aria-label="图片关键指标">
        <span class="mini-kpi">
          <strong>{{ picture.picFormat ?? '-' }}</strong>
          <span>格式</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ dimensionText }}</strong>
          <span>尺寸</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ formatSize(picture.picSize) }}</strong>
          <span>文件大小</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ picture.picScale ?? '-' }}</strong>
          <span>宽高比</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ permissionLabel }}</strong>
          <span>权限</span>
        </span>
      </div>
    </section>

    <section class="detail-layout">
      <section class="panel-card detail-preview-card">
        <header class="detail-section-head">
          <div>
            <h3 class="detail-section-title">图片预览</h3>
            <p class="detail-section-caption">保持原图比例，支持放大查看细节。</p>
          </div>
          <span class="detail-section-meta">ID {{ picture.id ?? '--' }}</span>
        </header>
        <div class="preview-stage">
          <a-image :src="pictureUrl" class="image-contained-600 detail-image" />
        </div>
        <footer class="preview-footer">
          <span>最近更新 {{ displayTime }}</span>
          <span>主色 {{ picture.picColor ?? '-' }}</span>
        </footer>
      </section>

      <aside class="detail-side-column">
        <section class="panel-card detail-info-card">
          <header class="detail-section-head">
            <h3 class="detail-section-title">图片信息</h3>
          </header>
          <a-descriptions :column="1" size="small" class="detail-descriptions">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar" />
                <span>{{ authorName }}</span>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ categoryLabel }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-space size="small" wrap>
                <a-tag v-for="tag in pictureTags" :key="tag">
                  {{ tag }}
                </a-tag>
                <span v-if="pictureTags.length === 0">-</span>
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
        </section>

        <section class="panel-card detail-meta-card">
          <header class="detail-section-head">
            <h3 class="detail-section-title">文件属性</h3>
          </header>
          <div class="meta-grid">
            <article class="meta-item">
              <span class="meta-label">宽度</span>
              <strong class="meta-value">{{ picture.picWidth ?? '-' }}</strong>
            </article>
            <article class="meta-item">
              <span class="meta-label">高度</span>
              <strong class="meta-value">{{ picture.picHeight ?? '-' }}</strong>
            </article>
            <article class="meta-item">
              <span class="meta-label">格式</span>
              <strong class="meta-value">{{ picture.picFormat ?? '-' }}</strong>
            </article>
            <article class="meta-item">
              <span class="meta-label">文件大小</span>
              <strong class="meta-value">{{ formatSize(picture.picSize) }}</strong>
            </article>
            <article class="meta-item meta-item--color">
              <span class="meta-label">主色调</span>
              <div class="meta-color">
                <strong class="meta-value">{{ picture.picColor ?? '-' }}</strong>
                <div
                  v-if="picture.picColor"
                  class="color-swatch"
                  :style="{ backgroundColor: toHexColor(picture.picColor) }"
                />
              </div>
            </article>
          </div>
        </section>
      </aside>
    </section>

    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getPictureGetVo, postPictureOpenApiDelete } from '@/api/picture'
import { message } from 'ant-design-vue'
import { DeleteOutlined, DownloadOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { useRouter } from 'vue-router'
import { downloadImage, formatSize, getPictureFileUrl, resolveImageUrl, toHexColor } from '@/utils'
import ShareModal from '@/components/ShareModal.vue'

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const pictureId = computed(() => {
  const id = Number(props.id)
  return Number.isNaN(id) ? undefined : id
})
const picture = ref<API.PictureVO>({})
const pictureUrl = computed(() => getPictureFileUrl(picture.value.id) ?? resolveImageUrl(picture.value.url))
const authorName = computed(() => picture.value.user?.userName?.trim() || '未知作者')
const pictureTags = computed(() => picture.value.tags ?? [])
const visiblePictureTags = computed(() => pictureTags.value.slice(0, 6))
const hiddenTagCount = computed(() => Math.max(0, pictureTags.value.length - visiblePictureTags.value.length))
const categoryLabel = computed(() => picture.value.category?.trim() || '默认分类')
const dimensionText = computed(() => {
  const width = picture.value.picWidth
  const height = picture.value.picHeight
  if (width !== undefined && width !== null && height !== undefined && height !== null) {
    return `${width} × ${height}`
  }
  return '-'
})
const displayTime = computed(() => {
  const rawTime = picture.value.editTime ?? picture.value.createTime
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
})

const loginUserStore = useLoginUserStore()
const getApiErrorMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const getErrorMessage = (error: unknown) => {
  return getApiErrorMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) {
    return false
  }
  const user = picture.value.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
})
const actionUnavailable = computed(() => !picture.value.id)
const permissionLabel = computed(() => (canEdit.value ? '可编辑' : '只读'))
const deleting = ref(false)

const fetchPictureDetail = async () => {
  try {
    if (!pictureId.value) {
      return
    }
    const res = await getPictureGetVo({
      id: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取图片详情失败：' + getErrorMessage(error))
  }
}

onMounted(() => {
  fetchPictureDetail()
})

const router = useRouter()

const doEdit = () => {
  router.push({
    path: '/add_picture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId,
    },
  })
}

const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    message.warning('图片不存在，无法删除')
    return
  }
  if (deleting.value) {
    return
  }
  deleting.value = true
  try {
    const res = await postPictureOpenApiDelete({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      await router.push('/gallery')
    } else {
      message.error('删除失败，' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败，' + getErrorMessage(error))
  } finally {
    deleting.value = false
  }
}

const doDownload = () => {
  if (actionUnavailable.value) {
    message.warning('图片尚未加载完成')
    return
  }
  const downloadUrl = getPictureFileUrl(picture.value.id, true) ?? pictureUrl.value
  void downloadImage(downloadUrl, picture.value.name ?? undefined)
}

const shareModalRef = ref<{ openModal: () => void } | null>(null)
const shareLink = ref<string>()
const doShare = () => {
  if (actionUnavailable.value) {
    message.warning('图片尚未加载完成')
    return
  }
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value.id}`
  shareModalRef.value?.openModal()
}
</script>

<style scoped>
#pictureDetailPage {
  margin-bottom: 16px;
}

.detail-toolbar {
  display: grid;
  gap: 10px;
  background:
    radial-gradient(126% 112% at 0% 0%, rgb(207 222 240 / 24%) 0%, transparent 58%),
    linear-gradient(180deg, #fcfeff 0%, #f1f7fe 100%);
}

.detail-title-block {
  min-width: 0;
}

.detail-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #607790;
}

.detail-toolbar-actions {
  justify-content: flex-end;
}

.detail-tag-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.detail-tag {
  margin-right: 0;
}

.detail-tag--strong {
  border-color: #b4c9df;
  background: #e6eff9;
  color: #2f4b68;
}

.detail-layout {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  align-items: start;
}

.detail-preview-card {
  display: grid;
  gap: 10px;
  background:
    radial-gradient(124% 130% at 100% 0%, rgb(202 220 240 / 16%) 0%, transparent 58%),
    linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
}

.detail-side-column {
  display: grid;
  gap: 12px;
  position: sticky;
  top: 12px;
}

.detail-info-card,
.detail-meta-card {
  display: grid;
  gap: 10px;
}

.detail-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-section-title {
  margin: 0;
  font-size: 17px;
  color: #233c56;
}

.detail-section-caption {
  margin: 2px 0 0;
  font-size: 12px;
  color: #607890;
}

.detail-section-meta {
  font-size: 12px;
  color: #627790;
}

.preview-stage {
  border-radius: 12px;
  border: 1px solid #d8e4f1;
  background:
    radial-gradient(90% 140% at 50% 0%, rgb(203 221 239 / 18%) 0%, transparent 56%),
    linear-gradient(180deg, #f9fcff 0%, #edf4fb 100%);
  padding: 12px;
  display: grid;
  place-items: center;
}

.detail-image {
  width: 100%;
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #5f768f;
}

.detail-descriptions :deep(.ant-descriptions-item-label) {
  width: 72px;
  color: #4f647d;
}

.meta-grid {
  display: grid;
  gap: 8px;
}

.meta-item {
  border-radius: 10px;
  border: 1px solid #d2dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 8px 10px;
  display: grid;
  gap: 4px;
}

.meta-item--color {
  gap: 6px;
}

.meta-label {
  font-size: 11px;
  color: #647c95;
}

.meta-value {
  font-size: 14px;
  color: #2d4967;
}

.meta-color {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #ccdae8;
}

@media (max-width: 992px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-side-column {
    position: static;
  }

  .preview-stage {
    padding: 10px;
  }

  .detail-toolbar-actions {
    justify-content: flex-start;
  }
}
</style>

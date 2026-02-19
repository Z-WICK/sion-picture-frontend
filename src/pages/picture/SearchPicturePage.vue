<template>
  <div id="searchPicturePage" class="page-shell">
    <div class="page-header">
      <h2 class="page-title">以图搜图</h2>
    </div>

    <section class="panel-card source-panel">
      <h3 class="section-title">原图</h3>
      <a-card hoverable class="w-240">
        <template #cover>
          <img
            :alt="picture.name"
            :src="resolveImageUrl(picture.thumbnailUrl ?? picture.url)"
            class="image-fixed-180"
          />
        </template>
      </a-card>
    </section>

    <section class="panel-card">
      <h3 class="section-title">识图结果</h3>
      <!-- 图片结果列表 -->
      <a-list
        :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
        :data-source="dataList"
        :loading="loading"
      >
        <template #renderItem="{ item: picture }">
          <a-list-item class="list-item-reset">
            <a :href="picture.fromUrl" target="_blank">
              <!-- 单张图片 -->
              <a-card hoverable>
                <template #cover>
                  <img :alt="picture.name" :src="picture.thumbUrl" class="image-fixed-180" />
                </template>
              </a-card>
            </a>
          </a-list-item>
        </template>
      </a-list>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getPictureGetVo,
  postPictureSearchPicture,
} from '@/api/picture'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { resolveImageUrl } from '@/utils'

const route = useRoute()

const pictureId = computed(() => {
  const id = Number(route.query?.pictureId)
  return Number.isNaN(id) ? undefined : id
})
const picture = ref<API.PictureVO>({})

// 获取图片详情
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    message.error('获取图片详情失败：' + errorMessage)
  }
}

onMounted(() => {
  fetchPictureDetail()
})

// 以图搜图结果
const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref<boolean>(true)
// 获取搜图结果
const fetchResultData = async () => {
  loading.value = true
  try {
    if (!pictureId.value) {
      return
    }
    const res = await postPictureSearchPicture({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    message.error('获取数据失败，' + errorMessage)
  }
  loading.value = false
}

// 页面加载时请求一次
onMounted(() => {
  fetchResultData()
})
</script>

<style scoped>
#searchPicturePage {
  margin-bottom: 18px;
}

.source-panel {
  display: grid;
  justify-content: start;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  color: #2b425c;
}

.list-item-reset {
  padding: 0;
}
</style>

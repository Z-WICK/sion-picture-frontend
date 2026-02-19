<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改图片' : '创建图片' }}
    </h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>
    <!-- 选择上传方式 -->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <!-- 图片上传组件 -->
        <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL 上传" force-render>
        <!-- URL 图片上传组件 -->
        <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
    </a-tabs>
    <!-- 图片编辑 -->
    <div v-if="picture" class="edit-bar">
      <a-space size="middle">
        <a-button :icon="h(EditOutlined)" @click="doEditPicture">编辑图片</a-button>
        <a-button type="primary" :icon="h(FullscreenOutlined)" @click="doImagePainting">
          AI 扩图
        </a-button>
      </a-space>
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="resolveImageUrl(picture?.url)"
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
    </div>
    <!-- 图片信息表单 -->
    <a-form
      v-if="picture"
      name="pictureForm"
      layout="vertical"
      :model="pictureForm"
      @finish="handleSubmit"
    >
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  postPictureEdit,
  getPictureGetVo,
  getPictureTagCategory,
} from '@/api/picture'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import { EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'
import { getSpaceGetVo } from '@/api/space'
import { resolveImageUrl } from '@/utils'

const router = useRouter()
const route = useRoute()

const picture = ref<API.PictureVO>()
const pictureForm = reactive<API.PictureEditRequest>({})
const uploadType = ref<'file' | 'url'>('file')
// 空间 id
const spaceId = computed(() => {
  const id = Number(route.query?.spaceId)
  return Number.isNaN(id) ? undefined : id
})

/**
 * 图片上传成功
 * @param newPicture
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async () => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }
  const res = await postPictureEdit({
    id: pictureId,
    spaceId: spaceId.value,
    ...pictureForm,
  })
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

/**
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await getPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error(`获取标签分类列表失败，${res.data?.message ?? '请稍后重试'}`)
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

// 获取老数据
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    message.error(`获取图片信息失败，${errorMessage}`)
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

// ----- 图片编辑器引用 ------
const imageCropperRef = ref<{ openModal: () => void } | null>(null)

// 编辑图片
const doEditPicture = async () => {
  imageCropperRef.value?.openModal()
}

// 编辑成功事件
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// ----- AI 扩图引用 -----
const imageOutPaintingRef = ref<{ openModal: () => void } | null>(null)

// 打开 AI 扩图弹窗
const doImagePainting = async () => {
  imageOutPaintingRef.value?.openModal()
}

// AI 扩图保存事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// 获取空间信息
const space = ref<API.SpaceVO>()
const getApiMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const isNotFoundError = (error: unknown) => {
  const maybeResponse = (error as { response?: { status?: number; data?: { code?: number } } })?.response
  return maybeResponse?.status === 404 || maybeResponse?.data?.code === 40400
}

// 获取空间信息
const fetchSpace = async () => {
  if (!spaceId.value) {
    space.value = undefined
    return
  }
  try {
    // 获取数据
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
    message.error(isNotFoundError(error) ? getApiMessage(error) ?? '空间不存在' : '获取空间信息失败')
    space.value = undefined
  }
}

watch(spaceId, fetchSpace, {
  immediate: true,
})
</script>

<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}

#addPicturePage .edit-bar {
  text-align: center;
  margin: 16px 0;
}
</style>

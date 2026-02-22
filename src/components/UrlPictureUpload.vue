<template>
  <div class="url-picture-upload">
    <div class="url-input-row">
      <a-input
        v-model:value="fileUrl"
        class="url-input"
        placeholder="请输入图片地址"
      />
      <a-button type="primary" class="url-submit" :loading="loading" @click="handleUpload">
        上传
      </a-button>
    </div>
    <div class="img-wrapper">
      <img
        v-if="picture?.url"
        :src="getPictureFileUrl(picture?.id) ?? resolveImageUrl(picture?.url)"
        alt="avatar"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { postPictureUploadUrl } from '@/api/picture'
import { getPictureFileUrl, resolveImageUrl } from '@/utils'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const fileUrl = ref<string>()
const loading = ref<boolean>(false)
const getApiErrorMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const getErrorMessage = (error: unknown) => {
  return getApiErrorMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

/**
 * 上传图片
 * @param file
 */
const handleUpload = async () => {
  const normalizedFileUrl = fileUrl.value?.trim()
  if (!normalizedFileUrl) {
    message.warning('请输入图片地址')
    return
  }

  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: normalizedFileUrl }
    params.spaceId = props.spaceId
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await postPictureUploadUrl(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('图片上传失败，' + getErrorMessage(error))
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.url-picture-upload {
  margin-bottom: 16px;
  display: grid;
  gap: 12px;
}

.url-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.url-input {
  min-width: 0;
}

.url-submit {
  min-width: 88px;
}

.url-picture-upload img {
  max-width: 100%;
  max-height: 480px;
  border-radius: 12px;
  border: 1px solid #d6e1ee;
}

.url-picture-upload .img-wrapper {
  text-align: center;
}

@media (max-width: 576px) {
  .url-input-row {
    grid-template-columns: 1fr;
  }

  .url-submit {
    width: 100%;
  }
}
</style>

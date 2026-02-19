<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改' : '创建' }} {{ SPACE_TYPE_MAP[spaceType] }}
    </h2>
    <!-- 空间信息表单 -->
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
          style="min-width: 180px"
          placeholder="请选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" style="width: 100%">
          提交
        </a-button>
      </a-form-item>
    </a-form>
    <!-- 空间级别介绍 -->
    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="" target="_blank">JohnSion</a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList" :key="spaceLevel.id">
        {{ spaceLevel.text }}：大小 {{ formatSize(spaceLevel.maxSize) }}，数量
        {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
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
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space.ts'
import { formatSize } from '@/utils'

const space = ref<API.SpaceVO>()
type SpaceFormState = API.SpaceAddRequest & API.SpaceUpdateRequest
const spaceForm = reactive<SpaceFormState>({})
const loading = ref(false)

const route = useRoute()
// 空间类别，默认为私有空间
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  } else {
    return SPACE_TYPE_ENUM.PRIVATE
  }
})

const spaceLevelList = ref<API.SpaceLevel[]>([])
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

// 获取老数据
const getOldSpace = async () => {
  // 获取到 id
  const id = Number(route.query?.id)
  if (!Number.isNaN(id)) {
    const res = await getSpaceGetVo({
      id,
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
  max-width: 720px;
  margin: 0 auto;
}
</style>

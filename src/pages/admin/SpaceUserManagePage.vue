<template>
  <div id="spaceManagePage">
    <a-result
      v-if="spaceNotFound"
      status="404"
      title="空间不存在"
      sub-title="该空间可能已被删除或不存在，无法继续管理成员。"
    />
    <template v-else>
      <a-flex justify="space-between">
        <h2>空间成员管理</h2>
        <a-space>
          <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
          <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="_blank"
            >分析公共图库
          </a-button>
          <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="_blank"
            >分析全部空间
          </a-button>
        </a-space>
      </a-flex>
      <div style="margin-bottom: 16px" />
      <!-- 添加成员表单 -->
      <a-form layout="inline" :model="formData" @finish="handleSubmit">
        <a-form-item label="用户 id" name="userId">
          <a-input v-model:value.number="formData.userId" placeholder="请输入用户 id" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">添加用户</a-button>
        </a-form-item>
      </a-form>
      <div style="margin-bottom: 16px" />
      <!-- 表格 -->
      <a-table :columns="columns" :data-source="dataList">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userInfo'">
            <a-space>
              <a-avatar :src="record.user?.userAvatar" />
              {{ record.user?.userName }}
            </a-space>
          </template>
          <template v-if="column.dataIndex === 'spaceRole'">
            <a-select
              v-model:value="record.spaceRole"
              :options="SPACE_ROLE_OPTIONS"
              @change="handleRoleChange($event, record)"
            />
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { SPACE_ROLE_OPTIONS } from '@/constants/space.ts'
import {
  postSpaceUserAdd,
  postSpaceUserOpenApiDelete,
  postSpaceUserEdit,
  postSpaceUserList,
} from '@/api/spaceUser'
import dayjs from 'dayjs'
interface Props {
  id: string
}

const props = defineProps<Props>()

const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 定义数据
const dataList = ref<API.SpaceUserVO[]>([])
const spaceNotFound = ref(false)

const getApiMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const isNotFoundError = (error: unknown) => {
  const maybeResponse = (error as { response?: { status?: number; data?: { code?: number } } })?.response
  return maybeResponse?.status === 404 || maybeResponse?.data?.code === 40400
}
const getErrorMessage = (error: unknown) => {
  return getApiMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

// 获取数据
const fetchData = async () => {
  try {
    const spaceId = Number(props.id)
    if (!spaceId || Number.isNaN(spaceId)) {
      return
    }
    const res = await postSpaceUserList({
      spaceId,
    })
    if (res.data.code === 0 && res.data.data) {
      spaceNotFound.value = false
      dataList.value = res.data.data ?? []
    } else if (res.data.code === 404 || res.data.code === 40400) {
      spaceNotFound.value = true
      dataList.value = []
      message.error(res.data.message ?? '空间不存在')
    } else {
      spaceNotFound.value = false
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      spaceNotFound.value = true
      dataList.value = []
      message.error(getApiMessage(error) ?? '空间不存在')
      return
    }
    spaceNotFound.value = false
    message.error('获取数据失败，' + getErrorMessage(error))
  }
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

// 添加成员表单
const formData = reactive<API.SpaceUserAddRequest>({})

// 创建成员
const handleSubmit = async () => {
  try {
    if (spaceNotFound.value) {
      return
    }
    const spaceId = Number(props.id)
    if (!spaceId || Number.isNaN(spaceId)) {
      return
    }
    const res = await postSpaceUserAdd({
      spaceId,
      ...formData,
    })
    if (res.data.code === 0) {
      message.success('添加成功')
      formData.userId = undefined
      // 刷新数据
      fetchData()
    } else {
      message.error('添加失败，' + res.data.message)
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      spaceNotFound.value = true
      message.error(getApiMessage(error) ?? '空间不存在')
      return
    }
    message.error('添加失败，' + getErrorMessage(error))
  }
}

const handleRoleChange = (value: string, record: API.SpaceUserVO) => {
  editSpaceRole(value, record)
}

// 编辑成员角色
const editSpaceRole = async (value: string, record: API.SpaceUserVO) => {
  try {
    if (spaceNotFound.value) {
      return
    }
    const res = await postSpaceUserEdit({
      id: record.id,
      spaceRole: value,
    })
    if (res.data.code === 0) {
      message.success('修改成功')
    } else {
      message.error('修改失败，' + res.data.message)
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      spaceNotFound.value = true
      message.error(getApiMessage(error) ?? '空间不存在')
      return
    }
    message.error('修改失败，' + getErrorMessage(error))
  }
}

// 删除数据
const doDelete = async (id?: number) => {
  try {
    if (spaceNotFound.value) {
      return
    }
    if (!id) {
      return
    }
    const res = await postSpaceUserOpenApiDelete({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      // 刷新数据
      fetchData()
    } else {
      message.error('删除失败')
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      spaceNotFound.value = true
      message.error(getApiMessage(error) ?? '空间不存在')
      return
    }
    message.error('删除失败，' + getErrorMessage(error))
  }
}
</script>

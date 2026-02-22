<template>
  <div id="spaceUserManagePage" class="page-shell">
    <a-result
      v-if="spaceNotFound"
      status="404"
      title="空间不存在"
      sub-title="该空间可能已被删除或不存在，无法继续管理成员。"
    />
    <template v-else>
      <section class="page-toolbar space-user-toolbar">
        <div class="page-toolbar-main space-user-toolbar-main">
          <div class="space-user-title">
            <p class="space-user-kicker">Space User Manager</p>
            <h2 class="page-title">空间成员管理</h2>
            <p class="page-subtitle">{{ toolbarSubtitle }}</p>
          </div>
          <a-space class="page-toolbar-actions space-user-actions">
            <a-button class="space-user-action-btn" type="primary" :href="`/space/${props.id}`" target="_blank">
              查看空间详情
            </a-button>
            <a-button class="space-user-action-btn" href="/admin/spaceManage">返回空间列表</a-button>
          </a-space>
        </div>
        <div class="mini-kpi-row space-user-kpi-row" aria-label="成员概览">
          <span class="mini-kpi">
            <strong>{{ memberCount }}</strong>
            <span>成员总数</span>
          </span>
          <span class="mini-kpi">
            <strong>{{ adminCount }}</strong>
            <span>管理员</span>
          </span>
          <span class="mini-kpi">
            <strong>{{ editorCount }}</strong>
            <span>编辑者</span>
          </span>
          <span class="mini-kpi">
            <strong>{{ filteredMemberCount }}</strong>
            <span>当前筛选</span>
          </span>
        </div>
      </section>

      <section class="filter-toolbar compact-filter-toolbar space-user-add-toolbar">
        <a-form
          layout="vertical"
          size="small"
          :model="formData"
          class="compact-filter-form"
          @finish="handleSubmit"
        >
          <div class="compact-filter-primary">
            <a-form-item class="compact-filter-search" name="userId">
              <a-input
                v-model:value.number="formData.userId"
                placeholder="输入用户 id 添加到当前空间"
                allow-clear
              />
            </a-form-item>
            <div class="compact-filter-actions">
              <a-button type="primary" html-type="submit">添加用户</a-button>
              <a-button @click="formData.userId = undefined">清空</a-button>
            </div>
          </div>
        </a-form>
      </section>

      <section class="filter-toolbar compact-filter-toolbar space-user-filter-toolbar">
        <div class="compact-filter-primary">
          <a-input
            v-model:value="memberKeyword"
            class="compact-filter-search"
            placeholder="筛选成员昵称 / 账号 / 用户 id"
            allow-clear
          />
          <div class="compact-filter-actions">
            <a-segmented v-model:value="memberRoleFilter" class="role-segment" :options="memberRoleOptions" />

            <div class="density-switch" role="group" aria-label="表格密度">
              <button
                type="button"
                class="density-btn"
                :class="{ 'is-active': tableDensity === 'comfortable' }"
                :aria-pressed="tableDensity === 'comfortable'"
                @click="setTableDensity('comfortable')"
              >
                舒适
              </button>
              <button
                type="button"
                class="density-btn"
                :class="{ 'is-active': tableDensity === 'compact' }"
                :aria-pressed="tableDensity === 'compact'"
                @click="setTableDensity('compact')"
              >
                紧凑
              </button>
            </div>

            <a-button @click="resetMemberFilters">清空筛选</a-button>
          </div>
        </div>

        <div v-if="memberFilterCount > 0" class="active-filter-strip" aria-label="当前成员筛选">
          <span class="active-filter-label">筛选</span>
          <a-tag v-for="item in visibleMemberFilterHints" :key="item">{{ item }}</a-tag>
          <a-tag v-if="hiddenMemberFilterHintCount > 0">+{{ hiddenMemberFilterHintCount }}</a-tag>
        </div>
      </section>

      <section class="content-slab space-user-table-stage">
        <div class="space-user-table-head">
          <div class="table-meta-bar">
            <span class="table-meta-main">空间成员列表</span>
            <span class="table-meta-sub">
              共 {{ memberCount }} 位成员 · 管理员 {{ adminCount }} 位 · 当前显示 {{ filteredMemberCount }} 位
            </span>
          </div>
          <p v-if="resultHint" class="result-tip">{{ resultHint }}</p>
        </div>

        <div class="table-wrap">
          <a-table :columns="columns" :data-source="filteredDataList" :size="tableSize" :scroll="{ x: 860 }">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'userInfo'">
                <div class="member-user-cell">
                  <a-avatar :src="record.user?.userAvatar || undefined">
                    {{ record.user?.userName?.slice(0, 1) || 'U' }}
                  </a-avatar>
                  <div>
                    <p class="member-user-name">{{ record.user?.userName || '未命名用户' }}</p>
                    <p class="member-user-id">ID {{ record.user?.id ?? record.userId ?? '--' }}</p>
                  </div>
                </div>
              </template>
              <template v-if="column.dataIndex === 'spaceRole'">
                <a-select
                  :value="record.spaceRole"
                  :options="SPACE_ROLE_OPTIONS"
                  class="role-select"
                  @change="handleRoleChange($event, record)"
                />
              </template>
              <template v-else-if="column.dataIndex === 'createTime'">
                {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space wrap>
                  <a-button
                    type="link"
                    danger
                    :disabled="isLastAdmin(record)"
                    @click="doDelete(record.id, record)"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </section>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { SPACE_ROLE_OPTIONS } from '@/constants/space.ts'
import {
  postSpaceUserAdd,
  postSpaceUserOpenApiDelete,
  postSpaceUserEdit,
  postSpaceUserList,
} from '@/api/spaceUser'
import dayjs from 'dayjs'

type Density = 'comfortable' | 'compact'

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
    width: 170,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 90,
  },
]

const dataList = ref<API.SpaceUserVO[]>([])
const spaceNotFound = ref(false)
const memberCount = computed(() => dataList.value.length)
const memberKeyword = ref('')
const memberRoleFilter = ref<'all' | 'admin' | 'editor' | 'viewer'>('all')
const memberRoleOptions = [
  { label: '全部角色', value: 'all' },
  { label: '管理员', value: 'admin' },
  { label: '编辑者', value: 'editor' },
  { label: '浏览者', value: 'viewer' },
]
const tableDensity = ref<Density>('comfortable')
const tableSize = computed(() => (tableDensity.value === 'compact' ? 'small' : 'middle'))
const memberFilterCount = computed(() => {
  let count = 0
  if (memberKeyword.value.trim()) {
    count += 1
  }
  if (memberRoleFilter.value !== 'all') {
    count += 1
  }
  return count
})
const toolbarSubtitle = computed(() => {
  if (memberFilterCount.value > 0) {
    return `当前已启用 ${memberFilterCount.value} 项成员筛选`
  }
  return `空间 #${props.id} · 添加成员并调整角色权限`
})
const resultHint = computed(() => {
  if (filteredMemberCount.value === 0) {
    return '当前筛选条件下暂无成员。'
  }
  if (memberFilterCount.value > 0) {
    return `筛选后显示 ${filteredMemberCount.value} 位成员。`
  }
  return ''
})
const memberFilterHints = computed(() => {
  const hints: string[] = []
  const keyword = memberKeyword.value.trim()
  if (keyword) {
    hints.push(`关键词：${keyword}`)
  }
  if (memberRoleFilter.value !== 'all') {
    const roleText =
      memberRoleFilter.value === 'admin'
        ? '管理员'
        : memberRoleFilter.value === 'editor'
          ? '编辑者'
          : '浏览者'
    hints.push(`角色：${roleText}`)
  }
  return hints
})
const visibleMemberFilterHints = computed(() => memberFilterHints.value.slice(0, 3))
const hiddenMemberFilterHintCount = computed(() =>
  Math.max(0, memberFilterHints.value.length - visibleMemberFilterHints.value.length),
)

const getApiMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}
const isNotFoundError = (error: unknown) => {
  const maybeResponse = (error as { response?: { status?: number; data?: { code?: number } } })?.response
  return maybeResponse?.status === 404 || maybeResponse?.data?.code === 40400
}
const isSpaceNotFoundMessage = (value?: string) => {
  if (!value) {
    return false
  }
  return value.includes('空间') && value.includes('不存在')
}
const isSpaceNotFoundError = (error: unknown) => {
  return isNotFoundError(error) && isSpaceNotFoundMessage(getApiMessage(error))
}
const getErrorMessage = (error: unknown) => {
  return getApiMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

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

onMounted(() => {
  fetchData()
})

const formData = reactive<API.SpaceUserAddRequest>({})
const isAdminRole = (spaceRole?: string) => spaceRole === 'admin'
const adminCount = computed(() => {
  return dataList.value.filter((item) => isAdminRole(item.spaceRole)).length
})
const editorCount = computed(() => {
  return dataList.value.filter((item) => item.spaceRole === 'editor').length
})
const getAdminCount = () => {
  return adminCount.value
}
const filteredDataList = computed(() => {
  const keyword = memberKeyword.value.trim().toLowerCase()
  return dataList.value.filter((item) => {
    if (memberRoleFilter.value !== 'all' && item.spaceRole !== memberRoleFilter.value) {
      return false
    }
    if (!keyword) {
      return true
    }
    const userName = String(item.user?.userName ?? '').toLowerCase()
    const userAccount = String(item.user?.userAccount ?? '').toLowerCase()
    const userId = String(item.user?.id ?? item.userId ?? '').toLowerCase()
    return userName.includes(keyword) || userAccount.includes(keyword) || userId.includes(keyword)
  })
})
const filteredMemberCount = computed(() => filteredDataList.value.length)
const resetMemberFilters = () => {
  memberKeyword.value = ''
  memberRoleFilter.value = 'all'
}
const isLastAdmin = (record: API.SpaceUserVO) => {
  return isAdminRole(record.spaceRole) && getAdminCount() <= 1
}
const setTableDensity = (mode: Density) => {
  tableDensity.value = mode
}

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
      fetchData()
    } else {
      message.error('添加失败，' + res.data.message)
    }
  } catch (error) {
    if (isSpaceNotFoundError(error)) {
      spaceNotFound.value = true
      message.error(getApiMessage(error) ?? '空间不存在')
      return
    }
    message.error('添加失败，' + getErrorMessage(error))
  }
}

const handleRoleChange = async (value: string, record: API.SpaceUserVO) => {
  if (isAdminRole(record.spaceRole) && value !== 'admin' && isLastAdmin(record)) {
    message.warning('至少保留一个管理员')
    return
  }
  await editSpaceRole(value, record)
}

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
      record.spaceRole = value
      message.success('修改成功')
    } else {
      message.error('修改失败，' + res.data.message)
    }
  } catch (error) {
    if (isSpaceNotFoundError(error)) {
      spaceNotFound.value = true
      message.error(getApiMessage(error) ?? '空间不存在')
      return
    }
    message.error('修改失败，' + getErrorMessage(error))
  }
}

const doDelete = async (id?: number, record?: API.SpaceUserVO) => {
  try {
    if (spaceNotFound.value) {
      return
    }
    if (!id) {
      message.warning('成员不存在，无法删除')
      return
    }
    if (record && isLastAdmin(record)) {
      message.warning('至少保留一个管理员')
      return
    }
    const res = await postSpaceUserOpenApiDelete({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error('删除失败，' + res.data.message)
    }
  } catch (error) {
    if (isSpaceNotFoundError(error)) {
      spaceNotFound.value = true
      message.error(getApiMessage(error) ?? '空间不存在')
      return
    }
    message.error('删除失败，' + getErrorMessage(error))
  }
}
</script>

<style scoped>
#spaceUserManagePage {
  margin-bottom: 16px;
}

#spaceUserManagePage .space-user-toolbar {
  position: relative;
  overflow: hidden;
  border-color: #c8d7e7;
  background:
    radial-gradient(130% 100% at 0% -10%, rgb(166 193 220 / 24%) 0%, transparent 56%),
    radial-gradient(120% 92% at 100% -8%, rgb(205 222 240 / 22%) 0%, transparent 54%),
    linear-gradient(180deg, rgb(255 255 255 / 95%) 0%, rgb(242 248 255 / 94%) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    0 10px 22px rgb(31 50 72 / 8%);
}

#spaceUserManagePage .space-user-toolbar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(132deg, rgb(255 255 255 / 20%) 0%, rgb(255 255 255 / 0%) 46%),
    repeating-linear-gradient(122deg, rgb(255 255 255 / 14%) 0 2px, rgb(255 255 255 / 0%) 2px 11px);
  opacity: 0.72;
  pointer-events: none;
}

#spaceUserManagePage .space-user-toolbar-main {
  position: relative;
  z-index: 1;
}

#spaceUserManagePage .space-user-title {
  display: grid;
  gap: 4px;
}

#spaceUserManagePage .space-user-kicker {
  margin: 0;
  width: fit-content;
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid #ccdaea;
  background: linear-gradient(180deg, #ffffff 0%, #edf5fd 100%);
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  color: #3d5b7b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

#spaceUserManagePage .space-user-actions {
  position: relative;
  z-index: 1;
}

#spaceUserManagePage .space-user-action-btn {
  min-height: 30px;
  border-radius: 999px;
  border-color: #c8d8e9;
  background: linear-gradient(180deg, #fafdff 0%, #eef5fc 100%);
  color: #2f4b69;
  font-size: 12px;
}

#spaceUserManagePage .space-user-action-btn:hover,
#spaceUserManagePage .space-user-action-btn:focus {
  border-color: #abc0d7;
  background: #e4eef8;
  color: #1f3852;
}

#spaceUserManagePage .space-user-kpi-row {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  gap: 8px;
}

#spaceUserManagePage .space-user-add-toolbar,
#spaceUserManagePage .space-user-filter-toolbar {
  border-color: #ccdbea;
  background:
    radial-gradient(120% 96% at 100% 0%, rgb(201 219 238 / 14%) 0%, transparent 56%),
    linear-gradient(180deg, #fbfdff 0%, #f2f7fd 100%);
}

#spaceUserManagePage .role-segment {
  background: rgb(236 243 251 / 80%);
  border-radius: 999px;
}

#spaceUserManagePage .density-switch {
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid #d3dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

#spaceUserManagePage .density-btn {
  min-height: 24px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #5c748f;
  padding: 0 10px;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

#spaceUserManagePage .density-btn:hover {
  color: #2f4d6c;
  background: #e6f0fa;
}

#spaceUserManagePage .density-btn.is-active {
  color: #203b56;
  background: #dfeaf6;
  font-weight: 600;
}

#spaceUserManagePage .density-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

#spaceUserManagePage .active-filter-strip {
  min-height: 34px;
  border: 1px solid #d2dfec;
  border-radius: 10px;
  background: linear-gradient(180deg, #f8fbff 0%, #edf5fc 100%);
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
}

#spaceUserManagePage .active-filter-strip::-webkit-scrollbar {
  display: none;
}

#spaceUserManagePage .active-filter-label {
  font-size: 11px;
  color: #60758d;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

#spaceUserManagePage .space-user-table-stage {
  display: grid;
  gap: 8px;
  border-color: #cad9e8;
  background:
    radial-gradient(120% 94% at 100% 0%, rgb(201 219 237 / 15%) 0%, transparent 56%),
    linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
}

#spaceUserManagePage .space-user-table-head {
  display: grid;
  gap: 4px;
}

#spaceUserManagePage .result-tip {
  margin: 0;
  font-size: 12px;
  color: #5a728d;
}

#spaceUserManagePage .role-select {
  width: 128px;
}

#spaceUserManagePage .member-user-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

#spaceUserManagePage .member-user-name {
  margin: 0;
  color: #2f4a67;
  font-size: 13px;
  line-height: 1.2;
}

#spaceUserManagePage .member-user-id {
  margin: 2px 0 0;
  color: #6a8097;
  font-size: 12px;
  line-height: 1.2;
}

@media (max-width: 1140px) {
  #spaceUserManagePage .space-user-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  #spaceUserManagePage .compact-filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  #spaceUserManagePage .space-user-toolbar {
    padding: 10px;
  }

  #spaceUserManagePage .space-user-action-btn {
    min-height: 28px;
    font-size: 11px;
  }

  #spaceUserManagePage .space-user-kpi-row .mini-kpi {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
  }

  #spaceUserManagePage .density-switch {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  #spaceUserManagePage .density-btn,
  #spaceUserManagePage .space-user-action-btn {
    transition: none !important;
  }
}
</style>

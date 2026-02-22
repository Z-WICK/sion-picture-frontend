<template>
  <div id="adminUserManagePage" class="page-shell">
    <section class="page-toolbar admin-user-toolbar">
      <div class="page-toolbar-main admin-user-toolbar-main">
        <div class="admin-user-title">
          <p class="admin-user-kicker">Admin User Manager</p>
          <h2 class="page-title">用户管理</h2>
          <p class="page-subtitle">{{ toolbarSubtitle }}</p>
        </div>
        <a-space class="page-toolbar-actions admin-user-actions">
          <a-button class="admin-action-btn" @click="fetchData">刷新列表</a-button>
        </a-space>
      </div>

      <div class="mini-kpi-row admin-user-kpi-row" aria-label="用户列表概览">
        <span class="mini-kpi">
          <strong>{{ total }}</strong>
          <span>用户总量</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ dataList.length }}</strong>
          <span>当前页</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ adminCount }}</strong>
          <span>管理员</span>
        </span>
        <span class="mini-kpi">
          <strong>{{ normalUserCount }}</strong>
          <span>普通用户</span>
        </span>
      </div>
    </section>

    <section class="filter-toolbar compact-filter-toolbar admin-user-filter-toolbar">
      <a-form
        layout="vertical"
        size="small"
        :model="searchParams"
        class="compact-filter-form"
        @finish="doSearch"
      >
        <div class="compact-filter-primary">
          <a-form-item class="compact-filter-search" name="userAccount">
            <a-input-search
              v-model:value="searchParams.userAccount"
              placeholder="搜索用户账号"
              allow-clear
              :enter-button="false"
              @search="doSearch"
            />
          </a-form-item>
          <div class="compact-filter-actions">
            <a-segmented v-model:value="quickRoleValue" class="role-segment" :options="roleQuickOptions" />

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

            <a-button class="toolbar-toggle-btn" @click="showAdvancedFilters = !showAdvancedFilters">
              {{ showAdvancedFilters ? '收起' : '筛选' }}
              <span v-if="activeFilterCount" class="toolbar-count-pill">{{ activeFilterCount }}</span>
            </a-button>
            <a-button type="primary" html-type="submit">应用</a-button>
            <a-button @click="resetSearch">重置</a-button>
          </div>
        </div>

        <div v-if="activeFilterCount > 0" class="active-filter-strip" aria-label="当前筛选条件">
          <span class="active-filter-label">筛选</span>
          <a-tag v-for="item in visibleFilterHints" :key="item">{{ item }}</a-tag>
          <a-tag v-if="hiddenFilterHintCount > 0">+{{ hiddenFilterHintCount }}</a-tag>
        </div>

        <transition name="toolbar-fold">
          <div v-if="showAdvancedFilters" class="advanced-filter-panel">
            <div class="advanced-filter-grid">
              <a-form-item class="advanced-col-4" name="userName">
                <a-input v-model:value="searchParams.userName" placeholder="用户名（模糊匹配）" allow-clear />
              </a-form-item>
              <a-form-item class="advanced-col-4" name="userRole">
                <a-select
                  v-model:value="searchParams.userRole"
                  placeholder="用户角色"
                  :options="roleSelectOptions"
                  allow-clear
                />
              </a-form-item>
            </div>
          </div>
        </transition>
      </a-form>
    </section>

    <section class="content-slab admin-user-table-stage">
      <div class="admin-user-table-head">
        <div class="table-meta-bar">
          <span class="table-meta-main">账号与角色列表</span>
          <span class="table-meta-sub">
            <template v-if="activeFilterCount > 0">
              筛选中 · 共 {{ total }} 条 · 当前页 {{ dataList.length }} 条
            </template>
            <template v-else>
              共 {{ total }} 条记录 · 当前页 {{ dataList.length }} 条
            </template>
          </span>
        </div>
        <p v-if="resultHint" class="result-tip">{{ resultHint }}</p>
      </div>

      <div class="table-wrap">
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          :size="tableSize"
          :scroll="{ x: 1020 }"
          @change="doTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'userAvatar'">
              <a-avatar :size="44" :src="record.userAvatar || undefined">
                {{ record.userName?.slice(0, 1) || 'U' }}
              </a-avatar>
            </template>
            <template v-else-if="column.dataIndex === 'userRole'">
              <a-tag class="role-tag" :class="{ 'is-admin': record.userRole === 'admin' }">
                {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'createTime'">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button danger @click="doDelete(record.id)">删除</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { postUserOpenApiDelete, postUserListPageVo } from '@/api/user'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

type Density = 'comfortable' | 'compact'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    width: 170,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    width: 140,
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    width: 90,
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    ellipsis: true,
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    width: 110,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 170,
  },
  {
    title: '操作',
    key: 'action',
    width: 90,
    fixed: 'right',
  },
]

const dataList = ref<API.UserVO[]>([])
const total = ref(0)
const showAdvancedFilters = ref(false)
const tableDensity = ref<Density>('comfortable')
const roleQuickOptions = [
  { label: '全部', value: 'all' },
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
]
const roleSelectOptions = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
]
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',
})
const quickRoleValue = computed<'all' | 'admin' | 'user'>({
  get: () => {
    if (!searchParams.userRole) {
      return 'all'
    }
    return searchParams.userRole === 'admin' ? 'admin' : 'user'
  },
  set: (value) => {
    searchParams.userRole = value === 'all' ? undefined : value
    doSearch()
  },
})
const activeFilterCount = computed(() => {
  let count = 0
  if (searchParams.userAccount?.trim()) {
    count += 1
  }
  if (searchParams.userName?.trim()) {
    count += 1
  }
  if (searchParams.userRole?.trim()) {
    count += 1
  }
  return count
})
const adminCount = computed(() => {
  return dataList.value.filter((item) => item.userRole === 'admin').length
})
const normalUserCount = computed(() => {
  return dataList.value.filter((item) => item.userRole !== 'admin').length
})
const toolbarSubtitle = computed(() => {
  if (activeFilterCount.value > 0) {
    return `当前已启用 ${activeFilterCount.value} 项筛选条件`
  }
  return '账号检索与角色检查'
})
const resultHint = computed(() => {
  if (total.value === 0) {
    return '暂无匹配账号，可尝试放宽筛选条件。'
  }
  if (activeFilterCount.value > 0) {
    return `当前筛选命中 ${total.value} 条账号记录。`
  }
  return ''
})
const tableSize = computed(() => (tableDensity.value === 'compact' ? 'small' : 'middle'))
const filterHints = computed(() => {
  const hints: string[] = []
  const account = searchParams.userAccount?.trim()
  if (account) {
    hints.push(`账号：${account}`)
  }
  const name = searchParams.userName?.trim()
  if (name) {
    hints.push(`用户名：${name}`)
  }
  if (searchParams.userRole?.trim()) {
    hints.push(`角色：${searchParams.userRole === 'admin' ? '管理员' : '普通用户'}`)
  }
  return hints
})
const visibleFilterHints = computed(() => filterHints.value.slice(0, 3))
const hiddenFilterHintCount = computed(() =>
  Math.max(0, filterHints.value.length - visibleFilterHints.value.length),
)

const setTableDensity = (mode: Density) => {
  tableDensity.value = mode
}

const fetchData = async () => {
  try {
    const res = await postUserListPageVo({
      ...searchParams,
    })
    if (res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取数据失败' + res.data.message)
    }
  } catch (error) {
    const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
    const errorMessage =
      maybeResponse?.data?.message ?? (error instanceof Error ? error.message : String(error))
    message.error('获取数据失败，' + errorMessage)
  }
}

onMounted(() => {
  fetchData()
})

const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (count: number) => `共 ${count} 条`,
  }
})

const doTableChange = (page: TablePaginationConfig) => {
  searchParams.current = page.current ?? 1
  searchParams.pageSize = page.pageSize ?? searchParams.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const resetSearch = () => {
  searchParams.userAccount = undefined
  searchParams.userName = undefined
  searchParams.userRole = undefined
  showAdvancedFilters.value = false
  doSearch()
}

const doDelete = async (id?: number) => {
  if (!id) {
    message.warning('请先选择用户')
    return
  }
  try {
    const res = await postUserOpenApiDelete({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error('删除失败，' + res.data.message)
    }
  } catch (error) {
    const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
    const errorMessage =
      maybeResponse?.data?.message ?? (error instanceof Error ? error.message : String(error))
    message.error('删除失败，' + errorMessage)
  }
}
</script>

<style scoped>
#adminUserManagePage {
  margin-bottom: 16px;
}

#adminUserManagePage .admin-user-toolbar {
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

#adminUserManagePage .admin-user-toolbar::after {
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

#adminUserManagePage .admin-user-toolbar-main {
  position: relative;
  z-index: 1;
}

#adminUserManagePage .admin-user-title {
  display: grid;
  gap: 4px;
}

#adminUserManagePage .admin-user-kicker {
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

#adminUserManagePage .admin-user-actions {
  position: relative;
  z-index: 1;
}

#adminUserManagePage .admin-action-btn {
  min-height: 30px;
  border-radius: 999px;
  border-color: #c8d8e9;
  background: linear-gradient(180deg, #fafdff 0%, #eef5fc 100%);
  color: #2f4b69;
  font-size: 12px;
}

#adminUserManagePage .admin-action-btn:hover,
#adminUserManagePage .admin-action-btn:focus {
  border-color: #abc0d7;
  background: #e4eef8;
  color: #1f3852;
}

#adminUserManagePage .admin-user-kpi-row {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  gap: 8px;
}

#adminUserManagePage .admin-user-filter-toolbar {
  border-color: #ccdbea;
  background:
    radial-gradient(120% 96% at 100% 0%, rgb(201 219 238 / 14%) 0%, transparent 56%),
    linear-gradient(180deg, #fbfdff 0%, #f2f7fd 100%);
}

#adminUserManagePage .role-segment {
  background: rgb(236 243 251 / 80%);
  border-radius: 999px;
}

#adminUserManagePage .density-switch {
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid #d3dfec;
  background: linear-gradient(180deg, #ffffff 0%, #edf4fc 100%);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

#adminUserManagePage .density-btn {
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

#adminUserManagePage .density-btn:hover {
  color: #2f4d6c;
  background: #e6f0fa;
}

#adminUserManagePage .density-btn.is-active {
  color: #203b56;
  background: #dfeaf6;
  font-weight: 600;
}

#adminUserManagePage .density-btn:focus-visible {
  outline: 2px solid #6d8fb2;
  outline-offset: 2px;
}

#adminUserManagePage .active-filter-strip {
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

#adminUserManagePage .active-filter-strip::-webkit-scrollbar {
  display: none;
}

#adminUserManagePage .active-filter-label {
  font-size: 11px;
  color: #60758d;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

#adminUserManagePage .admin-user-table-stage {
  display: grid;
  gap: 8px;
  border-color: #cad9e8;
  background:
    radial-gradient(120% 94% at 100% 0%, rgb(201 219 237 / 15%) 0%, transparent 56%),
    linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
}

#adminUserManagePage .admin-user-table-head {
  display: grid;
  gap: 4px;
}

#adminUserManagePage .result-tip {
  margin: 0;
  font-size: 12px;
  color: #5a728d;
}

#adminUserManagePage .role-tag {
  min-width: 76px;
  text-align: center;
  border-color: #bfd1e4;
  background: #e7f0fa;
  color: #355273;
}

#adminUserManagePage .role-tag.is-admin {
  border-color: #9eb8d2;
  background: #dce9f7;
  color: #1f3c58;
}

@media (max-width: 1140px) {
  #adminUserManagePage .admin-user-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  #adminUserManagePage .compact-filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  #adminUserManagePage .admin-user-toolbar {
    padding: 10px;
  }

  #adminUserManagePage .admin-action-btn {
    min-height: 28px;
    font-size: 11px;
  }

  #adminUserManagePage .admin-user-kpi-row .mini-kpi {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
  }

  #adminUserManagePage .density-switch {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  #adminUserManagePage .density-btn,
  #adminUserManagePage .admin-action-btn {
    transition: none !important;
  }
}
</style>

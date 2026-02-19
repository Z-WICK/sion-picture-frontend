<template>
  <div id="userProfilePage">
    <h2 class="title">个人信息</h2>
    <div class="desc">修改昵称、头像和简介</div>
    <a-form :model="formState" layout="vertical" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userName" label="昵称" :rules="[{ required: true, message: '请输入昵称' }]">
        <a-input
          v-model:value="formState.userName"
          :maxlength="30"
          placeholder="请输入昵称"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="userAvatar" label="头像链接">
        <a-input
          v-model:value="formState.userAvatar"
          :maxlength="512"
          placeholder="请输入头像 URL"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="userProfile" label="个人简介">
        <a-textarea
          v-model:value="formState.userProfile"
          :maxlength="200"
          :auto-size="{ minRows: 4, maxRows: 6 }"
          placeholder="请输入个人简介"
          show-count
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitting">保存</a-button>
          <a-button @click="resetForm">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { postUserEdit } from '@/api/user'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()
const submitting = ref(false)

const formState = reactive<API.UserEditRequest>({
  userName: '',
  userAvatar: '',
  userProfile: '',
})

const fillFormFromLoginUser = () => {
  const user = loginUserStore.loginUser
  formState.userName = user.userName ?? ''
  formState.userAvatar = user.userAvatar ?? ''
  formState.userProfile = user.userProfile ?? ''
}

const toLoginWithRedirect = async () => {
  await router.replace(`/user/login?redirect=${encodeURIComponent('/user/profile')}`)
}

const getApiErrorMessage = (error: unknown) => {
  const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
  return maybeResponse?.data?.message
}

const getErrorMessage = (error: unknown) => {
  return getApiErrorMessage(error) ?? (error instanceof Error ? error.message : String(error))
}

const resetForm = () => {
  fillFormFromLoginUser()
}

const handleSubmit = async () => {
  const name = formState.userName?.trim()
  if (!name) {
    message.error('请输入昵称')
    return
  }
  submitting.value = true
  try {
    const res = await postUserEdit({
      userName: name,
      userAvatar: formState.userAvatar?.trim() || undefined,
      userProfile: formState.userProfile?.trim() || undefined,
    })
    if (res.data.code === 0) {
      await loginUserStore.fetchLoginUser()
      fillFormFromLoginUser()
      message.success('保存成功')
    } else {
      message.error('保存失败：' + res.data.message)
    }
  } catch (error) {
    message.error('保存失败：' + getErrorMessage(error))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loginUserStore.fetchLoginUser()
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await toLoginWithRedirect()
    return
  }
  fillFormFromLoginUser()
})
</script>

<style scoped>
#userProfilePage {
  max-width: 680px;
  margin: 0 auto;
}

.title {
  margin-bottom: 8px;
}

.desc {
  color: #888;
  margin-bottom: 16px;
}
</style>

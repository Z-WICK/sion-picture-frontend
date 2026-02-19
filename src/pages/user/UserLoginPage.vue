<template>
  <div id="userLoginPage">
    <h2 class="title">Sion云图库 - 用户登录</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <div class="tips">
        没有账号？
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { postUser } from '@/api/user'
import { message } from 'ant-design-vue'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()

const getSafeRedirectPath = () => {
  const redirectParam = route.query.redirect
  if (typeof redirectParam !== 'string' || !redirectParam) {
    return '/'
  }
  const decodedRedirect = decodeURIComponent(redirectParam)
  try {
    const redirectUrl = new URL(decodedRedirect, window.location.origin)
    if (redirectUrl.origin !== window.location.origin) {
      return '/'
    }
    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}` || '/'
  } catch {
    return decodedRedirect.startsWith('/') ? decodedRedirect : '/'
  }
}

const handleSubmit = async (values: API.UserLoginRequest) => {
  const res = await postUser(values)
  // 登录成功，把登录状态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    const redirectPath = getSafeRedirectPath()
    const loginUserRole = loginUserStore.loginUser.userRole
    const targetPath =
      redirectPath.startsWith('/admin') && loginUserRole !== 'admin' ? '/' : redirectPath
    router.replace({
      path: targetPath,
      replace: true,
    })
  } else {
    message.error('登录失败' + res.data.message)
  }
}
</script>

<style>
#userLoginPage {
  max-width: 360px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 16px;
}

.desc {
  text-align: center;
  color: #bbb;
  margin-bottom: 16px;
}

.tips {
  margin-bottom: 16px;
  color: #bbb;
  font-size: 13px;
  text-align: right;
}
</style>
